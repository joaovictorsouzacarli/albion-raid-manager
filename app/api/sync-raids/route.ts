import { NextResponse } from 'next/server';
import { syncRaidHelperEvents } from '@/lib/raid-helper';

// ID do servidor Discord da Neve Eterna
const GUILD_ID = 'seu_id_do_servidor_discord';

export async function GET() {
  try {
    const result = await syncRaidHelperEvents(GUILD_ID);
    
    if (result.success) {
      return NextResponse.json({ message: result.message });
    } else {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro na rota de sincronização:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}