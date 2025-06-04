'use client'

import type * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Home } from 'lucide-react'
import { useState } from 'react'

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
  const [isHovered, setIsHovered] = useState(false)

  const homeLink = {
    title: 'Home',
    icon: Home,
    variant: 'default',
    href: '/',
  } as const

  const agentLinks = [
    {
      title: 'Terraform',
      icon: MessageSquare,
      variant: 'default',
      href: '/terraform-agent',
    },
  ] as const

  return (
    <div
      className={cn(
        'relative flex h-screen flex-col gap-4 px-3 pb-3 pt-16 transition-all duration-300 bg-[#f0f4f8] shadow-[2px_0_10px_0_rgba(0,0,0,0.1)] z-10 rounded-tr-xl rounded-br-xl border-r border-gray-200',
        isCollapsed && !isHovered ? 'w-[80px]' : 'w-[250px]',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TooltipProvider>
        <Button
          variant="ghost"
          className={cn(
            'absolute top-4 p-2 hover:bg-white/50',
            isCollapsed && !isHovered ? 'left-1/2 -translate-x-1/2' : 'left-4'
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

        <nav className="grid gap-1 mt-4">
          {/* Home Link */}
          {isCollapsed && !isHovered ? (
            <Tooltip key={0} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={homeLink.href}
                  className={cn(
                    'flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-white/50',
                    pathname === homeLink.href &&
                      'bg-[#d3e2fd] text-primary hover:bg-[#d3e2fd]/90'
                  )}
                >
                  <homeLink.icon className="h-5 w-5" />
                  <span className="sr-only">{homeLink.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {homeLink.title}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              key={0}
              href={homeLink.href}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2 text-muted-foreground hover:bg-white/50',
                pathname === homeLink.href &&
                  'bg-[#d3e2fd] text-primary hover:bg-[#d3e2fd]/90'
              )}
            >
              <homeLink.icon className="h-5 w-5" />
              {homeLink.title}
            </Link>
          )}
        </nav>

        <div className="mb-2 mt-[200px] font-semibold text-gray-700 text-sm ">
          Agents
        </div>
        <nav className="grid gap-1">
          {agentLinks.map((link, index) => {
            const Icon = link.icon
            return isCollapsed && !isHovered ? (
              <Tooltip key={index} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-white/50',
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
                  'flex items-center gap-3 rounded-2xl px-3 py-2 text-muted-foreground hover:bg-white/50',
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
