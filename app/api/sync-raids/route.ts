// app/api/sync-raids/route.ts
import { NextResponse } from "next/server"
import { syncRaidHelperEvents } from "@/lib/raid-helper"

export async function GET(request: Request) {
  try {
    console.log("Iniciando sincronização de raids...")
    
    // Usar a chave API diretamente ou das variáveis de ambiente
    const apiKey = process.env.RAID_HELPER_API_KEY || ""
    
    if (!apiKey) {
      console.error("Chave de API do Raid Helper não configurada")
      return NextResponse.json({ 
        error: "Chave de API do Raid Helper não configurada. Configure a variável de ambiente RAID_HELPER_API_KEY." 
      }, { status: 400 })
    }

    console.log("Chamando função de sincronização com a chave API")
    const result = await syncRaidHelperEvents(apiKey)

    if (result.success) {
      console.log("Sincronização concluída com sucesso:", result.message)
      return NextResponse.json({ message: result.message })
    } else {
      console.error("Erro na sincronização:", result.message, result.error)
      return NextResponse.json({ 
        error: result.message, 
        details: result.error 
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Erro na rota de sincronização:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}