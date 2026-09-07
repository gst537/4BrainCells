'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { SearchModal } from './SearchModal';

export function ClientAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [densityMode, setDensityMode] = useState<'executive' | 'analyst'>('executive');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Don't show Navbar or Search on the login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar
        densityMode={densityMode}
        setDensityMode={setDensityMode}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
      
      {/* We can pass densityMode to children using React Context if needed, but for now we'll just keep it here as global layout state */}
      
      <main className="flex-1 flex flex-col min-h-0">
        {children}
      </main>

      {isSearchOpen && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          nodes={[]} // TODO: Fetch nodes globally or pass via context if needed globally
          onSelectNode={(node) => {
            console.log('Selected:', node);
          }}
        />
      )}
    </>
  );
}
