import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to deeply extract a phone number from the payload
function findPhoneNumber(payload: any): string | null {
  if (!payload) return null;
  if (payload.customer_phone) return payload.customer_phone;
  if (payload.recipient_phone_number) return payload.recipient_phone_number;
  if (payload.metadata?.phone_number) return payload.metadata.phone_number;
  if (payload.data?.customer_phone) return payload.data.customer_phone;
  if (payload.data?.recipient_phone_number) return payload.data.recipient_phone_number;
  if (payload.data?.metadata?.phone_number) return payload.data.metadata.phone_number;
  
  // Last resort regex search
  const str = JSON.stringify(payload);
  const match = str.match(/\+?\d{10,15}/);
  if (match) return match[0];
  
  return null;
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log('Webhook Received [Execution ID]:', payload?.execution_id || payload?.data?.execution_id);
    
    // Bolna API sometimes wraps the data in a `data` property
    const data = payload?.data || payload;

    const executionId = data.execution_id;
    if (!executionId) {
      return NextResponse.json({ success: true, warning: 'No execution_id found' });
    }

    const currentStatus = data.status || 'Unknown';
    const summary = data.summary;
    const transcript = data.transcript;
    const recordingUrl = data.recording_url;

    // 1. Check if we already have this call logged
    const { data: existingCalls } = await supabaseAdmin
      .from('calls')
      .select('id, lead_id, transcript, summary, call_status')
      .eq('bolna_execution_id', executionId)
      .limit(1);

    let callRecord = existingCalls?.[0];

    // 2. If no call record exists, this call might have been initiated directly from the Bolna Dashboard
    if (!callRecord) {
      const phone = findPhoneNumber(payload);
      if (!phone) {
        console.log('No phone number found to match lead for execution:', executionId);
        return NextResponse.json({ success: true, warning: 'No phone number to match lead' });
      }

      // Try to find the lead by phone
      const { data: leads } = await supabaseAdmin
        .from('leads')
        .select('id')
        .ilike('phone', `%${phone.replace('+', '')}%`)
        .limit(1);

      if (!leads || leads.length === 0) {
        console.log('No matching lead found for phone:', phone);
        return NextResponse.json({ success: true, warning: 'Lead not found for phone' });
      }

      // Create the new call log
      const insertData: any = {
        lead_id: leads[0].id,
        bolna_execution_id: executionId,
        call_status: currentStatus,
        summary: summary || 'Call initiated...',
        transcript: transcript || '',
      };
      
      // If we added a recording_url column to DB, we can try to save it
      if (recordingUrl) {
         insertData.recording_url = recordingUrl;
      }

      const { data: newCall, error: insertError } = await supabaseAdmin
        .from('calls')
        .insert(insertData)
        .select()
        .single();
        
      if (insertError) {
        // If recording_url column doesn't exist, it might fail. Let's fallback and retry without recording_url.
        if (insertError.message.includes('recording_url')) {
           delete insertData.recording_url;
           const { data: retryCall, error: retryError } = await supabaseAdmin
             .from('calls')
             .insert(insertData)
             .select()
             .single();
           if (retryError) {
             console.error('Error inserting call log (retry):', retryError);
             return NextResponse.json({ error: 'DB Insert Error' }, { status: 500 });
           }
           callRecord = retryCall;
           console.log('Please add a "recording_url" TEXT column to your "calls" table in Supabase!');
        } else {
           console.error('Error inserting call log:', insertError);
           return NextResponse.json({ error: 'DB Insert Error' }, { status: 500 });
        }
      } else {
        callRecord = newCall;
      }
    } else {
      // 3. Update existing call log
      const updateData: any = {
        call_status: currentStatus,
      };
      // Only overwrite if we actually received non-null data
      if (summary) updateData.summary = summary;
      if (transcript) updateData.transcript = transcript;
      if (recordingUrl) updateData.recording_url = recordingUrl;

      const { error: updateError } = await supabaseAdmin
        .from('calls')
        .update(updateData)
        .eq('id', callRecord.id);
        
      if (updateError && updateError.message.includes('recording_url')) {
         delete updateData.recording_url;
         await supabaseAdmin.from('calls').update(updateData).eq('id', callRecord.id);
         console.log('Please add a "recording_url" TEXT column to your "calls" table in Supabase!');
      }
    }

    // 4. Update the Lead status based on extractions if call is completed or we have explicit interest
    const extractions = data.extractions || {};
    const extractedInterest = extractions.interest_level || extractions.is_interested || extractions.interest;
    
    if (!callRecord || !callRecord.lead_id) {
      console.log('Skipping lead update: No call record or lead_id found.');
      return NextResponse.json({ success: true });
    }

    if (extractedInterest || currentStatus === 'completed') {
      let newStatus = 'Contacted';
      let newInterestLevel = 'Pending Review';

      if (typeof extractedInterest === 'string') {
        const interestLower = extractedInterest.toLowerCase();
        if (interestLower.includes('not') || interestLower.includes('uninterested')) {
          newStatus = 'Not Interested';
          newInterestLevel = 'Low';
        } else if (interestLower.includes('yes') || interestLower.includes('interested') || interestLower.includes('high')) {
          newStatus = 'Interested';
          newInterestLevel = 'High';
        } else if (interestLower.includes('follow') || interestLower.includes('busy')) {
          newStatus = 'Follow Up';
          newInterestLevel = 'Medium';
        } else {
          newInterestLevel = extractedInterest;
        }
      }

      await supabaseAdmin
        .from('leads')
        .update({ status: newStatus, interest_level: newInterestLevel })
        .eq('id', callRecord.lead_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
