import { getGraphData } from '../../../lib/cognee'
import { getAllProjects } from '../../../lib/projects'

export async function GET() {
  try {
    const graphData = await getGraphData()
    const projects = await getAllProjects()

    const cogneeReachable = !!(graphData && Array.isArray(graphData.nodes))
    const projectCount = Array.isArray(projects) ? projects.length : 0
    const graphNodeCount = cogneeReachable ? graphData.nodes.length : 0
    const graphEdgeCount = cogneeReachable ? graphData.edges.length : 0

    return Response.json({
      status: 'ok',
      cogneeReachable,
      projectCount,
      graphNodeCount,
      graphEdgeCount,
      cogneeUrl: process.env.COGNEE_API_URL ?? 'not set',
    })
  } catch (err: any) {
    return Response.json({
      status: 'ok',
      cogneeReachable: false,
      error: err.message || 'Unknown error',
    })
  }
}
