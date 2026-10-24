import React, { useState } from 'react'

interface UserAvatarProps {
  src?: string | null
  name?: string
  email?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-7 w-7 text-[10px] rounded-lg',
  md: 'h-9 w-9 text-xs rounded-xl',
  lg: 'h-12 w-12 text-sm rounded-xl',
  xl: 'h-16 w-16 text-lg rounded-2xl',
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  email,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false)
  const initial = (name?.trim()?.charAt(0) || email?.trim()?.charAt(0) || 'U').toUpperCase()

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name || email || 'Foydalanuvchi'}
        onError={() => setImageError(true)}
        className={`${sizeClasses[size]} shrink-0 object-cover border border-slate-200/80 dark:border-dark-border ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} shrink-0 flex items-center justify-center bg-finora-500/15 font-bold text-finora-700 dark:text-finora-400 border border-finora-500/20 select-none ${className}`}
    >
      {initial}
    </div>
  )
}
