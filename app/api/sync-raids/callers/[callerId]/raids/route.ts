import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { callerId: string } }) {
  try {
    console.log(`Buscando raids para o caller: ${params.callerId}`)

    // Buscar raids do caller
    const { data, error } = await supabase
      .from("raids")
      .select(`
        id, 
        raid_helper_id,
        title, 
        description, 
        date, 
        caller_id, 
        caller_name, 
        image_url,
        players (id)
      `)
      .eq("caller_id", params.callerId)
      .order("date", { ascending: true })

    if (error) {
      console.error("Erro ao buscar raids:", error)
      throw error
    }

    // Processar os dados para incluir a contagem de participantes
    const raids = data.map((raid) => ({
      id: raid.id,
      raid_helper_id: raid.raid_helper_id,
      title: raid.title,
      description: raid.description,
      date: raid.date,
      caller_id: raid.caller_id,
      caller_name: raid.caller_name,
      image_url: raid.image_url,
      participants_count: Array.isArray(raid.players) ? raid.players.length : 0,
    }))

    return NextResponse.json({ raids })
  } catch (error) {
    console.error("Erro na rota de busca de raids do caller:", error)
    return NextResponse.json(
      {
        error: "Erro ao buscar raids",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
