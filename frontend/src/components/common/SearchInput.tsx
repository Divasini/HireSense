import React from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

import { cn } from '@/lib/utils'

interface SearchInputProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search candidates, skills, positions...',
  className
}) => {
  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-muted" />
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8 h-9 text-xs bg-charcoal border-obsidian-border text-warm-white placeholder:text-sage-muted focus:border-emerald focus:ring-emerald"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sage-muted hover:text-warm-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
