"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Shield, Sword, Users, SnowflakeIcon, Moon, Sun } from 'lucide-react'
import { supabase } from "@/lib/supabase"

interface Caller {
  id: number;
  discord_id: string;
  name: string;
  avatar_url: string | null;
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(false)
  const [callers, setCallers] = useState<Caller[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar preferência de tema
    const savedDarkMode = localStorage.getItem("darkMode") === "true"
    setDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Buscar callers do Supabase
    async function fetchCallers() {
      try {
        const { data, error } = await supabase
          .from('callers')
          .select('*')
          .order('name');

        if (error) throw error;
        setCallers(data || []);
      } catch (error) {
        console.error('Erro ao buscar callers:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCallers();
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

  return (return (
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
    
    {/* Resto do seu código */}
  </div>
)