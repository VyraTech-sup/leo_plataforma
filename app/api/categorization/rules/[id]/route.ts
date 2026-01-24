import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rule = await prisma.categoryRule.findUnique({
      where: { id: params.id },
    })

    if (!rule || rule.userId !== session.user.id) {
      return NextResponse.json({ error: "Regra não encontrada" }, { status: 404 })
    }

    await prisma.categoryRule.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Regra excluída" })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir regra" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { isActive } = body

    const rule = await prisma.categoryRule.findUnique({
      where: { id: params.id },
    })

    if (!rule || rule.userId !== session.user.id) {
      return NextResponse.json({ error: "Regra não encontrada" }, { status: 404 })
    }

    const updated = await prisma.categoryRule.update({
      where: { id: params.id },
      data: { isActive },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar regra" }, { status: 500 })
  }
}
