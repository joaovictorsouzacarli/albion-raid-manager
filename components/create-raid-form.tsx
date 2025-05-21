"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon } from 'lucide-react'
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface CreateRaidFormProps {
  callerId: string
  onSuccess: () => void
}

export function CreateRaidForm({ callerId, onSuccess }: CreateRaidFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState("20:00")
  const [imageUrl, setImageUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !date) {
      alert("Título e data são obrigatórios")
      return
    }

    setIsSubmitting(true)

    try {
      // Combinar data e hora
      const [hours, minutes] = time.split(":").map(Number)
      const raidDate = new Date(date)
      raidDate.setHours(hours, minutes)

      const response = await fetch("/api/raids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description: description || undefined,
          date: raidDate.toISOString(),
          callerId,
          imageUrl: imageUrl || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar raid")
      }

      alert("Raid criada com sucesso!")
      setTitle("")
      setDescription("")
      setDate(new Date())
      setTime("20:00")
      setImageUrl("")
      onSuccess()
    } catch (error) {
      console.error("Erro ao criar raid:", error)
      alert(`Erro ao criar raid: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-[#0099cc]/20 bg-white dark:bg-gray-800 dark:border-blue-900/30">
      <CardHeader>
        <CardTitle className="text-[#0099cc] dark:text-blue-400">Criar Nova Raid</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="dark:text-gray-200">
              Título da Raid
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Avalonian T8 Dungeon"
              required
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="dark:text-gray-200">
              Descrição (opcional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes adicionais sobre a raid"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="dark:text-gray-200">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={ptBR} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="dark:text-gray-200">
                Horário
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="dark:text-gray-200">
              URL da Imagem (opcional)
            </Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-[#0099cc] hover:bg-[#0077aa] dark:bg-blue-700 dark:hover:bg-blue-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Criando...
              </>
            ) : (
              "Criar Raid"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}