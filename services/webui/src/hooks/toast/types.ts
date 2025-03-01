import type { ToastActionElement, ToastProps } from "@/components/ui/toast"
import { ReactNode } from "react"

export type ToasterToast = ToastProps & {
  id: string
  title?: ReactNode
  description?: ReactNode
  action?: ToastActionElement
}

export type ToastType = "success" | "error" | "info" | "warning"