import React from 'react'
import { theme } from '../../../styles/tokens'

type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  muted?: boolean
}

export default function Panel({ muted = true, className = '', children, ...rest }: PanelProps) {
  const base = `flex flex-col mb-4 w-full ${theme.panel.border} rounded p-4`
  const bg = muted ? theme.panel.muted : theme.panel.regular
  return (
    <div className={[base, bg, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  )
}
