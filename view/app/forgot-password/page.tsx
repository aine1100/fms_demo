'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame, ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { forgotPassword, isLoading, error, clearError } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const toastId = toast.loading('Sending reset code...')
    const success = await forgotPassword(email)

    if (success) {
      toast.success('Reset code sent! Check your email.', { id: toastId })
      setSubmitted(true)
    } else {
      const msg = useAuthStore.getState().error || 'Email not found'
      toast.error(msg, { id: toastId })
    }
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
            <CardTitle className="text-2xl font-bold">
              {submitted ? 'Check your email' : 'Forgot password?'}
            </CardTitle>
            <CardDescription>
              {submitted 
                ? `We've sent a password reset link to ${email}`
                : "No worries, we'll send you reset instructions"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="space-y-4">
                <Button 
                  className="w-full" 
                  onClick={() => setTimeout(() => router.push('/reset-password'), 1500)}
                >
                  Enter Reset Code
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={async () => {
                    setSubmitted(false)
                    const toastId = toast.loading('Resending...')
                    const ok = await forgotPassword(email)
                    if (ok) {
                      toast.success('Code resent! Check your email.', { id: toastId })
                      setSubmitted(true)
                    } else {
                      toast.error(useAuthStore.getState().error || 'Failed to resend', { id: toastId })
                    }
                  }}
                >
                  {"Didn't receive the email? Click to resend"}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Reset password'
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6">
              <Link 
                href="/login" 
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
