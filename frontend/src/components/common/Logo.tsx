import React from 'react'

interface LogoProps {
  className?: string
  size?: number
  showText?: boolean
  subtitle?: boolean
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 32,
  showText = true,
  subtitle = false
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon: Minimalist Neural Diamond + Human Silhouette + Document Node */}
      <div 
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-charcoal-light to-obsidian border border-emerald-500/30 shadow-md shadow-emerald-950/40 shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5"
        >
          {/* Document / Resume outline */}
          <path
            d="M8 6C8 4.89543 8.89543 4 10 4H18L24 10V26C24 27.1046 23.1046 28 22 28H10C8.89543 28 8 27.1046 8 26V6Z"
            stroke="#8FB9A8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-40"
          />
          {/* Folded corner */}
          <path
            d="M18 4V10H24"
            stroke="#8FB9A8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-40"
          />
          {/* AI Neural Node Center / Smart Match Spark */}
          <circle cx="16" cy="17" r="3.5" fill="#00B894" />
          <path
            d="M16 11V13.5M16 20.5V23M10.5 17H13M19 17H21.5"
            stroke="#00B894"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Champagne Gold AI Talent Spark */}
          <circle cx="21" cy="9" r="1.5" fill="#E8C97A" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-base tracking-tight text-warm-white font-sans">
              Hire<span className="text-emerald-400">Sense</span>
            </span>
          </div>
          {subtitle && (
            <span className="text-[10px] font-medium text-sage-muted tracking-tight">
              Smarter Screening. Better Hiring.
            </span>
          )}
        </div>
      )}
    </div>
  )
}
