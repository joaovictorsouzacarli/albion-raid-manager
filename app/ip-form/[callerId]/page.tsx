"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Moon, Sun } from 'lucide-react'
import Link from "next/link"

// Este arquivo serve como redirecionador para o formulário específico da raid
// Os jogadores devem acessar diretamente o link para a raid específica

export default function IPFormPage({ params }: { params: { callerId: string } }) {
  const router = useRouter()
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
    
    // Redirecionar para a página principal após um breve delay
    const timer = setTimeout(() => {
      router.push("/")
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [router])
  
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
  
  return (
    <main className={`container mx-auto py-8 px-4 min-h-screen ${darkMode ? "dark bg-gray-900" : "bg-[#f0f8ff]"}`}>
      <div className="mb-8 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center text-muted-foreground hover:text-foreground mb-4 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar para a página inicial
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
      
      <Card className="max-w-md mx-auto border-[#0099cc]/20 bg-white dark:bg-gray-800 dark:border-blue-900/30">
        <CardHeader>
          <CardTitle className="text-center text-[#0099cc] dark:text-blue-400">Redirecionando...</CardTitle>
          <CardDescription className="text-center dark:text-gray-300">
            Este link não é mais válido. Por favor, use o link específico da raid.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 dark:text-gray-300">
            Você será redirecionado para a página inicial em alguns segundos.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-[#0099cc] hover:bg-[#0077aa] dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Ir para a página inicial agora
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}