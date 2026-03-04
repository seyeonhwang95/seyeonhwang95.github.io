import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '@/components/ui/menubar'

interface TopNavBarProps {
  currentApp?: string
  onAppChange?: (app: string) => void
}

export function TopNavBar({ onAppChange }: TopNavBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleAppChange = (app: string) => {
    onAppChange?.(app)
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="w-full border-b bg-background shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Desktop Navigation */}
        <div className="hidden sm:block">
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>Apps</MenubarTrigger>
              <MenubarContent>
                <MenubarItem asChild>
                  <a href="#" onClick={() => handleAppChange('poultry')}>
                    Poultry Judging Cards
                  </a>
                </MenubarItem>
                <MenubarItem asChild>
                  <a href="/" onClick={() => handleAppChange('bbgun')}>
                    BB Gun Study
                  </a>
                </MenubarItem>
                {/* <MenubarItem asChild>
                  <a href="#" onClick={() => handleAppChange('music')}>
                    Music Composition
                  </a>
                </MenubarItem>
                <MenubarItem asChild>
                  <a href="#" onClick={() => handleAppChange('stock')}>
                    Stock Trading Simulator
                  </a>
                </MenubarItem> */}
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="sm:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex flex-col gap-4 py-4">
              <div className="text-lg font-semibold">Apps</div>
              <a
                href="/"
                className="text-sm hover:text-primary"
                onClick={() => handleAppChange('bbgun')}
              >
                BB Gun Study
              </a>
              <a
                href="#"
                className="text-sm hover:text-primary"
                onClick={() => handleAppChange('music')}
              >
                Music Composition
              </a>
              <a
                href="#"
                className="text-sm hover:text-primary"
                onClick={() => handleAppChange('stock')}
              >
                Stock Trading Simulator
              </a>
              <a
                href="#"
                className="text-sm hover:text-primary"
                onClick={() => handleAppChange('poultry')}
              >
                Poultry Judging Cards
              </a>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo/Title - visible on all screens */}
        <div className="flex-1 text-center sm:text-left sm:flex-none">
          <h1 className="text-lg font-semibold">kevinhwang.me</h1>
        </div>
      </div>
    </nav>
  )
}
