'use client'

import { useToast } from '../use-toast'
import type { ToastType } from './types'

interface ToastOptions {
  title: string
  description?: string
  type?: ToastType
  duration?: number
}

export function useToastStore() {
  const { toast } = useToast()

  const showToast = ({
    title,
    description,
    type = 'info',
    duration = 2000,
  }: ToastOptions) => {
    toast({
      title,
      description,
      variant: type === 'error' ? 'destructive' : 'default',
      duration,
    })
  }

  return { showToast }
}
