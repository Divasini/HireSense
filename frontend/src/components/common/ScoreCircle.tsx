import React from 'react'

interface ScoreCircleProps {
  score: number
  size?: number
  strokeWidth?: number
  isTopRank?: boolean
}

export const ScoreCircle: React.FC<ScoreCircleProps> = ({
  score,
  size = 60,
  strokeWidth = 5,
  isTopRank = false
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)))
  const offset = circumference - (normalizedScore / 100) * circumference

  // Obsidian Intelligence Palette
  let strokeColor = '#00B894' // Rich Emerald (default >= 75%)
  let bgColor = 'rgba(0, 184, 148, 0.12)'
  let textColor = '#F5F3EA'

  if (isTopRank) {
    strokeColor = '#E8C97A' // Champagne Gold for #1
    bgColor = 'rgba(232, 201, 122, 0.15)'
  } else if (normalizedScore >= 90) {
    strokeColor = '#00B894' // Emerald
    bgColor = 'rgba(0, 184, 148, 0.15)'
  } else if (normalizedScore >= 75) {
    strokeColor = '#54DCBD' // Soft Emerald
    bgColor = 'rgba(84, 220, 189, 0.12)'
  } else if (normalizedScore >= 60) {
    strokeColor = '#F39C12' // Warm Amber
    bgColor = 'rgba(243, 156, 18, 0.12)'
  } else {
    strokeColor = '#E17055' // Muted Coral
    bgColor = 'rgba(225, 112, 85, 0.12)'
  }

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#24322C"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span
          className="font-bold tracking-tight"
          style={{ fontSize: size * 0.28, color: isTopRank ? '#E8C97A' : textColor }}
        >
          {normalizedScore}%
        </span>
      </div>
    </div>
  )
}
