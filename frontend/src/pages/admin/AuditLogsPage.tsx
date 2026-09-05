import React, { useEffect, useState } from 'react'
import { getAuditLogs } from '@/api/admin'
import { AuditLog } from '@/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ShieldCheck, Activity } from 'lucide-react'

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([])

  useEffect(() => {
    getAuditLogs().then(data => setLogs(data || []))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2.5">
          <Activity className="w-6 h-6 text-emerald-400" />
          AI Decision Audit Trail
        </h1>
        <p className="text-xs text-sage-muted">Immutable ledger of screening runs, scoring calculations, and recruiter actions</p>
      </div>

      <div className="rounded-xl border border-emerald-500/10 bg-charcoal shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-charcoal-light/80">
            <TableRow className="border-b border-emerald-500/10">
              <TableHead className="text-xs text-sage-muted">Timestamp</TableHead>
              <TableHead className="text-xs text-sage-muted">Action</TableHead>
              <TableHead className="text-xs text-sage-muted">Entity Type</TableHead>
              <TableHead className="text-xs text-sage-muted">Entity ID</TableHead>
              <TableHead className="text-xs text-sage-muted">Payload Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map(log => (
              <TableRow key={log.id} className="hover:bg-emerald-500/[0.03] border-b border-emerald-500/10">
                <TableCell className="text-xs text-sage-muted font-mono">
                  {new Date(log.created_at || Date.now()).toLocaleTimeString()}
                </TableCell>
                <TableCell className="font-bold text-xs text-emerald-400">{log.action}</TableCell>
                <TableCell className="text-xs capitalize text-sage">{log.entity_type}</TableCell>
                <TableCell className="text-xs text-sage-muted font-mono">{log.entity_id || '-'}</TableCell>
                <TableCell className="text-[11px] text-sage-muted font-mono">
                  {JSON.stringify(log.details || {})}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
