import { NextResponse } from "next/server"
import { syncRaidHelperEvents } from "@/lib/raid-helper"

export async function GET(request: Request) {
  try {
    // Usar a chave API diretamente ou das variáveis de ambiente
    const apiKey = process.env.RAID_HELPER_API_KEY || "ytwv9b1ocPcdZn6UcS0TA0KRPZSnEZTNGQzM3OFe"

    const result = await syncRaidHelperEvents(apiKey)

    if (result.success) {
      return NextResponse.json({ message: result.message })
    } else {
      return NextResponse.json({ error: result.message, details: result.error }, { status: 500 })
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
