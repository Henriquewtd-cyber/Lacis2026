



import { LeftSidebar } from '@/app/components/LeftSidebar'
import { LacisGrid } from '@/app/components/LacisGrid'
import { RightSidebar } from '@/app/components/RigthSidebar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LACIS — Laboratório de Cultura, Informação e Sociedade',
}

export default function Home() {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={
        {
          '--left-w': '180px',
          '--right-w': '260px',
        } as React.CSSProperties
      }
    >
      <LeftSidebar />
      <LacisGrid />
      <RightSidebar />
    </div>
  )
}