import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const accountSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["CHECKING", "SAVINGS", "INVESTMENT", "CASH", "OTHER"]).optional(),
  institution: z.string().min(1).optional(),
  balance: z.number().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const account = await prisma.account.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!account) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 })
    }

    return NextResponse.json(account)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar conta" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const data = accountSchema.parse(body)

    const account = await prisma.account.updateMany({
      where: { id: params.id, userId: session.user.id },
      data,
    })

    if (account.count === 0) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro ao atualizar conta" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const deleted = await prisma.account.deleteMany({
      where: { id: params.id, userId: session.user.id },
    })

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar conta" }, { status: 500 })
  }
}
