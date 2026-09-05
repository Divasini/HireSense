import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Logo } from '@/components/common/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lock, Mail, UserCheck, ShieldCheck, User } from 'lucide-react'
import toast from 'react-hot-toast'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()

  // If already authenticated, redirect to the user's dashboard
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin', { replace: true })
      else if (user.role === 'candidate') navigate('/candidate', { replace: true })
      else navigate('/recruiter', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      await login(email.trim(), password)
      
      const currentUser = useAuthStore.getState().user
      if (!currentUser) {
        throw new Error('User profile could not be loaded after sign-in')
      }

      toast.success('Signed in successfully!')
      
      if (currentUser.role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (currentUser.role === 'candidate') {
        navigate('/candidate', { replace: true })
      } else {
        navigate('/recruiter', { replace: true })
      }
    } catch (err: any) {
      console.error('Sign-in error:', err)
      const detail = err?.response?.data?.detail
      const message = typeof detail === 'string' ? detail : (err?.message || 'Invalid email or password')
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = (demoEmail: string, demoRole: string) => {
    setEmail(demoEmail)
    setPassword(demoRole === 'admin' ? 'admin123' : demoRole === 'recruiter' ? 'recruiter123' : 'candidate123')
  }

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <Logo size={40} showText={true} subtitle={true} />
          </Link>
        </div>

        <Card className="bg-charcoal border-obsidian-border shadow-obsidian-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-warm-white">Sign In</CardTitle>
            <CardDescription className="text-xs text-sage-muted">Access the HireSense AI Command Center</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-sage-muted">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-muted" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="pl-9 text-xs bg-charcoal-light border-obsidian-border text-warm-white placeholder:text-sage-muted focus:border-emerald"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-sage-muted">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-muted" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 text-xs bg-charcoal-light border-obsidian-border text-warm-white placeholder:text-sage-muted focus:border-emerald"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-emerald hover:bg-emerald-600 text-obsidian font-bold text-xs h-10" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
              </Button>
            </form>

            {/* Quick Demo Access for Staff Testing */}
            <div className="mt-6 pt-5 border-t border-obsidian-border space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-sage-muted text-center">Staff Testing Access</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs font-medium gap-1.5 bg-charcoal-light border-obsidian-border text-warm-white hover:border-emerald hover:text-emerald"
                  onClick={() => handleQuickLogin('recruiter@recruitment.ai', 'recruiter')}
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald" />
                  Recruiter
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs font-medium gap-1.5 bg-charcoal-light border-obsidian-border text-warm-white hover:border-sage hover:text-sage"
                  onClick={() => handleQuickLogin('admin@recruitment.ai', 'admin')}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-sage" />
                  Admin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-sage-muted">
          Need a new account?{' '}
          <Link to="/register" className="font-semibold text-emerald hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
