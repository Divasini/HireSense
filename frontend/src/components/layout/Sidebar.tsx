import React, { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Logo } from '../common/Logo'
import { cn } from '../../lib/utils'
import {
  LayoutDashboard,
  Briefcase,
  Upload,
  Users,
  BarChart2,
  Bell,
  FileText,
  FileSearch,
  Settings,
  Shield,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from 'lucide-react'
import { getMyProfile } from '../../api/candidates'

export function Sidebar() {
  const { user } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [hasResume, setHasResume] = useState(false)
  const [appsCount, setAppsCount] = useState(0)

  React.useEffect(() => {
    if (user?.role === 'candidate') {
      getMyProfile().then(data => {
        setHasResume(data?.has_resume === true)
        setAppsCount(data?.applications_count || 0)
      }).catch(() => {})
    }
  }, [user])

  const commonClasses = "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold text-sage-muted hover:text-warm-white hover:bg-charcoal-light"
  const activeClasses = "bg-emerald text-obsidian font-bold hover:bg-emerald hover:text-obsidian shadow-sm shadow-emerald-950/40"

  const recruiterLinks = [
    { to: "/recruiter", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/recruiter/jobs", icon: Briefcase, label: "Job Positions" },
    { to: "/recruiter/upload", icon: Upload, label: "Upload Resumes" },
    { to: "/recruiter/ranking", icon: Users, label: "Candidate Ranking" },
    { to: "/recruiter/skill-gap", icon: FileSearch, label: "Skill Gap Analysis" },
    { to: "/recruiter/what-if", icon: SlidersHorizontal, label: "What-If Simulator" },
    { to: "/recruiter/analytics", icon: BarChart2, label: "Recruitment Analytics" },
    { to: "/recruiter/notifications", icon: Bell, label: "Notifications" }
  ]

  const candidateLinks = [
    { to: "/candidate", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/candidate/profile", icon: Users, label: "My Profile" },
    { to: "/candidate/resume", icon: FileText, label: "My Resume" },
    { to: "/candidate/quality", icon: CheckCircle2, label: "Resume Quality" },
    { to: "/candidate/ats-score", icon: Shield, label: "ATS Score" },
    { to: "/candidate/recommended-jobs", icon: Briefcase, label: "Job Matches" },
    { to: "/candidate/applications", icon: FileSearch, label: "My Applications" },
    { to: "/candidate/interview-prep", icon: SlidersHorizontal, label: "Interview Prep" },
    { to: "/candidate/notifications", icon: Bell, label: "Notifications" },
    { to: "/candidate/settings", icon: Settings, label: "Settings" }
  ]

  const adminLinks = [
    { to: "/admin", icon: LayoutDashboard, label: "Admin Dashboard", end: true },
    { to: "/admin/users", icon: Users, label: "User Governance" },
    { to: "/admin/jobs", icon: Briefcase, label: "All Job Positions" },
    { to: "/admin/audit-logs", icon: Shield, label: "AI Decision Audit" },
    { to: "/admin/settings", icon: Settings, label: "System Parameters" }
  ]

  const links = user?.role === 'recruiter' ? recruiterLinks 
    : user?.role === 'candidate' ? candidateLinks 
    : user?.role === 'admin' ? adminLinks : recruiterLinks

  return (
    <aside className={cn(
      "h-screen bg-obsidian border-r border-obsidian-border flex flex-col justify-between transition-all duration-300 select-none z-20 shrink-0",
      collapsed ? "w-16" : "w-64"
    )}>
      <div>
        {/* Logo Banner */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-obsidian-border">
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <Logo size={32} showText={!collapsed} subtitle={false} />
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-sage-muted hover:text-warm-white p-1 rounded-md transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Role Tag & Navigation */}
        <div className="p-3 space-y-1">
          {!collapsed && (
            <div className="px-3 py-1.5 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sage-muted">
                {user?.role ? `${user.role} command center` : 'Recruitment Portal'}
              </span>
            </div>
          )}

          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => cn(commonClasses, isActive && activeClasses)}
                title={collapsed ? link.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && (
                  <span className="truncate flex-1">
                    {link.label}
                  </span>
                )}
              </NavLink>
            )
          })}
        </div>
      </div>

      {/* User Badge Footer */}
      {!collapsed ? (
        <div className="p-3.5 border-t border-obsidian-border bg-charcoal m-2 rounded-xl border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald font-bold text-xs flex items-center justify-center border border-emerald-500/30 shrink-0">
              {(user?.full_name || 'U').charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-warm-white truncate">{user?.full_name || 'Recruiter'}</p>
              <p className="text-[10px] text-sage-muted capitalize font-medium">{user?.role || 'Recruiter'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-obsidian-border flex justify-center">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald font-bold text-xs flex items-center justify-center border border-emerald-500/30">
            {(user?.full_name || 'U').charAt(0)}
          </div>
        </div>
      )}
    </aside>
  )
}
