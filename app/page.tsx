'use client'

import React from 'react'
import Sidebar from '@/components/Sidebar'
import MemoryInput from '@/components/MemoryInput'
import { useProject } from '@/lib/projectContext'

export default function Home() {
  const { activeProject } = useProject()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#051424]">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Right Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden bg-[#0a0a0a] text-[#d4e4fa]">
        {/* Top Bar */}
        <header className="flex h-12 items-center justify-between border-b border-[#1f1f1f] px-6 flex-shrink-0">
          <div>
            {activeProject ? (
              <span className="font-medium text-white text-[14px]">
                {activeProject.name}
              </span>
            ) : (
              <span className="text-zinc-500 text-[14px]">No project selected</span>
            )}
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 font-mono">DevGraph</span>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto">
          {/* Memory Input Section */}
          <div id="memory-input-section" className="min-h-[200px] border-b border-[#1f1f1f] p-6">
            <MemoryInput />
          </div>

          {/* Recall Section */}
          <div id="recall-section" className="min-h-[200px] border-b border-[#1f1f1f] p-6">
            <p className="text-zinc-400 text-sm">RecallSearch goes here</p>
          </div>

          {/* Graph Section */}
          <div id="graph-section" className="min-h-[200px] border-b border-[#1f1f1f] p-6">
            <p className="text-zinc-400 text-sm">GraphView goes here</p>
          </div>
        </div>
      </main>
    </div>
  )
}
