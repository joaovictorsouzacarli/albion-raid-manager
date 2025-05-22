// Função para buscar eventos do Raid Helper usando o ID do Discord
export async function fetchRaidHelperEvents(apiKey = "") {
  try {
    console.log("Buscando eventos do Raid Helper usando ID do Discord...")
    
    // ID do Discord fornecido pelos fabricantes do Raid Helper
    const DISCORD_ID = process.env.DISCORD_ID || "1313368815635009537"
    
    if (!apiKey) {
      console.error("Chave de API do Raid Helper não fornecida")
      throw new Error("Chave de API do Raid Helper não fornecida")
    }

    // Endpoint para buscar eventos por ID do Discord
    const response = await fetch(`https://raid-helper.dev/api/v2/discord/${DISCORD_ID}/events`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Resposta da API do Raid Helper: ${response.status} ${response.statusText}`)
      console.error(`Corpo da resposta: ${errorText}`)
      throw new Error(`Erro ao buscar eventos: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    
    if (!data || !data.events) {
      console.warn("API do Raid Helper retornou dados inesperados:", data)
      return []
    }
    
    console.log(`Recebidos ${data.events.length} eventos da API do Raid Helper`)
    return data.events || []
  } catch (error) {
    console.error("Erro ao buscar eventos do Raid Helper:", error)
    throw error
  }
}