import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'danger' | 'success' | 'muted' | 'light';
}

const variantMap: Record<string, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  danger: 'bg-red-100 text-red-600 hover:bg-red-200',
  success: 'bg-green-600 text-white hover:bg-green-700',
  muted: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  light: 'bg-white text-gray-700 hover:bg-gray-200',
}

export default function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  const base = 'rounded px-3 py-1 text-sm font-medium transition-colors'
  const v = variantMap[variant] || variantMap.primary
  return (
    <button className={[base, v, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </button>
  )
}
