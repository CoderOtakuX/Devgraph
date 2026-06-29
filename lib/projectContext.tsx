'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Project } from './types'

export interface ProjectContextValue {
  projects: Project[]
  activeProject: Project | null
  setActiveProject: (project: Project | null) => void
  createProject: (name: string) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  loading: boolean
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProject, setActiveProjectState] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
      return data
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      return []
    }
  }

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const data = await fetchProjects()
      if (data.length > 0) {
        setActiveProjectState(data[0])
      }
      setLoading(false)
    }
    init()
  }, [])

  const setActiveProject = (project: Project | null) => {
    setActiveProjectState(project)
  }

  const createProject = async (name: string) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('Failed to create project')
      const newProj = await res.json()
      await fetchProjects()
      setActiveProjectState(newProj)
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const deleteProject = async (id: string) => {
    const projectToDelete = projects.find((p) => p.id === id)
    if (!projectToDelete) return

    try {
      // 1. Wipe Cognee data
      await fetch('/api/forget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: projectToDelete.name }),
      })

      // 2. Delete project from JSON store
      await fetch('/api/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      // 3. Refetch project list
      const updatedList = await fetchProjects()

      // 4. Handle active project change
      if (activeProject?.id === id) {
        setActiveProjectState(updatedList.length > 0 ? updatedList[0] : null)
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        setActiveProject,
        createProject,
        deleteProject,
        loading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export const useProject = () => {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
