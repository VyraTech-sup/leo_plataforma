import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const updateGoalSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  targetAmount: z.number().positive().optional(),
  deadline: z.string().datetime().optional(),
  category: z.string().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED", "PAUSED"]).optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const goal = await prisma.goal.findUnique({
      where: { id: params.id },
      include: {
        contributions: {
          orderBy: { date: "desc" },
        },
      },
    })

    if (!goal || goal.userId !== session.user.id) {
      return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 })
    }

    return NextResponse.json(goal)
  } catch (error) {
    console.error("Erro ao buscar meta:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const goal = await prisma.goal.findUnique({
      where: { id: params.id },
    })

    if (!goal || goal.userId !== session.user.id) {
      return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 })
    }

    const body = await request.json()
    const validated = updateGoalSchema.parse(body)

    const updated = await prisma.goal.update({
      where: { id: params.id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.targetAmount && { targetAmount: validated.targetAmount }),
        ...(validated.deadline && { deadline: new Date(validated.deadline) }),
        ...(validated.category && { category: validated.category }),
        ...(validated.status && { status: validated.status }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Erro ao atualizar meta:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const goal = await prisma.goal.findUnique({
      where: { id: params.id },
    })

    if (!goal || goal.userId !== session.user.id) {
      return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 })
    }

    await prisma.goal.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar meta:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
