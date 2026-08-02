import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { leadId, phone, agentId } = await req.json();

    if (!leadId || !phone || !agentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Call Bolna API
    const bolnaResponse = await fetch('https://api.bolna.ai/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BOLNA_API_KEY || ''}`,
      },
      body: JSON.stringify({
        agent_id: agentId,
        recipient_phone_number: phone,
      }),
    });

    if (!bolnaResponse.ok) {
      const errorText = await bolnaResponse.text();
      console.error('Bolna API Error:', errorText);
      return NextResponse.json({ error: 'Failed to initiate call via Bolna' }, { status: 500 });
    }

    const bolnaData = await bolnaResponse.json();

    // Update lead status in Supabase
    const { error: updateError } = await supabaseAdmin
      .from('leads')
      .update({ status: 'Calling...' })
      .eq('id', leadId);

    if (updateError) {
      console.error('Supabase Update Error:', updateError);
    }

    return NextResponse.json({ success: true, executionId: bolnaData.execution_id });
  } catch (error) {
    console.error('API Call Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
