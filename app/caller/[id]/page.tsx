"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, ChevronLeft, Users, Lock, LogOut, Moon, Sun } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface Raid {
  id: string
  title: string
  date: string
  time: string
  participants: number
  image: string
}

export default function CallerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [caller, setCallerData] = useState({ id: params.id, name: params.id })
  const [raids, setRaids] = useState<Raid[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Verificar preferência de tema
    const savedDarkMode = localStorage.getItem("darkMode") === "true"
    setDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Verificar se o caller já está autenticado (por exemplo, com um token no localStorage)
    const token = localStorage.getItem(`caller_token_${params.id}`)
    if (token) {
      setIsAuthenticated(true)
      loadRaidData()
    }
  }, [params.id])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem("darkMode", newDarkMode.toString())

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Senha padrão para todos os callers
    if (password === "admin123") {
      localStorage.setItem(`caller_token_${params.id}`, "authenticated")
      setIsAuthenticated(true)
      loadRaidData()
    } else {
      alert("Senha incorreta. Tente novamente.")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(`caller_token_${params.id}`)
    setIsAuthenticated(false)
  }

  const loadRaidData = () => {
    // Simulação de chamada à API do Raid Helper
    setTimeout(() => {
      const mockRaids = [
        {
          id: "raid1",
          title: "Avalonian T8 Dungeon",
          date: "14/05/2025",
          time: "20:00",
          participants: 12,
          image: "/placeholder.svg?key=fjvwo",
        },
        {
          id: "raid2",
          title: "HCE Farm Group",
          date: "15/05/2025",
          time: "19:30",
          participants: 5,
          image: "/placeholder.svg?key=59j9u",
        },
        {
          id: "raid3",
          title: "Avalonian Elite Dungeon",
          date: "16/05/2025",
          time: "21:00",
          participants: 20,
          image: "/placeholder.svg?key=kkgyw",
        },
      ]
      setRaids(mockRaids)
      setLoading(false)
    }, 1000)
  }

  const shareRaidIPForm = (raidId: string) => {
    const linkUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/ip-form/${params.id}/raid/${raidId}`
    navigator.clipboard.writeText(linkUrl)
    alert(`Link do formulário de IP para ${raidId} copiado para a área de transferência!`)
  }

  if (!isAuthenticated) {
    return (
      <main className={`container mx-auto py-8 px-4 min-h-screen ${darkMode ? "dark bg-gray-900" : "bg-[#f0f8ff]"}`}>
        <div className="mb-8 flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center text-muted-foreground hover:text-foreground mb-4 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para seleção de caller
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
            className="border-[#0099cc]/50 text-[#0099cc] dark:border-blue-700 dark:text-blue-400"
          >
            {darkMode ? <Sun className="h-4 w-4 mr-1" /> : <Moon className="h-4 w-4 mr-1" />}
            {darkMode ? "Modo Claro" : "Modo Escuro"}
          </Button>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="border-[#0099cc]/20 bg-white dark:bg-gray-800 dark:border-blue-900/30">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <img src="/lobo-azul-sem-fundo.png" alt="Neve Eterna Logo" className="w-24 h-24 object-contain" />
              </div>
              <CardTitle className="text-center text-[#0099cc] dark:text-blue-400">Login de Caller</CardTitle>
              <CardDescription className="text-center dark:text-gray-300">
                Entre com suas credenciais para gerenciar suas raids
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="dark:text-gray-200">
                    Nome de Usuário
                  </Label>
                  <Input
                    id="username"
                    value={params.id}
                    readOnly
                    className="bg-[#e6f7ff] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="dark:text-gray-200">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#0099cc] hover:bg-[#0077aa] dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Entrar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className={`container mx-auto py-8 px-4 ${darkMode ? "dark bg-gray-900 text-gray-100" : "bg-[#f0f8ff]"}`}>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center text-muted-foreground hover:text-foreground mb-4 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para seleção de caller
          </Link>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              className="border-[#0099cc]/50 text-[#0099cc] dark:border-blue-700 dark:text-blue-400"
            >
              {darkMode ? <Sun className="h-4 w-4 mr-1" /> : <Moon className="h-4 w-4 mr-1" />}
              {darkMode ? "Modo Claro" : "Modo Escuro"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-[#0099cc] border-[#0099cc]/50 dark:text-blue-400 dark:border-blue-700"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Sair
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#e6f7ff] dark:bg-blue-900/30 flex items-center justify-center">
            <span className="text-[#0099cc] dark:text-blue-400 text-xl font-bold">
              {caller.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#0099cc] dark:text-blue-400">{caller.name}</h1>
            <p className="text-muted-foreground dark:text-gray-400">Gerenciamento de Raids</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-[#0099cc] dark:text-blue-400">Suas Raids Ativas</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0099cc] dark:border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raids.map((raid) => (
              <Card
                className="h-full transition-all hover:shadow-md border-[#0099cc]/20 bg-white dark:bg-gray-800 dark:border-blue-900/30"
                key={raid.id}
              >
                <div className="w-full h-40 overflow-hidden">
                  <img src={raid.image || "/placeholder.svg"} alt={raid.title} className="w-full h-full object-cover" />
                </div>
                <CardHeader>
                  <CardTitle className="text-[#0099cc] dark:text-blue-400">{raid.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 dark:text-gray-300">
                    <CalendarDays className="h-4 w-4" />
                    {raid.date} às {raid.time}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{raid.participants} participantes</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        className="bg-[#0099cc] hover:bg-[#0077aa] dark:bg-blue-700 dark:hover:bg-blue-600"
                        onClick={() => router.push(`/caller/${params.id}/raid/${raid.id}`)}
                      >
                        Gerenciar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#0099cc] text-[#0099cc] dark:border-blue-700 dark:text-blue-400"
                        onClick={() => shareRaidIPForm(raid.id)}
                      >
                        Compartilhar Formulário
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/mor-status"
          className="text-[#0099cc] hover:underline dark:text-blue-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver Status MOR de Todos os Jogadores
        </Link>
      </div>
    </main>
  )
}
