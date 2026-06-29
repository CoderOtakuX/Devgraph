'use client'

import { useProject } from '@/lib/projectContext'
import { useState } from 'react'
import type { ProjectCategory, Memory } from '@/lib/types'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function MemoryInput() {
  const { activeProject } = useProject()

  const [content, setContent] = useState('')
  const [category, setCategory] = useState<ProjectCategory>('Decision')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentMemories, setRecentMemories] = useState<Memory[]>([])

  const handleSubmit = async () => {
    if (!content.trim() || !activeProject) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/remember', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          category,
          projectName: activeProject.name,
        }),
      })

      if (!response.ok) {
        throw new Error('Response not ok')
      }

      const newMemory: Memory = {
        id: crypto.randomUUID(),
        content: content.trim(),
        category,
        project: activeProject.name,
        createdAt: new Date().toISOString(),
      }

      setRecentMemories((prev) => [newMemory, ...prev].slice(0, 10))
      setContent('')
    } catch (err) {
      console.error(err)
      setError('Failed to save memory. Is Cognee running?')
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories: ProjectCategory[] = ['Architecture', 'Bug Fix', 'Pattern', 'Decision', 'Note']

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1000px] mx-auto">
      {/* Section 1: Header */}
      <header className="flex justify-between items-start w-full border-b border-[#262626] pb-6">
        <div>
          <h2 className="text-3xl font-semibold text-white mb-2 tracking-tight">Log Memory</h2>
          <p className="text-base text-zinc-400">Capture decisions, patterns, and bugs across your projects</p>
        </div>
        <div className="bg-[#ddb7ff]/20 text-[#ddb7ff] border border-[#ddb7ff]/30 px-3 py-1 rounded-full flex items-center gap-2 text-[11px] font-medium">
          <span className={`w-2 h-2 rounded-full ${activeProject ? 'bg-[#ddb7ff] animate-pulse' : 'bg-zinc-500'}`}></span>
          {activeProject ? activeProject.name : 'No project selected'}
        </div>
      </header>

      {/* Memory Input Panel */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 flex flex-col gap-6">
        {/* Section 2: Textarea */}
        <div className="relative w-full">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!activeProject}
            className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg p-4 text-base text-white placeholder:text-zinc-500 focus:border-[#ddb7ff] focus:ring-0 focus:outline-none transition-colors resize-none min-h-[160px] disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={
              activeProject
                ? "e.g. Decided to use BullMQ over raw Redis pub/sub because we need job retries and dead letter queues..."
                : "Please select a project from the sidebar to start logging memories..."
            }
          />
        </div>

        {/* Section 3: Categories & Actions */}
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Classification</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = category === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    disabled={!activeProject}
                    className={`text-[13px] font-medium px-4 py-2 rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSelected
                        ? 'border-[#ddb7ff] bg-[#ddb7ff]/10 text-[#ddb7ff]'
                        : 'border-[#262626] bg-transparent text-zinc-400 hover:border-[#ddb7ff] hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-4">
              <span className="text-[11px] text-zinc-500 font-mono">{content.length} / 1000</span>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || !activeProject || isSubmitting}
                className="bg-[#ddb7ff] text-black font-semibold text-[13px] px-6 py-2 rounded flex items-center gap-2 hover:bg-[#ddb7ff]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin border-2 rounded-full w-3 h-3 border-black/30 border-t-black inline-block mr-1"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">bookmark</span>
                    Save Memory
                  </>
                )}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>
        </div>
      </div>

      {/* Section 5: Recent Memories */}
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-[#262626] pb-2 mb-2">
          <span className="material-symbols-outlined text-zinc-400 text-[18px]">history</span>
          <h3 className="text-[13px] font-semibold text-zinc-400 uppercase tracking-wider">
            Recent ({recentMemories.length})
          </h3>
        </div>

        {recentMemories.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-6">
            No memories logged yet. Start by saving your first decision above.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {recentMemories.map((memory) => (
              <div
                key={memory.id}
                className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 hover:bg-[#1c1c1c] transition-colors relative overflow-hidden group cursor-pointer"
              >
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-[#ddb7ff] transition-colors"></div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-white/5 border border-white/10 text-zinc-400 text-[11px] px-2 py-1 rounded">
                      {memory.category}
                    </span>
                    <span className="text-[11px] text-zinc-500">{timeAgo(memory.createdAt)}</span>
                  </div>
                  <span className="text-[11px] text-[#ddb7ff]/70">{memory.project}</span>
                </div>
                <p className="text-[14px] text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {memory.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
