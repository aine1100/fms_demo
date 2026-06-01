'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { resetPassword, isLoading, error, clearError } = useAuthStore()
  
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [success, setSuccess] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.slice(0, 6).split('')
      const newOtp = [...otp]
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit
        }
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
    setValidationError('')
    
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters')
      return
    }
    
    const otpString = otp.join('')
    const result = await resetPassword(otpString, password)
    if (result) {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                <Flame className="h-7 w-7 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">FMS</span>
            </Link>
          </div>

          <Card className="border-border shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <h2 className="text-xl font-bold">Password reset successful</h2>
                <p className="text-muted-foreground text-sm">
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>
                <Button className="w-full" onClick={() => router.push('/login')}>
                  Continue to sign in
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

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
            <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
            <CardDescription>
              Enter the code sent to your email and create a new password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(error || validationError) && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
                  {error || validationError}
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Reset Code</Label>
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
                      onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-10 h-10 text-center text-lg font-semibold"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || otp.join('').length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset password'
                )}
              </Button>
            </form>

            <div className="mt-6">
              <Link 
                href="/login" 
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>

            {/* Demo hint */}
            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-center text-sm text-muted-foreground">
              Demo OTP: <span className="font-mono font-medium">123456</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
