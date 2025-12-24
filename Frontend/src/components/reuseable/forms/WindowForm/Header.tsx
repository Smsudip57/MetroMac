import React from 'react'

export default function Header({children , className}: {children: React.ReactNode, className?: string}) {
  return (
    <div className={`bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold  ${className}`}>
      {children}
    </div>
  )
}
