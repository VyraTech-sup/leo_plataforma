import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const ruleSchema = z.object({
  pattern: z.string().min(1),
  category: z.string().min(1),
})

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rules = await prisma.categoryRule.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isActive: "desc" }, { matchCount: "desc" }],
    })

    return NextResponse.json(rules)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar regras" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { pattern, category } = ruleSchema.parse(body)

    const existing = await prisma.categoryRule.findUnique({
      where: {
        userId_pattern: {
          userId: session.user.id,
          pattern: pattern.toLowerCase(),
        },
      },
    })

    if (existing) {
      const updated = await prisma.categoryRule.update({
        where: { id: existing.id },
        data: { category, isActive: true },
      })
      return NextResponse.json(updated)
    }

    const rule = await prisma.categoryRule.create({
      data: {
        userId: session.user.id,
        pattern: pattern.toLowerCase(),
        category,
      },
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro ao criar regra" }, { status: 500 })
  }
}
