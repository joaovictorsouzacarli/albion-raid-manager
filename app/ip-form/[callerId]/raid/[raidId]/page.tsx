"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Sword, Heart, Star, Wand2, Zap, Target, Flame, CloudSnowIcon as Snow, Eye, AlertCircle, Terminal } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface RaidInfo {
  id: number;
  title: string;
  caller: string;
  date: string;
}

export default function IpFormPage({
  params,
}: {
  params: { callerId: string; raidId: string }
}) {
  const [playerName, setPlayerName] = useState("")
  const [playerRole, setPlayerRole] = useState("")
  const [playerSecondaryRole, setPlayerSecondaryRole] = useState("")
  const [playerIp, setPlayerIp] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [raidInfo, setRaidInfo] = useState<RaidInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRaidInfo();
  }, [params.callerId, params.raidId]);

  const loadRaidInfo = async () => {
    try {
      // Buscar informações da raid
      const { data: raidData, error: raidError } = await supabase
        .from('raids')
        .select(`
          id,
          title,
          date,
          callers(name)
        `)
        .eq('id', params.raidId)
        .single();

      if (raidError) throw raidError;

      setRaidInfo({
        id: raidData.id,
        title: raidData.title,
        caller: raidData.callers.name,
        date: format(new Date(raidData.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
      });
    } catch (error) {
      console.error('Erro ao carregar informações da raid:', error);
      setError('Não foi possível carregar as informações da raid. Verifique se o link está correto.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Verificar se o jogador já existe
      const { data: existingPlayer, error: playerError } = await supabase
        .from('players')
        .select('id')
        .eq('name', playerName)
        .maybeSingle();

      let playerId;

      if (existingPlayer) {
        playerId = existingPlayer.id;
      } else {
        // Criar novo jogador
        const { data: newPlayer, error: newPlayerError } = await supabase
          .from('players')
          .insert({ name: playerName })
          .select('id')
          .single();

        if (newPlayerError) throw newPlayerError;
        playerId = newPlayer.id;
      }

      // Verificar se o jogador já está registrado nesta raid
      const { data: existingReg, error: regError } = await supabase
        .from('raid_registrations')
        .select('id')
        .eq('raid_id', params.raidId)
        .eq('player_id', playerId)
        .maybeSingle();

      if (existingReg) {
        // Atualizar registro existente
        const { error: updateError } = await supabase
          .from('raid_registrations')
          .update({
            role: playerRole,
            secondary_role: playerSecondaryRole !== "none" ? playerSecondaryRole : null,
            ip: Number.parseInt(playerIp) || 0
          })
          .eq('id', existingReg.id);

        if (updateError) throw updateError;
      } else {
        // Criar novo registro
        const { error: insertError } = await supabase
          .from('raid_registrations')
          .insert({
            raid_id: Number(params.raidId),
            player_id: playerId,
            role: playerRole,
            secondary_role: playerSecondaryRole !== "none" ? playerSecondaryRole : null,
            ip: Number.parseInt(playerIp) || 0,
            selected: false,
            mor: false
          });

        if (insertError) throw insertError;
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      alert('Erro ao enviar formulário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container max-w-md mx-auto py-12 px-4 bg-[#f0f8ff] dark:bg-gray-900 min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0099cc] dark:border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-md mx-auto py-12 px-4 bg-[#f0f8ff] dark:bg-gray-900 min-h-screen">
        <Card className="border-red-200 bg-white dark:bg-gray-800 dark:border-red-900/30">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <img src="/lobo-azul-sem-fundo.png" alt="Neve Eterna Logo" className="w-24 h-24 object-contain" />
            </div>
            <CardTitle className="text-center text-red-600 dark:text-red-400">Erro</CardTitle>
            <CardDescription className="text-center dark:text-gray-300">
              {error}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="border-[#0099cc] text-[#0099cc] dark:border-blue-700 dark:text-blue-400"
            >
              Voltar para a página inicial
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="container max-w-md mx-auto py-12 px-4 bg-[#f0f8ff] dark:bg-gray-900 min-h-screen">
        <Card className="border-[#0099cc]/20 bg-white dark:bg-gray-800 dark:border-blue-900/30">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <img src="/lobo-azul-sem-fundo.png" alt="Neve Eterna Logo" className="w-24 h-24 object-contain" />
            </div>
            <CardTitle className="text-center text-green-600 dark:text-green-400">Informações Enviadas!</CardTitle>
            <CardDescription className="text-center dark:text-gray-300">
              Seu IP foi registrado com sucesso para a raid.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 p-4 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center space-y-2 dark:text-gray-200">
              <p className="text-lg font-medium">{raidInfo?.title}</p>
              <p>
                <strong>Nome:</strong> {playerName}
              </p>
              <p>
                <strong>Função:</strong> {playerRole}
              </p>
              {playerSecondaryRole && playerSecondaryRole !== "none" && (
                <p>
                  <strong>Função Secundária:</strong> {playerSecondaryRole}
                </p>
              )}
              <p>
                <strong>IP do item de disputa:</strong> {playerIp}
              </p>
            </div>

            <Alert className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <Terminal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-400 text-sm font-medium">
                Comando Importante
              </AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300 text-xs">
                Lembre-se de digitar o comando <strong>#forcecityoverload true</strong> no jogo antes de entrar na raid.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full bg-[#0099cc] hover:bg-[#0077aa] dark:bg-blue-700 dark:hover:bg-blue-600"
              onClick={() => {
                setPlayerName("")
                setPlayerRole("")
                setPlayerSecondaryRole("")
                setPlayerIp("")
                setIsSubmitted(false)
              }}
            >
              Enviar Outro IP
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Resto do código permanece o mesmo
}