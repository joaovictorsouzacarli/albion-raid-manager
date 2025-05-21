"use client"

import Link from "next/link"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Shield, Sword, Heart, Star, Search, Wand2, Zap, Target, Eye, Moon, Sun } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface MorPlayer {
  id: number;
  name: string;
  role: string;
  secondaryRole?: string;
  ip: number;
  raidMissed: string;
  caller: string;
  date: string;
}

export default function MorStatusPage() {
  const [morPlayers, setMorPlayers] = useState<MorPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
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

    // Buscar jogadores com status MOR
    loadMorPlayers();
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

  const loadMorPlayers = async () => {
    try {
      // Buscar jogadores com status MOR do Supabase
      const { data, error } = await supabase
        .from('mor_status')
        .select(`
          player_id,
          raid_id,
          date,
          players(id, name),
          raids(title),
          callers(name),
          raid_registrations(role, secondary_role, ip)
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      // Formatar os dados
      const formattedPlayers = data.map(item => ({
        id: item.player_id,
        name: item.players.name,
        role: item.raid_registrations[0]?.role || 'Desconhecido',
        secondaryRole: item.raid_registrations[0]?.secondary_role || undefined,
        ip: item.raid_registrations[0]?.ip || 0,
        raidMissed: item.raids.title,
        caller: item.callers.name,
        date: format(new Date(item.date), 'dd/MM/yyyy', { locale: ptBR })
      }));

      setMorPlayers(formattedPlayers);
    } catch (error) {
      console.error('Erro ao carregar jogadores com MOR:', error);
    } finally {
      setLoading(false);
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Off Tank":
        return <Shield className="h-4 w-4 text-[#0099cc] dark:text-blue-400" />
      case "Healer":
        return <Heart className="h-4 w-4 text-green-500" />
      case "Elevado":
      case "Silence":
        return <Wand2 className="h-4 w-4 text-purple-500" />
      case "Debuff":
        return <Zap className="h-4 w-4 text-yellow-500" />
      case "Raiz Férrea":
        return <Eye className="h-4 w-4 text-green-700 dark:text-green-500" />
      case "DPS":
      case "X-Bow":
      case "Águia":
      case "Frost":
      case "Fire":
      case "Raiz Férrea DPS":
        return <Target className="h-4 w-4 text-red-500" />
      case "Scout":
        return <Eye className="h-4 w-4 text-blue-400" />
      case "Oculto":
        return <Zap className="h-4 w-4 text-purple-600" />
      case "Roletroll":
        return <Star className="h-4 w-4 text-yellow-500" />
      default:
        return <Sword className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredPlayers = morPlayers.filter((player) => player.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <main className={`container mx-auto py-8 px-4 ${darkMode ? "dark bg-gray-900 text-gray-100" : "bg-[#f0f8ff]"}`}>
      <div className="mb-8">
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
        <div className="flex flex-col items-center gap-4 mb-6">
          <img src="/lobo-azul-sem-fundo.png" alt="Neve Eterna Logo" className="w-20 h-20 object-contain" />
          <h1 className="text-3xl font-bold text-[#0099cc] dark:text-blue-400">Status MOR</h1>
        </div>
        <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-4 dark:text-gray-300">
          Visualize todos os jogadores que possuem status MOR (prioridade) para as próximas raids da Neve Eterna
        </p>
        <div className="max-w-3xl mx-auto p-4 bg-[#e6f7ff] rounded-lg border border-[#0099cc]/20 dark:bg-blue-900/20 dark:border-blue-800/30">
          <h2 className="font-medium text-[#0099cc] mb-2 dark:text-blue-400">Como funciona o sistema MOR:</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Jogadores recebem status MOR quando não são selecionados para uma raid</li>
            <li>
              Jogadores com MOR têm <strong>prioridade</strong> em raids futuras, independente do IP
            </li>
            <li>
              O status MOR é <strong>removido automaticamente</strong> quando o jogador participa de uma raid
            </li>
            <li>Todos os callers da guilda podem ver o status MOR de qualquer jogador nesta página</li>
            <li>Após perder o MOR, o jogador pode receber novamente em outra raid se não for selecionado</li>
          </ul>
        </div>
      </div>

      <Card className="mb-6 border-[#0099cc]/20 bg-white dark:bg-gray-800 dark:border-blue-900/30">
        <CardHeader>
          <CardTitle className="text-[#0099cc] dark:text-blue-400">Buscar Jogador</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Verifique se um jogador específico possui status MOR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground dark:text-gray-500" />
              <Input
                type="search"
                placeholder="Digite o nome do jogador..."
                className="pl-8 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="border-[#0099cc] text-[#0099cc] dark:border-blue-700 dark:text-blue-400"
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0099cc] dark:border-blue-500"></div>
        </div>
      ) : (
        <Card className="border-[#0099cc]/20 bg-white dark:bg-gray-800 dark:border-blue-900/30">
          <CardHeader>
            <CardTitle className="text-[#0099cc] dark:text-blue-400">Jogadores com Status MOR</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Estes jogadores têm prioridade nas próximas raids
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground dark:text-gray-400">
                  {searchTerm ? "Nenhum jogador encontrado com este nome" : "Nenhum jogador com status MOR no momento"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="dark:text-gray-300">Jogador</TableHead>
                    <TableHead className="dark:text-gray-300">Função</TableHead>
                    <TableHead className="text-right dark:text-gray-300">IP</TableHead>
                    <TableHead className="dark:text-gray-300">Raid Perdida</TableHead>
                    <TableHead className="dark:text-gray-300">Caller</TableHead>
                    <TableHead className="dark:text-gray-300">Data</TableHead>
                    <TableHead className="dark:text-gray-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.map((player) => (
                    <TableRow key={player.id} className="dark:border-gray-700">
                      <TableCell className="font-medium dark:text-gray-200">{player.name}</TableCell>
                      <TableCell className="dark:text-gray-200">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            {getRoleIcon(player.role)}
                            <span>{player.role}</span>
                          </div>
                          {player.secondaryRole && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                              <span>Secundária:</span>
                              {getRoleIcon(player.secondaryRole)}
                              <span>{player.secondaryRole}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right dark:text-gray-200">{player.ip}</TableCell>
                      <TableCell className="dark:text-gray-200">{player.raidMissed}</TableCell>
                      <TableCell className="dark:text-gray-200">{player.caller}</TableCell>
                      <TableCell className="dark:text-gray-200">{player.date}</TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-500 dark:bg-yellow-600">MOR Ativo</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-8 text-center">
        <Link href="/" className="text-[#0099cc] hover:underline dark:text-blue-400">
          Voltar para a página inicial
        </Link>
      </div>
    </main>
  )
}