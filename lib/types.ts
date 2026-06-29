export type ProjectCategory = 'Architecture' | 'Bug Fix' | 'Pattern' | 'Decision' | 'Note'

export interface Project {
  id: string
  name: string
  createdAt: string
}

export interface Memory {
  id: string
  content: string
  category: ProjectCategory
  project: string
  createdAt: string
}

export interface MemorySearchResult {
  id: string
  content: string
  category: ProjectCategory
  project: string
  score: number
  isCrossProject: boolean
}

export interface GraphNode {
  id: string
  label: string
  project: string
  category: ProjectCategory
}

export interface GraphEdge {
  source: string
  target: string
  label?: string
  isCrossProject: boolean
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface RateLimitBucket {
  tokens: number
  lastRefill: number
}

export interface CogneeRememberPayload {
  content: string
  dataset: string
}

export interface CogneeRecallPayload {
  query: string
  dataset?: string
}
