import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Logo } from '@/components/common/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Briefcase, User } from 'lucide-react'
import toast from 'react-hot-toast'

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'recruiter' | 'candidate'>('recruiter')
  const [loading, setLoading] = useState(false)
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      await register(email.trim().toLowerCase(), password, fullName.trim(), role)
      toast.success('Registration successful!')
      if (role === 'recruiter') navigate('/recruiter')
      else navigate('/candidate')
    } catch {
      toast.error('Registration failed. Email may already be in use.')
    } finally {
      setLoading(false)
    }
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
            <CardTitle className="text-lg font-bold text-warm-white">Create Account</CardTitle>
            <CardDescription className="text-xs text-sage-muted">Select role and register to begin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-sage-muted">Account Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('recruiter')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      role === 'recruiter'
                        ? 'border-emerald bg-emerald-500/10 text-emerald font-bold'
                        : 'border-obsidian-border bg-charcoal-light text-sage-muted hover:border-sage'
                    }`}
                  >
                    <Briefcase className="w-5 h-5 text-emerald" />
                    <span className="text-xs">Recruiter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('candidate')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      role === 'candidate'
                        ? 'border-champagne bg-champagne/10 text-champagne font-bold'
                        : 'border-obsidian-border bg-charcoal-light text-sage-muted hover:border-sage'
                    }`}
                  >
                    <User className="w-5 h-5 text-champagne" />
                    <span className="text-xs">Candidate</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-sage-muted">Full Name</Label>
                <Input
                  id="name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="text-xs bg-charcoal-light border-obsidian-border text-warm-white focus:border-emerald"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-sage-muted">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="text-xs bg-charcoal-light border-obsidian-border text-warm-white focus:border-emerald"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-sage-muted">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-xs bg-charcoal-light border-obsidian-border text-warm-white focus:border-emerald"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-emerald hover:bg-emerald-600 text-obsidian font-bold text-xs h-10" disabled={loading}>
                {loading ? 'Creating Profile...' : 'Complete Registration'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-sage-muted">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-emerald hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
