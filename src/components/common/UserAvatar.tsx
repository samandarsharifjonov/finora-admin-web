import React, { useState } from 'react'
import { cn } from '../../lib/utils'

interface UserAvatarProps {
  src?: string | null
  name?: string
  email?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'rounded'
  className?: string
}

const sizeClasses = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-16 w-16 text-lg',
}

const shapeClasses = {
  circle: 'rounded-full',
  rounded: 'rounded-xl',
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  email,
  size = 'md',
  shape = 'rounded',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false)
  const initial = (name?.trim()?.charAt(0) || email?.trim()?.charAt(0) || 'U').toUpperCase()
  const shapeClass = shapeClasses[shape] || shapeClasses.rounded

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name || email || 'Foydalanuvchi'}
        onError={() => setImageError(true)}
        className={cn(
          sizeClasses[size],
          shapeClass,
          'shrink-0 object-cover aspect-square overflow-hidden border border-slate-200/80 dark:border-dark-border',
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        sizeClasses[size],
        shapeClass,
        'shrink-0 flex items-center justify-center bg-finora-500/15 font-bold text-finora-700 dark:text-finora-400 border border-finora-500/20 select-none aspect-square overflow-hidden',
        className
      )}
    >
      {initial}
    </div>
  )
}
