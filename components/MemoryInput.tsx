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
    <div className="px-8 py-8 max-w-4xl flex flex-col mx-auto">
      {/* Header */}
      <header className="flex justify-between items-start w-full border-b border-white/8 pb-6 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Log Memory</h2>
          <p className="text-gray-400 text-sm mb-6">Capture decisions, patterns, and bugs across your projects</p>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-purple-900/40 text-purple-300 border border-purple-700/40 rounded-full px-3 py-1 text-xs">
          <span className={`w-2 h-2 rounded-full ${activeProject ? 'bg-purple-400 animate-pulse' : 'bg-zinc-500'}`}></span>
          {activeProject ? activeProject.name : 'No project selected'}
        </div>
      </header>

      {/* Memory Input Panel / Form Card */}
      <div className="bg-[#161b22] border border-white/10 rounded-xl p-5 flex flex-col gap-4 focus-within:border-purple-500/60 focus-within:ring-1 focus-within:ring-purple-500/20">
        {/* Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!activeProject}
          className="w-full bg-transparent border-none outline-none text-white text-sm placeholder-gray-600 resize-y min-h-[96px] leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={
            activeProject
              ? "e.g. Decided to use BullMQ over raw Redis pub/sub because we need job retries and dead letter queues..."
              : "Please select a project from the sidebar to start logging memories..."
          }
        />

        {/* Classification */}
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase mt-4 mb-3">Classification</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = category === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  disabled={!activeProject}
                  className={
                    isSelected
                      ? 'px-3 py-1 rounded-full text-xs font-medium cursor-pointer border border-purple-600 bg-purple-600 text-white'
                      : 'px-3 py-1 rounded-full text-xs font-medium cursor-pointer border border-white/10 bg-white/5 text-gray-400 hover:border-purple-500/40 hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  }
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Bottom Action Row */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/8">
          <span className="text-xs text-gray-600 font-mono">{content.length} / 1000</span>
          
          <div className="flex flex-col items-end">
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || !activeProject || isSubmitting}
              className={
                (!content.trim() || !activeProject || isSubmitting)
                  ? 'flex items-center gap-2 bg-purple-600/50 text-white/50 text-sm font-medium px-4 py-2 rounded-lg cursor-not-allowed'
                  : 'flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors'
              }
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin border-2 rounded-full w-3.5 h-3.5 border-white/30 border-t-white inline-block"></span>
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
        </div>
      </div>
      {error && <p className="text-red-400 text-xs mt-2 text-right">{error}</p>}

      {/* Recent Memories Section */}
      <div className="flex flex-col">
        <div className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase flex items-center gap-2 mt-8 mb-4 px-1 border-b border-white/8 pb-2">
          <span className="material-symbols-outlined text-[16px]">history</span>
          <span>Recent ({recentMemories.length})</span>
        </div>

        {recentMemories.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-8">
            No memories logged yet. Start by saving your first decision above.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {recentMemories.map((memory) => (
              <div
                key={memory.id}
                className="bg-[#161b22] border border-white/8 rounded-xl p-4 mb-3"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-purple-600 bg-purple-600 text-white">
                      {memory.category}
                    </span>
                    <span className="text-xs text-gray-600">{timeAgo(memory.createdAt)}</span>
                  </div>
                  <span className="text-xs text-gray-600 mt-3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    {memory.project}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-2 leading-relaxed line-clamp-2 whitespace-pre-wrap">
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
