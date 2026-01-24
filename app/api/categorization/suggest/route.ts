import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { description } = await request.json()

    if (!description) {
      return NextResponse.json({ category: null })
    }

    const rules = await prisma.categoryRule.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: { matchCount: "desc" },
    })

    const descriptionLower = description.toLowerCase()

    for (const rule of rules) {
      if (descriptionLower.includes(rule.pattern)) {
        await prisma.categoryRule.update({
          where: { id: rule.id },
          data: { matchCount: { increment: 1 } },
        })

        return NextResponse.json({
          category: rule.category,
          ruleId: rule.id,
          pattern: rule.pattern,
        })
      }
    }

    return NextResponse.json({ category: null })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao sugerir categoria" }, { status: 500 })
  }
}
