import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { Project } from './types'

const PROJECTS_FILE = '/tmp/devgraph-projects.json'

export async function getAllProjects(): Promise<Project[]> {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8')
    return JSON.parse(data) as Project[]
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []
    }
    throw error
  }
}

export async function createProject(name: string): Promise<Project> {
  const newProject: Project = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
  }

  const projects = await getAllProjects()
  projects.push(newProject)

  // Ensure the directory exists
  await fs.mkdir(path.dirname(PROJECTS_FILE), { recursive: true })
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8')

  return newProject
}

export async function deleteProject(id: string): Promise<void> {
  const projects = await getAllProjects()
  const filtered = projects.filter((p) => p.id !== id)

  // Ensure the directory exists
  await fs.mkdir(path.dirname(PROJECTS_FILE), { recursive: true })
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(filtered, null, 2), 'utf-8')
}
