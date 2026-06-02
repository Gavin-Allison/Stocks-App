import React from 'react'

type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  muted?: boolean
}

export default function Panel({ muted = true, className = '', children, ...rest }: PanelProps) {
  const base = 'flex flex-col mb-4 w-full border border-gray-400 rounded p-4'
  const bg = muted ? 'bg-gray-200' : 'bg-white'
  return (
    <div className={[base, bg, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  )
}
