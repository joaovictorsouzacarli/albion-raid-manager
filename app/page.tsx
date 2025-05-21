"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Moon, Sun } from 'lucide-react'
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Caller {
  discord_id: string
  name: string
  avatar_url: string | null
}

// Lista de callers padrão
const defaultCallers: Caller[] = [
  { discord_id: "BiancaDosVenenos", name: "[CALLER] BiancaDosVenenos", avatar_url: null },
  { discord_id: "Vasstian", name: "[CALLER] Vasstian", avatar_url: null },
  { discord_id: "AnyBonita", name: "[CALLER] AnyBonita", avatar_url: null },
  { discord_id: "VitorGomes", name: "[CALLER] VitorGomes", avatar_url: null },
  { discord_id: "Juniorgeminha", name: "[CALLER] Juniorgeminha", avatar_url: null },
  { discord_id: "PerfectTiming", name: "[CALLER] PerfectTiming", avatar_url: null },
  { discord_id: "Guuzs", name: "[CALLER] Guuzs", avatar_url: null },
  { discord_id: "Chimpsz", name: "[NE- PVE] Chimpsz", avatar_url: null },
  { discord_id: "PsychoDemon", name: "![NE] PsychoDemon", avatar_url: null },
  { discord_id: "SeiyaD", name: "[NE4] SeiyaD", avatar_url: null },
  { discord_id: "Drkiller", name: "[DOLLY CALLER] Drkiller", avatar_url: null },
]

export default function Home() {
  const [callers, setCallers] = useState<Caller[]>(defaultCallers)
  const [loading, setLoading] = useState(true)
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

    // Carregar callers
    loadCallers()
  }, [])

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

  const loadCallers = async () => {
    setLoading(true)
    try {
      // Carregar callers do Supabase
      const { data, error } = await supabase.from("callers").select("*").order("name")

      if (error) {
        throw error
      }

      // Se houver dados do banco, use-os; caso contrário, mantenha os callers padrão
      if (data && data.length > 0) {
        setCallers(data)
      }
    } catch (error) {
      console.error("Erro ao carregar callers:", error)
      // Já estamos usando os callers padrão como estado inicial, então não precisamos fazer nada aqui
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`container mx-auto py-8 px-4 ${darkMode ? "dark bg-gray-900 text-gray-100" : "bg-[#f0f8ff]"}`}>
      <div className="flex justify-end mb-4">
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

      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <img src="/lobo-azul-sem-fundo.png" alt="Neve Eterna Logo" className="w-32 h-32 object-contain" />
        </div>
        <h1 className="text-3xl font-bold text-[#0099cc] dark:text-blue-400">Albion Raid Manager</h1>
        <p className="text-muted-foreground dark:text-gray-400">Sistema de Gerenciamento de Raids da Neve Eterna</p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-[#0099cc] dark:text-blue-400">Selecione um Caller</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0099cc] dark:border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {callers.map((caller) => (
              <Link key={caller.discord_id} href={`/caller/${caller.discord_id}`}>
                <Card className="h-full transition-all hover:shadow-md hover:border-[#0099cc] border-[#0099cc]/20 bg-white dark:bg-gray-800 dark:border-blue-900/30 dark:hover:border-blue-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[#0099cc] dark:text-blue-400">{caller.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#e6f7ff] dark:bg-blue-900/30 flex items-center justify-center">
                        {caller.avatar_url ? (
                          <img
                            src={caller.avatar_url || "/placeholder.svg"}
                            alt={caller.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-[#0099cc] dark:text-blue-400 text-xl font-bold">
                            {caller.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground dark:text-gray-400">
                        Clique para gerenciar raids
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
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
    </div>
  )
}