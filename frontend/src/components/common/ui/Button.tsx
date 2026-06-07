import React from 'react'
import { theme } from '../../../styles/tokens'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'danger' | 'success' | 'muted' | 'light';
}

const variantMap: Record<string, string> = {
  primary: theme.button.primary,
  danger: theme.button.danger,
  success: theme.button.success,
  muted: theme.button.muted,
  light: theme.button.light,
}

/**
 * Reusable button component with theme-aware variants.
 */
export default function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  const base = 'rounded text-sm font-medium transition-colors'
  const v = variantMap[variant] || variantMap.primary
  return (
    <button className={[base, v, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </button>
  )
}
