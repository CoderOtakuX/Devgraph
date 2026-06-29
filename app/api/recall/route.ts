import { recallMemory } from '../../../lib/cognee'
import { checkRateLimit } from '../../../lib/rateLimit'

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const allowed = checkRateLimit(ip, 30, 60000)
    if (!allowed) {
      return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const { query, projectName, crossProject } = (await req.json()) as {
      query: string
      projectName: string
      crossProject: boolean
    }

    const results = crossProject
      ? await recallMemory(query)
      : await recallMemory(query, projectName)

    const processedResults = results.map((result) => ({
      ...result,
      isCrossProject: result.project !== projectName,
    }))

    return Response.json(processedResults)
  } catch (err: any) {
    return Response.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
