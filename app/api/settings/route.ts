import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

const profileSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Senha atual é obrigatória"),
    newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirmação é obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export async function GET(_: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Erro ao buscar perfil" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { type, ...data } = body

    if (type === "profile") {
      const validatedData = profileSchema.parse(data)

      // Verificar se o email já está em uso por outro usuário
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json({ error: "Email já está em uso" }, { status: 400 })
      }

      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: validatedData.name,
          email: validatedData.email,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      })

      return NextResponse.json(updatedUser)
    }

    if (type === "password") {
      const validatedData = passwordSchema.parse(data)

      // Verificar senha atual
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      })

      if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
      }

      const isPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password)

      if (!isPasswordValid) {
        return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })
      }

      // Atualizar senha
      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10)

      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword },
      })

      return NextResponse.json({ message: "Senha atualizada com sucesso" })
    }

    return NextResponse.json({ error: "Tipo de atualização inválido" }, { status: 400 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 })
  }
}

export async function DELETE(_: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Deletar usuário e todos os dados relacionados (cascade)
    await prisma.user.delete({
      where: { id: session.user.id },
    })

    return NextResponse.json({ message: "Conta excluída com sucesso" })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ error: "Erro ao excluir conta" }, { status: 500 })
  }
}
