import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// Lista de callers iniciais com os IDs corretos
const initialCallers = [
  { discord_id: "277048408689213440", name: "[CALLER] AnyBonita", avatar_url: null },
  { discord_id: "1265190976465535010", name: "[CALLER] BiancaDosVenenos", avatar_url: null },
  { discord_id: "414636718235320341", name: "[CALLER] Guuzs", avatar_url: null },
  { discord_id: "217817250709635074", name: "[CALLER] Juniorgeminha", avatar_url: null },
  { discord_id: "1069633258523996270", name: "[CALLER] PerfectTiming", avatar_url: null },
  { discord_id: "238847241240969227", name: "[CALLER] Vasstian", avatar_url: null },
  { discord_id: "450677997184221185", name: "[CALLER] VitorGomes", avatar_url: null },
  { discord_id: "499831747156901889", name: "[DOLLY CALLER] DrkiIIer", avatar_url: null },
  { discord_id: "513457285490802726", name: "[NE4] SeiyaD", avatar_url: null },
  { discord_id: "436916479401656331", name: "![NE] PsychoDemon", avatar_url: null },
  { discord_id: "1322055586170404975", name: "[NE- PVE] Chimpsz", avatar_url: null },
]

// SQL para criar as tabelas necessárias
const createTableSQL = `
-- Habilitar a extensão uuid-ossp se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de callers
CREATE TABLE IF NOT EXISTS callers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discord_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de raids
CREATE TABLE IF NOT EXISTS raids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raid_helper_id TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  caller_id TEXT NOT NULL REFERENCES callers(discord_id) ON DELETE CASCADE,
  caller_name TEXT,
  image_url TEXT,
  last_synced TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de jogadores
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  discord_id TEXT,
  role TEXT NOT NULL,
  secondary_role TEXT,
  ip INTEGER NOT NULL DEFAULT 0,
  selected BOOLEAN DEFAULT FALSE,
  mor BOOLEAN DEFAULT FALSE,
  raid_id UUID NOT NULL REFERENCES raids(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`

export async function GET() {
  try {
    // Executar SQL para criar tabelas
    const { error: sqlError } = await supabaseAdmin.rpc("exec_sql", { sql: createTableSQL })

    if (sqlError) {
      console.error("Erro ao criar tabelas:", sqlError)
      return NextResponse.json({ error: "Erro ao criar tabelas", details: sqlError }, { status: 500 })
    }

    // Inserir callers
    const { data, error } = await supabaseAdmin
      .from("callers")
      .upsert(initialCallers, { onConflict: "discord_id" })
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: "Configuração inicial concluída",
      callersAdded: data?.length || 0,
    })
  } catch (error) {
    console.error("Erro na configuração inicial:", error)
    return NextResponse.json(
      {
        error: "Erro na configuração inicial",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}