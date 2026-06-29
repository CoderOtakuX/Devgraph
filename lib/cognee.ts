import { GraphData, GraphNode, GraphEdge, MemorySearchResult, ProjectCategory } from './types'

const COGNEE_API_URL = process.env.COGNEE_API_URL || 'http://localhost:8000'

function toProjectCategory(category?: string): ProjectCategory {
  if (!category) return 'Note'
  const normalized = category.trim().toLowerCase()
  switch (normalized) {
    case 'architecture': return 'Architecture'
    case 'bug fix':
    case 'bugfix':
      return 'Bug Fix'
    case 'pattern': return 'Pattern'
    case 'decision': return 'Decision'
    case 'note': return 'Note'
    default:
      if (['Architecture', 'Bug Fix', 'Pattern', 'Decision', 'Note'].includes(category)) {
        return category as ProjectCategory
      }
      return 'Note'
  }
}

export async function rememberMemory(content: string, dataset: string): Promise<void> {
  const response = await fetch(`${COGNEE_API_URL}/api/v1/memory/remember`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: content,
      dataset_name: dataset,
    }),
  })

  if (!response.ok) {
    throw new Error('Cognee remember failed')
  }
}

export async function recallMemory(query: string, dataset?: string): Promise<MemorySearchResult[]> {
  const body: { query: string; dataset_name?: string } = { query }
  if (dataset) {
    body.dataset_name = dataset
  }

  const response = await fetch(`${COGNEE_API_URL}/api/v1/memory/recall`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error('Cognee recall failed')
  }

  const data = await response.json()
  const items = Array.isArray(data) ? data : []

  return items.map((item: any) => ({
    id: item.id || '',
    content: item.text || '',
    category: toProjectCategory(item.metadata?.category),
    project: item.metadata?.dataset_name || '',
    score: typeof item.score === 'number' ? item.score : 0,
    isCrossProject: false,
  }))
}

export async function forgetMemory(dataset: string): Promise<void> {
  const response = await fetch(`${COGNEE_API_URL}/api/v1/memory/forget`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dataset_name: dataset,
    }),
  })

  if (!response.ok) {
    throw new Error('Cognee forget failed')
  }
}

export async function improveMemory(): Promise<void> {
  try {
    const response = await fetch(`${COGNEE_API_URL}/api/v1/memory/improve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      console.error('Cognee improve failed:', response.statusText)
    }
  } catch (error) {
    console.error('Error during Cognee improve:', error)
  }
}

interface RawNode {
  id: string
  properties?: {
    content?: string
    dataset_name?: string
    category?: string
  }
}

interface RawEdge {
  source_node_id: string
  target_node_id: string
  relationship_type?: string
}

interface RawGraphResponse {
  nodes?: RawNode[]
  edges?: RawEdge[]
}

export async function getGraphData(): Promise<GraphData> {
  try {
    const response = await fetch(`${COGNEE_API_URL}/api/v1/visualize`)
    if (!response.ok) {
      return { nodes: [], edges: [] }
    }

    const data = (await response.json()) as RawGraphResponse
    const rawNodes = data.nodes || []
    const rawEdges = data.edges || []

    const nodes: GraphNode[] = rawNodes.map((node) => ({
      id: node.id,
      label: node.properties?.content || node.id,
      project: node.properties?.dataset_name || '',
      category: toProjectCategory(node.properties?.category),
    }))

    const projectMap = new Map<string, string>()
    for (const node of nodes) {
      projectMap.set(node.id, node.project)
    }

    const edges: GraphEdge[] = rawEdges.map((edge) => {
      const sourceProject = projectMap.get(edge.source_node_id) || ''
      const targetProject = projectMap.get(edge.target_node_id) || ''
      const isCrossProject = sourceProject !== targetProject

      return {
        source: edge.source_node_id,
        target: edge.target_node_id,
        label: edge.relationship_type,
        isCrossProject,
      }
    })

    return { nodes, edges }
  } catch (error) {
    console.error('Error fetching graph data from Cognee:', error)
    return { nodes: [], edges: [] }
  }
}
