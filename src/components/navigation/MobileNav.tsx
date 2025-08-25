// src/components/navigation/MobileNav.tsx

'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/AppLogo';
import { Menu } from 'lucide-react';

interface MobileNavProps {
  children: React.ReactNode;
}

export function MobileNav({ children }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-50 bg-background/50 backdrop-blur-sm md:hidden"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-16 flex-shrink-0 items-center border-b bg-background px-4">
          <AppLogo />
        </div>
        <div className="flex-1 overflow-y-auto" onClick={() => setIsOpen(false)}>
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
