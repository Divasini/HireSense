import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exportCandidatesCSV, exportCandidatesExcel } from '@/api/exports'
import toast from 'react-hot-toast'

export const ExportButton: React.FC<{ jobId: string }> = ({ jobId }) => {
  const [loading, setLoading] = useState(false)

  const handleExportCSV = async () => {
    try {
      setLoading(true)
      const blob = await exportCandidatesCSV(jobId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hiresense_candidates_${jobId}.csv`
      a.click()
      toast.success('CSV export downloaded')
    } catch {
      toast.error('Failed to export CSV')
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = async () => {
    try {
      setLoading(true)
      const blob = await exportCandidatesExcel(jobId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hiresense_candidates_${jobId}.xlsx`
      a.click()
      toast.success('Excel export downloaded')
    } catch {
      toast.error('Failed to export Excel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs bg-charcoal border-obsidian-border text-warm-white hover:bg-charcoal-light" disabled={loading}>
          <Download className="w-3.5 h-3.5 text-emerald" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-charcoal border-obsidian-border text-warm-white">
        <DropdownMenuItem onClick={handleExportCSV} className="gap-2 text-xs hover:bg-charcoal-light cursor-pointer">
          <FileText className="w-4 h-4 text-sage" />
          Export as CSV (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel} className="gap-2 text-xs hover:bg-charcoal-light cursor-pointer">
          <FileSpreadsheet className="w-4 h-4 text-emerald" />
          Export as Excel (.xlsx)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
