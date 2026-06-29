import { getGraphData } from '../../../lib/cognee'

export async function GET() {
  try {
    const graphData = await getGraphData()
    return Response.json(graphData)
  } catch (err) {
    console.error('Failed to get graph data:', err)
    return Response.json({ nodes: [], edges: [] })
  }
}
