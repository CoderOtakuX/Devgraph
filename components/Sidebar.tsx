'use client'

import React, { useState } from 'react'
import { useProject } from '@/lib/projectContext'

const DOT_COLORS = ['#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

export default function Sidebar() {
  const { projects, activeProject, setActiveProject, createProject, deleteProject, loading } = useProject()
  const [isCreating, setIsCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) return
    await createProject(newProjectName.trim())
    setNewProjectName('')
    setIsCreating(false)
  }

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    e.preventDefault()
    if (window.confirm(`Delete project "${name}" and all its memories?`)) {
      deleteProject(id)
    }
  }

  return (
    <aside className="flex flex-col h-full border-r border-white/8 w-[240px] bg-[#0d1117] flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-6 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[#7c3aed] text-[20px]">hub</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg flex items-start gap-1 leading-tight">
              DevGraph
              <sup className="text-[#7c3aed] text-[10px] font-medium mt-0.5">β</sup>
            </h1>
            <p className="text-gray-500 text-xs">Cross-project memory</p>
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Section Header */}
        <div className="px-4 flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase px-3 mb-1">PROJECTS</span>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-transparent hover:bg-white/10 text-gray-400 hover:text-white rounded-md p-1 transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
        </div>

        {/* Inline Input for Creation */}
        {isCreating && (
          <form onSubmit={handleCreate} className="px-3 mb-2 flex flex-col gap-2">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="New project..."
              className="w-full bg-white/5 border border-purple-600/50 rounded-md px-2 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false)
                  setNewProjectName('')
                }}
                className="text-xs text-zinc-400 hover:text-white px-2 py-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs bg-purple-600 text-white font-semibold px-2 py-1 rounded hover:bg-purple-500"
              >
                Add
              </button>
            </div>
          </form>
        )}

        {/* Project List */}
        {loading ? (
          <ul className="px-2 space-y-2">
            {[1, 2, 3].map((i) => (
              <li key={i} className="h-10 bg-white/5 rounded-lg animate-pulse opacity-50 mx-2" />
            ))}
          </ul>
        ) : (
          <ul className="px-2 space-y-[2px]">
            {projects.map((project, index) => {
              const isActive = activeProject?.id === project.id
              const dotColor = DOT_COLORS[index % DOT_COLORS.length]
              return (
                <li key={project.id} className="group">
                  <a
                    onClick={(e) => {
                      e.preventDefault()
                      setActiveProject(project)
                    }}
                    className={`flex items-center justify-between py-2.5 px-3 transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-purple-900/40 border border-purple-700/50 rounded-lg text-white font-medium'
                        : 'border border-transparent hover:bg-white/5 rounded-lg text-gray-400 hover:text-gray-200'
                    }`}
                    href="#"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: dotColor,
                          boxShadow: isActive ? `0 0 0 1px #0d1117, 0 0 0 3px ${dotColor}` : 'none',
                        }}
                      ></span>
                      <span className={isActive ? 'text-white font-medium text-sm' : 'text-gray-400 group-hover:text-gray-200 transition-colors text-sm'}>
                        {project.name}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, project.id, project.name)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="text-[11px] text-gray-600 px-3 pb-4 mt-auto border-t border-white/8 pt-4">
        <p>
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </p>
      </div>
    </aside>
  )
}
