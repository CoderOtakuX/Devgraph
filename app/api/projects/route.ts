import { getAllProjects, createProject, deleteProject } from '../../../lib/projects'

export async function GET() {
  const projects = await getAllProjects()
  return Response.json(projects)
}

export async function POST(req: Request) {
  const { name } = await req.json()
  const project = await createProject(name)
  return Response.json(project, { status: 201 })
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  await deleteProject(id)
  return Response.json({ ok: true })
}
