import { rememberMemory, improveMemory } from '../../../lib/cognee'
import { checkRateLimit } from '../../../lib/rateLimit'
import { ProjectCategory } from '../../../lib/types'

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const allowed = checkRateLimit(ip, 10, 60000)
    if (!allowed) {
      return Response.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        }
      )
    }

    const { content, projectName } = (await req.json()) as {
      content: string
      category: ProjectCategory
      projectName: string
    }

    await rememberMemory(content, projectName)

    // Fire and forget improveMemory
    improveMemory().catch((err) => {
      console.error('Failed to run improveMemory in background:', err)
    })

    return Response.json({ ok: true })
  } catch (err: any) {
    return Response.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
