'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame, Loader2 } from 'lucide-react'
import type { UserRole } from '@/lib/types'

// Maps backend role values to their portal routes
const ROLE_ROUTES: Record<UserRole, string> = {
  super_admin: '/admin',
  company: '/company',
  customer: '/customer',
  inspector: '/inspector',
}

export default function VerifyOTPPage() {
  const router = useRouter()
  const { user, _pendingEmail, verifyOtp, isLoading, error, clearError } = useAuthStore()

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.slice(0, 6).split('')
      const newOtp = [...otp]
      digits.forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit
      })
      setOtp(newOtp)
      const nextIndex = Math.min(index + digits.length, 5)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const otpString = otp.join('')
    if (otpString.length !== 6) return

    // Pass the pending email (set during registration) or the logged-in user's email
    const email = _pendingEmail || user?.email || ''
    const success = await verifyOtp(otpString, email)

    if (success) {
      if (user) {
        // Already logged in — go to their portal
        router.push(ROLE_ROUTES[user.role] ?? '/login')
      } else {
        // Just verified after registration — go to login
        router.push('/login')
      }
    }
  }

  const displayEmail = _pendingEmail || user?.email || 'your email'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <Flame className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">FMS</span>
          </Link>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
            <CardDescription>
              {"We've sent a 6-digit code to"}<br />
              <span className="font-medium text-foreground">{displayEmail}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
                  {error}
                </div>
              )}

              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-semibold"
                  />
                ))}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || otp.join('').length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify email'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {"Didn't receive the code? "}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => {
                  // Could trigger resend here
                }}
              >
                Click to resend
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
