import axios from 'axios';
import { supabase } from './supabase';

// Tipos para a API do Raid Helper
interface RaidHelperEvent {
  id: string;
  name: string;
  description: string;
  start_time: number; // timestamp
  leader: {
    id: string;
    name: string;
  };
  signups: RaidHelperSignup[];
}

interface RaidHelperSignup {
  user_id: string;
  user_name: string;
  class: string;
  spec: string;
  timestamp: number;
}

// Função para buscar eventos do Raid Helper
export async function fetchRaidHelperEvents(guildId: string) {
  try {
    const response = await axios.get(`https://raid-helper.dev/api/v2/guilds/${guildId}/events`, {
      headers: {
        Authorization: `Bearer ${process.env.RAID_HELPER_API_KEY}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar eventos do Raid Helper:', error);
    throw error;
  }
}

// Função para sincronizar eventos do Raid Helper com o Supabase
export async function syncRaidHelperEvents(guildId: string) {
  try {
    // Buscar eventos do Raid Helper
    const events = await fetchRaidHelperEvents(guildId);
    
    // Para cada evento
    for (const event of events) {
      // Verificar se o caller existe no banco
      const { data: callerData } = await supabase
        .from('callers')
        .select('id')
        .eq('discord_id', event.leader.id)
        .single();
      
      let callerId;
      
      if (!callerData) {
        // Criar caller se não existir
        const { data: newCaller } = await supabase
          .from('callers')
          .insert({
            discord_id: event.leader.id,
            name: event.leader.name,
            avatar_url: null // Você pode buscar o avatar do Discord se tiver acesso à API do Discord
          })
          .select('id')
          .single();
        
        callerId = newCaller?.id;
      } else {
        callerId = callerData.id;
      }
      
      // Verificar se a raid já existe
      const { data: existingRaid } = await supabase
        .from('raids')
        .select('id')
        .eq('raid_helper_id', event.id)
        .single();
      
      let raidId;
      
      if (!existingRaid) {
        // Criar raid se não existir
        const { data: newRaid } = await supabase
          .from('raids')
          .insert({
            raid_helper_id: event.id,
            title: event.name,
            description: event.description,
            date: new Date(event.start_time * 1000).toISOString(),
            caller_id: callerId,
            image_url: null // Você pode definir uma imagem padrão baseada no tipo de raid
          })
          .select('id')
          .single();
        
        raidId = newRaid?.id;
      } else {
        raidId = existingRaid.id;
        
        // Atualizar raid existente
        await supabase
          .from('raids')
          .update({
            title: event.name,
            description: event.description,
            date: new Date(event.start_time * 1000).toISOString()
          })
          .eq('id', raidId);
      }
      
      // Processar inscrições
      for (const signup of event.signups) {
        // Verificar se o jogador existe
        const { data: playerData } = await supabase
          .from('players')
          .select('id')
          .eq('discord_id', signup.user_id)
          .single();
        
        let playerId;
        
        if (!playerData) {
          // Criar jogador se não existir
          const { data: newPlayer } = await supabase
            .from('players')
            .insert({
              name: signup.user_name,
              discord_id: signup.user_id
            })
            .select('id')
            .single();
          
          playerId = newPlayer?.id;
        } else {
          playerId = playerData.id;
        }
        
        // Verificar se a inscrição já existe
        const { data: existingRegistration } = await supabase
          .from('raid_registrations')
          .select('id')
          .eq('raid_id', raidId)
          .eq('player_id', playerId)
          .single();
        
        if (!existingRegistration) {
          // Criar inscrição se não existir
          await supabase
            .from('raid_registrations')
            .insert({
              raid_id: raidId,
              player_id: playerId,
              role: signup.class || 'Desconhecido',
              secondary_role: signup.spec || null,
              ip: 0, // O IP será preenchido pelo jogador no formulário
              selected: false,
              mor: false
            });
        }
      }
    }
    
    return { success: true, message: 'Eventos sincronizados com sucesso' };
  } catch (error) {
    console.error('Erro ao sincronizar eventos:', error);
    return { success: false, message: 'Erro ao sincronizar eventos', error };
  }
}