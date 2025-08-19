import { ReactNode, useState } from 'react'
import NavTop from '@/components/NavTop'
import NavTabs from '@/components/NavTabs'
import Drawer from '@/components/Drawer'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <NavTop onMenuToggle={() => setIsDrawerOpen(true)} />
      
      <main className="pt-16 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      
      <NavTabs />
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  )
}