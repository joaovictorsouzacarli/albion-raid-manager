// lib/raid-helper.ts
import { supabase } from "./supabase"

// Interface para os eventos do Raid Helper v3
export interface RaidHelperEvent {
  id: string
  name: string
  description?: string
  leaderId?: string
  author?: {
    id: string
    name: string
  }
  leader?: {
    id: string
    name: string
  }
  date: string
  time: string
  timestamp?: number
  image?: string
  signups?: Array<{
    id: string
    name: string
    username?: string
    class?: string
    spec?: string
  }>
}

// Função para buscar eventos do Raid Helper usando a API v3
export async function fetchRaidHelperEvents(apiKey = "") {
  try {
    console.log("Buscando eventos do Raid Helper usando a API v3...")
    
    // ID do servidor Discord
    const SERVER_ID = process.env.DISCORD_ID || "1313368815635009537"
    
    if (!apiKey) {
      console.error("Chave de API do Raid Helper não fornecida")
      throw new Error("Chave de API do Raid Helper não fornecida")
    }

    console.log(`Usando SERVER_ID: ${SERVER_ID}`)
    console.log(`Usando API Key: ${apiKey ? "Configurada" : "Não configurada"}`)

    // Endpoint correto da API v3
    const url = `https://raid-helper.dev/api/v3/servers/${SERVER_ID}/events`
    console.log(`URL da requisição: ${url}`)

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "AlbionRaidManager/1.0" // Adicionar User-Agent
    }

    console.log("Headers da requisição:", headers)

    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    })

    console.log(`Status da resposta: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Erro na resposta da API:`)
      console.error(`Status: ${response.status} ${response.statusText}`)
      console.error(`Corpo da resposta: ${errorText}`)
      throw new Error(`Erro ao buscar eventos: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    
    console.log("=== JSON COMPLETO RETORNADO PELA API ===")
    console.log(JSON.stringify(data, null, 2))
    console.log("=== FIM DO JSON ===")
    
    // Verificar se a resposta contém um erro
    if (data.error) {
      console.error("API retornou um erro:", data.error)
      throw new Error(`API retornou um erro: ${data.error}`)
    }
    
    // A estrutura da resposta na v3 pode ter os eventos em diferentes campos
    const events = data.postedEvents || data.events || []
    
    console.log(`Número de eventos encontrados: ${events.length}`)
    
    if (events.length > 0) {
      console.log("=== DETALHES DOS EVENTOS ENCONTRADOS ===")
      events.forEach((event, index) => {
        console.log(`--- Evento ${index + 1} ---`)
        console.log(`ID do evento: ${event.id}`)
        console.log(`Nome: ${event.name}`)
        console.log(`Leader ID: ${event.leaderId}`)
        console.log(`Author ID: ${event.author?.id}`)
        console.log(`Leader objeto: ${JSON.stringify(event.leader)}`)
        console.log(`Author objeto: ${JSON.stringify(event.author)}`)
        console.log(`Evento completo: ${JSON.stringify(event, null, 2)}`)
        console.log("--- Fim do Evento ---")
      })
      console.log("=== FIM DOS DETALHES DOS EVENTOS ===")
    }
    
    return events
  } catch (error) {
    console.error("=== ERRO AO BUSCAR EVENTOS ===")
    console.error("Erro:", error)
    console.error("=== FIM DO ERRO ===")
    throw error
  }
}

// Função para sincronizar eventos do Raid Helper com o Supabase
export async function syncRaidHelperEvents(apiKey = "") {
  try {
    console.log("=== INICIANDO SINCRONIZAÇÃO ===")
    
    if (!apiKey) {
      console.error("Chave de API do Raid Helper não fornecida")
      return { 
        success: false, 
        message: "Chave de API do Raid Helper não fornecida" 
      }
    }

    // Verificar conexão com o Supabase
    try {
      const { data: testData, error: testError } = await supabase.from("callers").select("count").limit(1)
      if (testError) {
        console.error("Erro ao conectar com o Supabase:", testError)
        return { 
          success: false, 
          message: "Erro ao conectar com o banco de dados", 
          error: testError 
        }
      }
      console.log("Conexão com o Supabase estabelecida com sucesso")
    } catch (dbError) {
      console.error("Erro ao testar conexão com o Supabase:", dbError)
      return { 
        success: false, 
        message: "Erro ao conectar com o banco de dados", 
        error: dbError 
      }
    }

    // Buscar eventos do Raid Helper
    let events = []
    try {
      events = await fetchRaidHelperEvents(apiKey)
      console.log(`Encontrados ${events.length} eventos no Raid Helper`)
    } catch (fetchError) {
      console.error("Erro ao buscar eventos do Raid Helper:", fetchError)
      return { 
        success: false, 
        message: "Erro ao buscar eventos do Raid Helper", 
        error: fetchError 
      }
    }

    // Se não houver eventos, retornar sucesso mas sem eventos
    if (events.length === 0) {
      return { 
        success: true, 
        message: "Nenhum evento encontrado para sincronizar" 
      }
    }

    // Buscar todos os callers do banco para comparação
    const { data: allCallers, error: callersError } = await supabase
      .from("callers")
      .select("discord_id, name")

    if (callersError) {
      console.error("Erro ao buscar callers:", callersError)
      return { 
        success: false, 
        message: "Erro ao buscar callers do banco de dados", 
        error: callersError 
      }
    }

    console.log("=== CALLERS NO BANCO DE DADOS ===")
    allCallers?.forEach(caller => {
      console.log(`Caller: ${caller.name} | Discord ID: ${caller.discord_id}`)
    })
    console.log("=== FIM DOS CALLERS ===")

    // Para cada evento, verificar se já existe no Supabase
    let eventsProcessed = 0
    let eventsCreated = 0
    let eventsUpdated = 0
    let errors = []

    for (const event of events) {
      try {
        console.log(`=== PROCESSANDO EVENTO: ${event.name} ===`)
        console.log(`ID do evento: ${event.id}`)

        // Extrair o leaderId de diferentes possíveis campos
        const leaderId = event.leaderId || event.author?.id || event.leader?.id || "unknown"
        const leaderName = event.author?.name || event.leader?.name || "Caller Desconhecido"

        console.log(`Leader ID extraído: ${leaderId}`)
        console.log(`Leader Name extraído: ${leaderName}`)

        // Buscar o caller pelo discord_id
        console.log(`Buscando caller com discord_id: ${leaderId}`)
        
        const { data: callerData, error: callerError } = await supabase
          .from("callers")
          .select("id, discord_id, name")
          .eq("discord_id", leaderId)
          .maybeSingle()

        console.log(`Resultado da busca do caller:`)
        console.log(`Caller encontrado: ${callerData ? "SIM" : "NÃO"}`)
        if (callerData) {
          console.log(`Caller do banco - ID: ${callerData.id}, Discord ID: ${callerData.discord_id}, Nome: ${callerData.name}`)
        }

        // Comparação visual dos IDs
        console.log("=== COMPARAÇÃO DE IDs ===")
        console.log(`ID do evento (leaderId): "${leaderId}"`)
        console.log(`IDs no banco:`)
        allCallers?.forEach(caller => {
          const match = caller.discord_id === leaderId
          console.log(`  "${caller.discord_id}" (${caller.name}) - Match: ${match ? "✓" : "✗"}`)
        })
        console.log("=== FIM DA COMPARAÇÃO ===")

        // Se o caller não existir, criar um novo
        let callerId = leaderId

        if (!callerData) {
          console.log(`Caller ${leaderName} não encontrado, criando novo...`)
          const { data: newCaller, error: callerError } = await supabase
            .from("callers")
            .insert({
              discord_id: leaderId,
              name: leaderName,
              avatar_url: null,
            })
            .select("discord_id")
            .single()

          if (callerError) {
            console.error(`Erro ao criar caller para ${leaderName}:`, callerError)
            errors.push(`Erro ao criar caller para ${leaderName}: ${callerError.message}`)
            continue
          }

          callerId = newCaller.discord_id
          console.log(`Novo caller criado com ID: ${callerId}`)
        } else {
          callerId = callerData.discord_id
          console.log(`Caller encontrado: ${callerId}`)
        }

        // Verificar se o evento já existe no Supabase
        const { data: existingRaid } = await supabase
          .from("raids")
          .select("id")
          .eq("raid_helper_id", event.id)
          .maybeSingle()

        // Preparar a data combinando a data e hora do evento
        let eventDate
        if (event.date && event.time) {
          eventDate = new Date(`${event.date}T${event.time}`)
        } else if (event.timestamp) {
          eventDate = new Date(event.timestamp * 1000) // Se for timestamp Unix
        } else {
          eventDate = new Date() // Fallback para data atual
        }

        console.log(`Data do evento: ${eventDate.toISOString()}`)

        if (existingRaid) {
          console.log(`Raid ${event.name} já existe, atualizando...`)
          // Atualizar o evento existente
          const { error: updateError } = await supabase
            .from("raids")
            .update({
              title: event.name,
              description: event.description || null,
              date: eventDate.toISOString(),
              caller_id: callerId,
              caller_name: leaderName,
              image_url: event.image || null,
              last_synced: new Date().toISOString(),
            })
            .eq("id", existingRaid.id)

          if (updateError) {
            console.error(`Erro ao atualizar raid ${event.name}:`, updateError)
            errors.push(`Erro ao atualizar raid ${event.name}: ${updateError.message}`)
          } else {
            console.log(`Raid ${event.name} atualizada com sucesso`)
            eventsUpdated++

            // Sincronizar participantes
            await syncRaidParticipants(existingRaid.id, event.signups || [])
          }
        } else {
          console.log(`Criando nova raid: ${event.name}`)
          // Criar um novo evento
          const { data: newRaid, error: createError } = await supabase
            .from("raids")
            .insert({
              raid_helper_id: event.id,
              title: event.name,
              description: event.description || null,
              date: eventDate.toISOString(),
              caller_id: callerId,
              caller_name: leaderName,
              image_url: event.image || null,
              last_synced: new Date().toISOString(),
            })
            .select("id")
            .single()

          if (createError) {
            console.error(`Erro ao criar raid ${event.name}:`, createError)
            errors.push(`Erro ao criar raid ${event.name}: ${createError.message}`)
          } else {
            console.log(`Raid ${event.name} criada com sucesso com ID: ${newRaid.id}`)
            eventsCreated++

            // Sincronizar participantes
            await syncRaidParticipants(newRaid.id, event.signups || [])
          }
        }

        eventsProcessed++
        console.log(`=== FIM DO PROCESSAMENTO DO EVENTO: ${event.name} ===`)
      } catch (eventError) {
        console.error(`Erro ao processar evento ${event.name}:`, eventError)
        errors.push(`Erro ao processar evento ${event.name}: ${eventError instanceof Error ? eventError.message : String(eventError)}`)
      }
    }

    const resultMessage = `Sincronização concluída. ${eventsProcessed} eventos processados. ${eventsCreated} criados, ${eventsUpdated} atualizados.`
    
    console.log("=== RESULTADO DA SINCRONIZAÇÃO ===")
    console.log(resultMessage)
    if (errors.length > 0) {
      console.log("Erros encontrados:")
      errors.forEach(error => console.log(`- ${error}`))
    }
    console.log("=== FIM DA SINCRONIZAÇÃO ===")
    
    if (errors.length > 0) {
      return { 
        success: true, 
        message: resultMessage, 
        warnings: errors 
      }
    }

    return { success: true, message: resultMessage }
  } catch (error) {
    console.error("=== ERRO GERAL NA SINCRONIZAÇÃO ===")
    console.error("Erro:", error)
    console.error("=== FIM DO ERRO GERAL ===")
    return { 
      success: false, 
      message: "Erro na sincronização", 
      error: error instanceof Error ? error.message : String(error) 
    }
  }
}

// Função para sincronizar participantes de uma raid
async function syncRaidParticipants(raidId: string, signups: any[] = []) {
  try {
    console.log(`=== SINCRONIZANDO PARTICIPANTES ===`)
    console.log(`Raid ID: ${raidId}`)
    console.log(`Número de participantes: ${signups.length}`)

    // Primeiro, remover todos os participantes existentes
    const { error: deleteError } = await supabase.from("players").delete().eq("raid_id", raidId)

    if (deleteError) {
      console.error(`Erro ao remover participantes existentes da raid ${raidId}:`, deleteError)
      return
    }

    // Se não houver participantes, terminar aqui
    if (!signups || signups.length === 0) {
      console.log(`Nenhum participante para sincronizar na raid ${raidId}`)
      return
    }

    // Log dos participantes
    console.log("Participantes encontrados:")
    signups.forEach((signup, index) => {
      console.log(`${index + 1}. ${signup.name || signup.username || "Nome não encontrado"} - ${signup.class || "Classe não definida"}`)
    })

    // Preparar os dados dos jogadores para inserção em massa
    const playersToInsert = signups.map((signup) => ({
      name: signup.name || signup.username || "Jogador",
      role: mapRaidHelperRoleToAlbion(signup.class, signup.spec),
      secondary_role: "", // Pode ser preenchido pelo jogador depois
      ip: 0, // Será atualizado pelo jogador
      selected: false,
      mor: false,
      raid_id: raidId,
      discord_id: signup.id || null,
    }))

    // Inserir todos os jogadores de uma vez
    const { error: insertError } = await supabase.from("players").insert(playersToInsert)

    if (insertError) {
      console.error(`Erro ao adicionar participantes à raid ${raidId}:`, insertError)
    } else {
      console.log(`${signups.length} participantes sincronizados com sucesso para a raid ${raidId}`)
    }
    
    console.log(`=== FIM DA SINCRONIZAÇÃO DE PARTICIPANTES ===`)
  } catch (error) {
    console.error("Erro ao sincronizar participantes:", error)
  }
}

// Função para mapear papéis do Raid Helper para papéis do Albion
function mapRaidHelperRoleToAlbion(className?: string, spec?: string): string {
  if (!className && !spec) return "DPS"

  // Mapeamento básico, pode ser expandido conforme necessário
  const lowerClass = (className || "").toLowerCase()
  const lowerSpec = (spec || "").toLowerCase()

  if (lowerClass.includes("tank") || lowerSpec.includes("tank")) {
    return "Off Tank"
  } else if (lowerClass.includes("heal") || lowerSpec.includes("heal")) {
    return "Healer"
  } else if (lowerClass.includes("arcane") || lowerSpec.includes("arcane")) {
    return "Elevado"
  } else if (lowerClass.includes("silence") || lowerSpec.includes("silence")) {
    return "Silence"
  } else if (lowerClass.includes("frost") || lowerSpec.includes("frost")) {
    return "Frost"
  } else if (lowerClass.includes("fire") || lowerSpec.includes("fire")) {
    return "Fire"
  } else if (lowerClass.includes("bow") || lowerSpec.includes("bow") || lowerClass.includes("xbow")) {
    return "X-Bow"
  } else if (lowerClass.includes("eagle") || lowerSpec.includes("eagle") || lowerClass.includes("águia")) {
    return "Águia"
  } else if (lowerClass.includes("scout") || lowerSpec.includes("scout")) {
    return "Scout"
  } else if (lowerClass.includes("debuff") || lowerSpec.includes("debuff")) {
    return "Debuff"
  } else if (lowerClass.includes("root") || lowerSpec.includes("root") || lowerClass.includes("raiz")) {
    return "Raiz Férrea"
  } else if (lowerClass.includes("troll") || lowerSpec.includes("troll") || lowerClass.includes("role")) {
    return "Roletroll"
  } else if (lowerClass.includes("hidden") || lowerSpec.includes("hidden") || lowerClass.includes("oculto")) {
    return "Oculto"
  }

  return "DPS"
}

// Função para criar uma raid manualmente
export interface CreateRaidParams {
  title: string
  description?: string
  date: Date
  callerId: string
  imageUrl?: string
}

export async function createRaid(params: CreateRaidParams) {
  try {
    // Verificar se o caller existe
    const { data: callerData } = await supabase
      .from("callers")
      .select("discord_id")
      .eq("discord_id", params.callerId)
      .maybeSingle()

    if (!callerData) {
      throw new Error(`Caller com ID ${params.callerId} não encontrado`)
    }

    // Criar a raid
    const { data: raid, error } = await supabase
      .from("raids")
      .insert({
        title: params.title,
        description: params.description || null,
        date: params.date.toISOString(),
        caller_id: params.callerId,
        caller_name: params.callerId, // Pode ser atualizado depois
        image_url: params.imageUrl || null,
      })
      .select("id")
      .single()

    if (error) throw error

    return { success: true, raidId: raid.id }
  } catch (error) {
    console.error("Erro ao criar raid:", error)
    return { success: false, error }
  }
}