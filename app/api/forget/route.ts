import { forgetMemory } from '../../../lib/cognee'

export async function POST(req: Request) {
  try {
    const { projectName } = (await req.json()) as { projectName: string }
    await forgetMemory(projectName)
    return Response.json({ ok: true })
  } catch (err: any) {
    return Response.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
