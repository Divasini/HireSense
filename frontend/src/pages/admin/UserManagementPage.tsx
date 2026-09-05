import React, { useEffect, useState } from 'react'
import { getUsers, updateUserRole } from '@/api/admin'
import { User } from '@/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Users, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    getUsers().then(data => setUsers(data || []))
  }, [])

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole)
      toast.success(`Role updated to ${newRole}`)
      const updated = await getUsers()
      setUsers(updated || [])
    } catch {
      toast.error('Failed to update role')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2.5">
          <Users className="w-6 h-6 text-emerald-400" />
          User Management
        </h1>
        <p className="text-xs text-sage-muted">Manage user accounts and role-based permissions</p>
      </div>

      <div className="rounded-xl border border-emerald-500/10 bg-charcoal shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-charcoal-light/80">
            <TableRow className="border-b border-emerald-500/10">
              <TableHead className="text-xs text-sage-muted">User Name</TableHead>
              <TableHead className="text-xs text-sage-muted">Email Address</TableHead>
              <TableHead className="text-xs text-sage-muted">Role</TableHead>
              <TableHead className="text-xs text-sage-muted">Status</TableHead>
              <TableHead className="text-right text-xs text-sage-muted">Role Assignment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id} className="hover:bg-emerald-500/[0.03] border-b border-emerald-500/10">
                <TableCell className="font-semibold text-xs text-warm-white">{u.full_name}</TableCell>
                <TableCell className="text-xs text-sage-muted font-mono">{u.email}</TableCell>
                <TableCell className="text-xs capitalize font-bold text-emerald-400">{u.role}</TableCell>
                <TableCell><StatusBadge status={u.is_active ? 'active' : 'disabled'} /></TableCell>
                <TableCell className="text-right">
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    className="h-8 px-2.5 text-xs border border-emerald-500/20 rounded-md bg-charcoal-light text-warm-white outline-none focus:border-emerald-500"
                  >
                    <option value="recruiter" className="bg-charcoal">Recruiter</option>
                    <option value="candidate" className="bg-charcoal">Candidate</option>
                    <option value="admin" className="bg-charcoal">Admin</option>
                  </select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
