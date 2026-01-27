"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const tiposCategoria = [
  { value: "receita", label: "Receita" },
  { value: "despesa", label: "Despesa" },
  { value: "investimento", label: "Investimento" },
]

// Simulação de dados iniciais
const categoriasIniciais = [
  {
    id: 1,
    nome: "Salário",
    tipo: "receita",
    descricao: "Rendimentos do trabalho",
    ativa: true,
    subcategorias: [
      { id: 11, nome: "Salário Fixo", ativa: true },
      { id: 12, nome: "Bônus", ativa: true },
    ],
  },
  {
    id: 2,
    nome: "Moradia",
    tipo: "despesa",
    descricao: "Gastos com casa",
    ativa: true,
    subcategorias: [
      { id: 21, nome: "Aluguel", ativa: true },
      { id: 22, nome: "Condomínio", ativa: true },
      { id: 23, nome: "IPTU", ativa: false },
    ],
  },
  {
    id: 3,
    nome: "Investimentos",
    tipo: "investimento",
    descricao: "Aportes e rendimentos",
    ativa: true,
    subcategorias: [
      { id: 31, nome: "Renda Fixa", ativa: true },
      { id: 32, nome: "Ações", ativa: true },
    ],
  },
  {
    id: 4,
    nome: "Viagem",
    tipo: "despesa",
    descricao: "Despesas de lazer",
    ativa: false,
    subcategorias: [
      { id: 41, nome: "Passagens", ativa: false },
      { id: 42, nome: "Hospedagem", ativa: false },
    ],
  },
]

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState(categoriasIniciais)
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null as null | number)
  const [form, setForm] = useState({
    nome: "",
    tipo: "receita",
    descricao: "",
  })
  const [modalSub, setModalSub] = useState(false)
  const [catPai, setCatPai] = useState(null as null | number)
  const [editandoSub, setEditandoSub] = useState(null as null | number)
  const [formSub, setFormSub] = useState({ nome: "" })
  const { toast } = useToast()

  // Abrir modal para nova categoria
  const abrirNovaCategoria = () => {
    setEditando(null)
    setForm({ nome: "", tipo: "receita", descricao: "" })
    setModalAberto(true)
  }
  // Abrir modal para editar categoria
  const abrirEditarCategoria = (id: number) => {
    const c = categorias.find((c) => c.id === id)
    if (!c) return
    setEditando(id)
    setForm({ nome: c.nome, tipo: c.tipo, descricao: c.descricao || "" })
    setModalAberto(true)
  }
  // Salvar categoria (nova ou edição)
  const salvarCategoria = () => {
    if (!form.nome || !form.tipo) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" })
      return
    }
    // Edição: confirmação para alteração de tipo
    if (editando) {
      const catAntiga = categorias.find((c) => c.id === editando)
      if (catAntiga && catAntiga.tipo !== form.tipo) {
        if (!window.confirm("Alterar o tipo da categoria pode impactar o histórico. Tem certeza?"))
          return
      }
      setCategorias(categorias.map((c) => (c.id === editando ? { ...c, ...form } : c)))
      toast({ title: "Categoria atualizada com sucesso" })
    } else {
      // Evitar duplicidade
      if (categorias.some((c) => c.nome.toLowerCase() === form.nome.toLowerCase())) {
        toast({ title: "Já existe uma categoria com esse nome", variant: "destructive" })
        return
      }
      setCategorias([
        ...categorias,
        {
          id: Math.max(...categorias.map((c) => c.id)) + 1,
          ...form,
          ativa: true,
          subcategorias: [],
        },
      ])
      toast({ title: "Categoria criada com sucesso" })
    }
    setModalAberto(false)
  }
  // Desativar categoria
  const desativarCategoria = (id: number) => {
    setCategorias(categorias.map((c) => (c.id === id ? { ...c, ativa: false } : c)))
    toast({ title: "Categoria desativada (histórico mantido)" })
  }
  // Abrir modal para nova subcategoria
  const abrirNovaSub = (catId: number) => {
    setCatPai(catId)
    setEditandoSub(null)
    setFormSub({ nome: "" })
    setModalSub(true)
  }
  // Abrir modal para editar subcategoria
  const abrirEditarSub = (catId: number, subId: number) => {
    const cat = categorias.find((c) => c.id === catId)
    const sub = cat?.subcategorias.find((s: any) => s.id === subId)
    if (!sub) return
    setCatPai(catId)
    setEditandoSub(subId)
    setFormSub({ nome: sub.nome })
    setModalSub(true)
  }
  // Salvar subcategoria
  const salvarSub = () => {
    if (!formSub.nome) {
      toast({ title: "Preencha o nome da subcategoria", variant: "destructive" })
      return
    }
    setCategorias(
      categorias.map((c) => {
        if (c.id !== catPai) return c
        // Edição
        if (editandoSub) {
          return {
            ...c,
            subcategorias: c.subcategorias.map((s: any) =>
              s.id === editandoSub ? { ...s, nome: formSub.nome } : s
            ),
          }
        }
        // Nova
        if (c.subcategorias.some((s: any) => s.nome.toLowerCase() === formSub.nome.toLowerCase())) {
          toast({ title: "Já existe uma subcategoria com esse nome", variant: "destructive" })
          return c
        }
        return {
          ...c,
          subcategorias: [
            ...c.subcategorias,
            {
              id: Math.max(0, ...c.subcategorias.map((s: any) => s.id)) + 1,
              nome: formSub.nome,
              ativa: true,
            },
          ],
        }
      })
    )
    toast({ title: editandoSub ? "Subcategoria atualizada" : "Subcategoria criada" })
    setModalSub(false)
  }
  // Desativar subcategoria
  const desativarSub = (catId: number, subId: number) => {
    setCategorias(
      categorias.map((c) =>
        c.id === catId
          ? {
              ...c,
              subcategorias: c.subcategorias.map((s: any) =>
                s.id === subId ? { ...s, ativa: false } : s
              ),
            }
          : c
      )
    )
    toast({ title: "Subcategoria desativada (histórico mantido)" })
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <h1 className="text-4xl font-bold mb-2">Categorias Financeiras</h1>
      <p className="text-muted-foreground mb-6 text-lg">
        Organize e padronize as categorias e subcategorias utilizadas em toda a plataforma.
        Categorias ativas aparecem para novas transações, orçamentos e relatórios. Desative para
        manter histórico sem perder consistência.
      </p>
      <Button onClick={abrirNovaCategoria} className="mb-4">
        Nova categoria
      </Button>
      {/* Lista hierárquica */}
      <div className="grid gap-4">
        {categorias.map((cat) => (
          <Card key={cat.id} className={cat.ativa ? "" : "opacity-60"}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{cat.nome}</CardTitle>
                <CardDescription>
                  {tiposCategoria.find((t) => t.value === cat.tipo)?.label} • {cat.descricao}
                </CardDescription>
              </div>
              <div className="flex gap-2 items-center">
                <span
                  className={`text-xs px-2 py-1 rounded ${cat.ativa ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}
                >
                  {cat.ativa ? "Ativa" : "Inativa"}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => abrirEditarCategoria(cat.id)}
                  disabled={!cat.ativa}
                >
                  Editar
                </Button>
                {cat.ativa && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => desativarCategoria(cat.id)}
                  >
                    Desativar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="ml-2">
                <div className="font-semibold mb-1">Subcategorias</div>
                <div className="flex flex-col gap-1">
                  {cat.subcategorias.map((sub: any) => (
                    <div
                      key={sub.id}
                      className={`flex items-center gap-2 ${sub.ativa ? "" : "opacity-60"}`}
                    >
                      <span>{sub.nome}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${sub.ativa ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}
                      >
                        {sub.ativa ? "Ativa" : "Inativa"}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => abrirEditarSub(cat.id, sub.id)}
                        disabled={!sub.ativa}
                      >
                        Editar
                      </Button>
                      {sub.ativa && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => desativarSub(cat.id, sub.id)}
                        >
                          Desativar
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button size="sm" className="mt-2" onClick={() => abrirNovaSub(cat.id)}>
                    Nova subcategoria
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Modal de categoria */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editando ? "Editar categoria" : "Nova categoria"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo *</label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposCategoria.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <Input
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={salvarCategoria}>
                {editando ? "Salvar alterações" : "Criar categoria"}
              </Button>
              <Button variant="outline" onClick={() => setModalAberto(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de subcategoria */}
      {modalSub && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editandoSub ? "Editar subcategoria" : "Nova subcategoria"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <Input
                  value={formSub.nome}
                  onChange={(e) => setFormSub({ nome: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={salvarSub}>
                {editandoSub ? "Salvar alterações" : "Criar subcategoria"}
              </Button>
              <Button variant="outline" onClick={() => setModalSub(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
