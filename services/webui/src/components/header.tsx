import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { cn } from '@/lib/utils'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { UserNav } from '@/components/user-nav'
import { allComponents } from '@/lib/components'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-gray-200/50 shadow-[0_6px_9px_-1px_rgb(0,0,0,0.2),0_2px_4px_-2px_rgb(0,0,0,0.1)]">
      <div className="container flex h-20 items-center px-0 ">
        <div className="flex items-center gap-2 pl-4 ml-4">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/team-logo-H0s99aG4Kh87pJ3BIfsunSvtSbmFcj.png"
            alt="Gen AI Logo"
            width={48}
            height={48}
          />
          <Link href="/" className="flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              React Prototyping Template
            </span>
          </Link>
        </div>
        <NavigationMenu className="pl-4">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    {/* Direct <a> tag for GitLab link */}
                    <a
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      href="https://gitlab.com/google-cloud-ce/communities/genai-fsa/canada/copier-demo-template/-/tree/main/services/webui-react"
                    >
                      <div className="mb-2 mt-4 text-lg font-medium">
                        GitLab
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Components for building AI-powered applications.
                      </p>
                    </a>
                  </li>
                  <ListItem href="/#top" title="Getting Started">
                    Exploring our pre-built application user-interfaces.
                  </ListItem>
                  {/* Direct <a> tag for Contributing link */}
                  <ListItem
                    href="https://gitlab.com/google-cloud-ce/communities/genai-fsa/canada/copier-demo-template/-/blob/main/services/webui-react/CONTRIBUTING.md"
                    title="Contributing"
                  >
                    We welcome contributions from the community!
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Components</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {allComponents.map((component) => (
                    <ListItem
                      key={component.slug}
                      title={component.name}
                      href={`/components/${component.slug}`}
                    >
                      {component.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="ml-auto mr-5 ">
          <UserNav />
        </div>
      </div>
    </header>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      {/* Keep NavigationMenuLink for other ListItems */}
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = 'ListItem'
