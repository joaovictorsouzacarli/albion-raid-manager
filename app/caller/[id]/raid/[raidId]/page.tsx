"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Shield, Sword, Heart, Star, Wand2, Zap, Target, Eye, Moon, Sun, Pencil, Save, X, Copy, Dices, AlertCircle } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Tipos específicos para funções de Albion Online
type AlbionRole =
  | "Off Tank"
  | "Elevado"
  | "Silence"
  | "Healer"
  | "Raiz Férrea"
  | "X-Bow"
  | "Águia"
  | "Frost"
  | "Fire"
  | "Raiz Férrea DPS"
  | "Roletroll"
  | "Scout"
  | "Oculto"
  | "Debuff"

interface Player {
  id: number;
  registration_id: number;
  name: string;
  role: AlbionRole;
  secondaryRole?: AlbionRole | "";
  ip: number;
  selected: boolean;
  mor: boolean;
}

interface RaidDetails {
  id: number;
  raid_helper_id: string;
  title: string;
  description: string | null;
  date: string;
  caller_name: string;
}

export default function RaidPage({
  params,
}: {
  params: { id: string; raidId: string }
}) {
  const [raidData, setRaidData] = useState<RaidDetails | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<number | null>(null)
  const [editRole, setEditRole] = useState<AlbionRole | "">("")
  const [editIp, setEditIp] = useState("")
  const [showTrollDialog, setShowTrollDialog] = useState(false)
  const [selectedTroll, setSelectedTroll] = useState<Player | null>(null)

  useEffect(() => {
    // Verificar autenticação
    const token = localStorage.getItem(`caller_token_${params.id}`)
    if (token) {
      setIsAuthenticated(true)
      loadRaidData()
    } else {
      // Redirecionar para login se não estiver autenticado
      window.location.href = `/caller/${params.id}`
    }

    // Verificar preferência de tema
    const savedDarkMode = localStorage.getItem("darkMode") === "true"
    setDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [params.id, params.raidId])

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

  const loadRaidData = async () => {
    try {
      // Buscar detalhes da raid
      const { data: raidDetails, error: raidError } = await supabase
        .from('raids')
        .select(`
          id,
          raid_helper_id,
          title,
          description,
          date,
          callers(name)
        `)
        .eq('id', params.raidId)
        .single();

      if (raidError) throw raidError;

      setRaidData({
        id: raidDetails.id,
        raid_helper_id: raidDetails.raid_helper_id,
        title: raidDetails.title,
        description: raidDetails.description,
        date: raidDetails.date,
        caller_name: raidDetails.callers.name
      });

      // Buscar jogadores inscritos na raid
      const { data: registrations, error: regError } = await supabase
        .from('raid_registrations')
        .select(`
          id,
          role,
          secondary_role,
          ip,
          selected,
          mor,
          players(id, name)
        `)
        .eq('raid_id', params.raidId);

      if (regError) throw regError;

      // Formatar os dados dos jogadores
      const formattedPlayers = registrations.map(reg => ({
        id: reg.players.id,
        registration_id: reg.id,
        name: reg.players.name,
        role: reg.role as AlbionRole,
        secondaryRole: reg.secondary_role as AlbionRole | "",
        ip: reg.ip,
        selected: reg.selected,
        mor: reg.mor
      }));

      setPlayers(formattedPlayers);
    } catch (error) {
      console.error('Erro ao carregar dados da raid:', error);
    } finally {
      setLoading(false);
    }
  }

  // Iniciar edição de um jogador
  const startEditing = (registrationId: number) => {
    const player = players.find((p) => p.registration_id === registrationId)
    if (player) {
      setEditingPlayer(registrationId)
      setEditRole(player.role)
      setEditIp(player.ip.toString())
    }
  }

  // Salvar edição de um jogador
  const saveEditing = async (registrationId: number) => {
    if (!editRole) return // Não salvar se a função estiver vazia

    try {
      // Atualizar no Supabase
      const { error } = await supabase
        .from('raid_registrations')
        .update({
          role: editRole,
          ip: Number.parseInt(editIp) || 0
        })
        .eq('id', registrationId);

      if (error) throw error;

      // Atualizar estado local
      setPlayers(
        players.map((player) =>
          player.registration_id === registrationId
            ? {
                ...player,
                role: editRole as AlbionRole,
                ip: Number.parseInt(editIp) || player.ip,
              }
            : player,
        ),
      )
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
      alert('Erro ao salvar edição. Tente novamente.');
    }

    setEditingPlayer(null)
  }

  // Cancelar edição
  const cancelEditing = () => {
    setEditingPlayer(null)
  }

  // Atualizar a funcionalidade de compartilhar link
  const shareIPFormLink = () => {
    if (typeof window !== "undefined") {
      const linkUrl = `${window.location.origin}/ip-form/${params.id}/raid/${params.raidId}`
      navigator.clipboard.writeText(linkUrl)
      alert("Link do formulário IP copiado para a área de transferência!")
    }
  }

  // Modificar a função togglePlayerSelection
  const togglePlayerSelection = async (registrationId: number) => {
    try {
      const player = players.find(p => p.registration_id === registrationId);
      if (!player) return;

      const newSelected = !player.selected;
      
      // Se estiver sendo selecionado e tinha MOR, remover o MOR
      const newMor = newSelected ? false : player.mor;

      // Atualizar no Supabase
      const { error } = await supabase
        .from('raid_registrations')
        .update({
          selected: newSelected,
          mor: newMor
        })
        .eq('id', registrationId);

      if (error) throw error;

      // Atualizar estado local
      setPlayers(
        players.map((p) => 
          p.registration_id === registrationId 
            ? { ...p, selected: newSelected, mor: newMor } 
            : p
        )
      );

      // Se o jogador estava com MOR e foi selecionado, remover da tabela mor_status
      if (player.mor && newSelected) {
        await supabase
          .from('mor_status')
          .delete()
          .eq('player_id', player.id)
          .eq('raid_id', params.raidId);
      }
    } catch (error) {
      console.error('Erro ao atualizar seleção:', error);
      alert('Erro ao atualizar seleção. Tente novamente.');
    }
  }

  const togglePlayerMor = async (registrationId: number) => {
    try {
      const player = players.find(p => p.registration_id === registrationId);
      if (!player) return;

      const newMor = !player.mor;

      // Atualizar no Supabase
      const { error } = await supabase
        .from('raid_registrations')
        .update({
          mor: newMor
        })
        .eq('id', registrationId);

      if (error) throw error;

      // Atualizar estado local
      setPlayers(
        players.map((p) => 
          p.registration_id === registrationId 
            ? { ...p, mor: newMor } 
            : p
        )
      );

      // Se o jogador recebeu MOR, adicionar à tabela mor_status
      if (newMor) {
        // Buscar caller_id
        const { data: raidData } = await supabase
          .from('raids')
          .select('caller_id')
          .eq('id', params.raidId)
          .single();

        if (raidData) {
          await supabase
            .from('mor_status')
            .upsert({
              player_id: player.id,
              raid_id: Number(params.raidId),
              caller_id: raidData.caller_id
            });
        }
      } else {
        // Se o MOR foi removido, remover da tabela mor_status
        await supabase
          .from('mor_status')
          .delete()
          .eq('player_id', player.id)
          .eq('raid_id', params.raidId);
      }
    } catch (error) {
      console.error('Erro ao atualizar MOR:', error);
      alert('Erro ao atualizar MOR. Tente novamente.');
    }
  }

  // Copiar comando para convidar jogador
  const copyInviteCommand = (playerName: string) => {
    const command = `/invite ${playerName}`
    navigator.clipboard.writeText(command)
    alert(`Comando "${command}" copiado para a área de transferência!`)
  }

  // Sortear um jogador Troll
  const selectRandomTroll = () => {
    const trollPlayers = players.filter((player) => player.role === "Roletroll")
    if (trollPlayers.length > 0) {
      const randomIndex = Math.floor(Math.random() * trollPlayers.length)
      const selectedTroll = trollPlayers[randomIndex]
      setSelectedTroll(selectedTroll)
      setShowTrollDialog(true)
    } else {
      alert("Não há jogadores com a função Roletroll para sortear!")
    }
  }

  // Finalizar seleção e atualizar status MOR
  const finalizeSelection = async () => {
    try {
      // Para cada jogador selecionado com MOR
      for (const player of players) {
        if (player.selected && player.mor) {
          // Remover MOR no Supabase
          await supabase
            .from('raid_registrations')
            .update({ mor: false })
            .eq('id', player.registration_id);

          // Remover da tabela mor_status
          await supabase
            .from('mor_status')
            .delete()
            .eq('player_id', player.id)
            .eq('raid_id', params.raidId);
        }
      }

      // Atualizar estado local
      setPlayers(
        players.map((player) => 
          player.selected && player.mor 
            ? { ...player, mor: false } 
            : player
        )
      );

      alert("Seleção finalizada! Jogadores selecionados com MOR perderam o status.");
    } catch (error) {
      console.error('Erro ao finalizar seleção:', error);
      alert('Erro ao finalizar seleção. Tente novamente.');
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

  // Agrupar jogadores por categoria
  const tanks = players.filter((p) => p.role === "Off Tank")
  const healers = players.filter((p) => p.role === "Healer")
  const arcanes = players.filter((p) => p.role === "Elevado" || p.role === "Silence")
  const debuffs = players.filter((p) => p.role === "Debuff")
  const roots = players.filter((p) => p.role === "Raiz Férrea")
  const dps = players.filter(
    (p) =>
      p.role === "X-Bow" ||
      p.role === "Águia" ||
      p.role === "Frost" ||
      p.role === "Fire" ||
      p.role === "Raiz Férrea DPS",
  )
  const trolls = players.filter((p) => p.role === "Roletroll")
  const scouts = players.filter((p) => p.role === "Scout" || p.role === "Oculto")

  // Sort each category by MOR first, then by IP
  const sortPlayers = (players: Player[]) => {
    return [...players].sort((a, b) => {
      if (a.mor && !b.mor) return -1
      if (!a.mor && b.mor) return 1
      return b.ip - a.ip
    })
  }

  const sortedTanks = sortPlayers(tanks)
  const sortedHealers = sortPlayers(healers)
  const sortedArcanes = sortPlayers(arcanes)
  const sortedDebuffs = sortPlayers(debuffs)
  const sortedRoots = sortPlayers(roots)
  const sortedDps = sortPlayers(dps)
  const sortedTrolls = sortPlayers(trolls)
  const sortedScouts = sortPlayers(scouts)

  const selectedPlayers = players.filter((player) => player.selected)
  const morPlayers = players.filter((player) => !player.selected && player.mor)

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f0f8ff] dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0099cc] dark:border-blue-500"></div>
      </div>
    )
  }

  return (
    <main className={`container mx-auto py-8 px-4 ${darkMode ? "dark bg-gray-900 text-gray-100" : "bg-[#f0f8ff]"}`}>
      {/* Resto do código permanece o mesmo, mas com as funções atualizadas para usar o Supabase */}
    </main>
  )
}