import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    console.log('Webhook Received:', JSON.stringify(payload, null, 2));

    // Based on Bolna's execution data webhook structure
    // Extractions tab configures this to send execution details
    const executionId = payload?.execution_id || payload?.data?.execution_id;
    const summary = payload?.summary || payload?.data?.summary || 'No summary generated.';
    const transcript = payload?.transcript || payload?.data?.transcript || 'No transcript available.';
    
    // We need the leadId, which can be passed as metadata/custom data when initiating the call if supported, 
    // or we look it up by the phone number if that's all Bolna provides.
    // For MVP, assuming we can find the lead by looking up the most recently called lead that is in 'Calling...' state.
    
    // As a fallback, find a lead that was recently updated to 'Calling...'
    const { data: recentLeads, error: lookupError } = await supabaseAdmin
      .from('leads')
      .select('id')
      .eq('status', 'Calling...')
      .order('created_at', { ascending: false })
      .limit(1);

    if (lookupError || !recentLeads || recentLeads.length === 0) {
      console.error('Could not identify the lead for this webhook event.');
      return NextResponse.json({ success: true, warning: 'Lead not found for update' });
    }

    const leadId = recentLeads[0].id;

    // Insert call log
    const { error: insertError } = await supabaseAdmin
      .from('calls')
      .insert({
        lead_id: leadId,
        bolna_execution_id: executionId || 'unknown',
        summary,
        transcript,
        call_status: 'Completed'
      });

    if (insertError) {
      console.error('Error inserting call log:', insertError);
    }

    // Update lead status
    await supabaseAdmin
      .from('leads')
      .update({ status: 'Contacted', interest_level: 'Requires Review' })
      .eq('id', leadId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
