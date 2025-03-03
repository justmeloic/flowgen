'use client'

import type * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ className, isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  const sidebarLinks = [
    {
      title: 'Terraform',
      icon: MessageSquare,
      variant: 'default',
      href: '/chat',
    },
  ] as const

  return (
    <div
      className={cn(
        'relative flex h-screen flex-col gap-4 px-3 pb-3 pt-16 transition-all duration-300 bg-[#f0f4f8] shadow-[2px_0_10px_0_rgba(0,0,0,0.15)] z-10 rounded-tr-xl rounded-br-xl border-r border-gray-200',
        isCollapsed ? 'w-[80px]' : 'w-[250px]',
        className
      )}
    >
      <TooltipProvider>
        <Button
          variant="ghost"
          className={cn(
            'absolute top-4 p-2 hover:bg-white/70 rounded-full',
            isCollapsed ? 'left-1/2 -translate-x-1/2' : 'left-4'
          )}
          onClick={onToggle}
        >
          <div className="flex flex-col space-y-1">
            <span className="w-4 h-0.5 bg-current"></span>
            <span className="w-4 h-0.5 bg-current"></span>
            <span className="w-4 h-0.5 bg-current"></span>
          </div>
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        {/* **New Title Added Here** */}
        <div className="mb-2 mt-[300px] font-semibold text-gray-700 text-sm ">
          Agents
        </div>
        <nav className="grid gap-1">
          {sidebarLinks.map((link, index) => {
            const Icon = link.icon
            return isCollapsed ? (
              <Tooltip key={index} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-white/70',
                      pathname === link.href &&
                        'bg-[#d3e2fd] text-primary hover:bg-[#d3e2fd]/90'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{link.title}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="flex items-center gap-4"
                >
                  {link.title}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={index}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-3 py-2 text-muted-foreground hover:bg-white/70',
                  pathname === link.href &&
                    'bg-[#d3e2fd] text-primary hover:bg-[#d3e2fd]/90'
                )}
              >
                <Icon className="h-5 w-5" />
                {link.title}
              </Link>
            )
          })}
        </nav>
      </TooltipProvider>
    </div>
  )
}
