import React from 'react'
import { theme } from '../../../styles/tokens'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  inputSize?: 'sm' | 'md' | 'lg'
}

const sizeMap: Record<string, string> = {
  sm: 'px-1 py-1 text-sm',
  md: 'px-2 py-1 text-sm',
  lg: 'px-3 py-2 text-base',
}

export default function Input({ inputSize = 'md', className = '', ...rest }: InputProps) {
  return <input className={[theme.input.base, sizeMap[inputSize], className].filter(Boolean).join(' ')} {...rest} />
}
