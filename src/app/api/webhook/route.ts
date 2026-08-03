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

    const executionId = data.execution_id || data.id;
    if (!executionId) {
      return NextResponse.json({ success: true, warning: 'No execution_id found' });
    }

    const currentStatus = data.status || 'Unknown';
    const summary = data.summary;
    const transcript = data.transcript;
    const recordingUrl = data.recording_url || data.telephony_data?.recording_url;
    const extractions = data.extractions || data.extracted_data || {};

    // 1. Check if we already have this call logged
    const { data: existingCalls } = await supabaseAdmin
      .from('calls')
      .select('id, lead_id, transcript, summary, call_status')
      .eq('bolna_execution_id', executionId)
      .limit(1);

    let callRecord = existingCalls?.[0];

    // 2. If no call record exists, this call might have been initiated directly from the Bolna Dashboard
    if (!callRecord) {
      let leadId;
      const phone = findPhoneNumber(payload);
      
      if (!phone) {
        console.log('No phone number found to match lead for execution:', executionId);
        // Create an Unknown Lead for Dashboard Tests
        const { data: newLead } = await supabaseAdmin
          .from('leads')
          .insert({ name: 'Unknown Dashboard Test', phone: 'No Phone Provided', status: 'New' })
          .select()
          .single();
        if (newLead) leadId = newLead.id;
      } else {
        // Try to find the lead by phone
        const { data: leads } = await supabaseAdmin
          .from('leads')
          .select('id')
          .ilike('phone', `%${phone.replace('+', '')}%`)
          .limit(1);

        if (!leads || leads.length === 0) {
          console.log('No matching lead found for phone:', phone);
          const { data: newLead } = await supabaseAdmin
            .from('leads')
            .insert({ name: 'New Unknown Caller', phone: phone, status: 'New' })
            .select()
            .single();
          if (newLead) leadId = newLead.id;
        } else {
          leadId = leads[0].id;
        }
      }

      if (leadId) {
        const insertData: any = {
          lead_id: leadId,
          bolna_execution_id: executionId || 'unknown',
          call_status: currentStatus,
          summary: summary || 'Call initiated...',
          transcript: transcript || '',
        };
        
        if (recordingUrl) {
           insertData.recording_url = recordingUrl;
        }

        const { data: newCall, error: insertError } = await supabaseAdmin
          .from('calls')
          .insert(insertData)
          .select()
          .single();
          
        if (insertError) {
          if (insertError.message.includes('recording_url')) {
             delete insertData.recording_url;
             const { data: retryCall } = await supabaseAdmin
               .from('calls')
               .insert(insertData)
               .select()
               .single();
             callRecord = retryCall;
          } else {
             console.error('Error inserting call log:', insertError);
          }
        } else {
          callRecord = newCall;
        }
      }
    } else {
      // 3. Update existing call log
      const updateData: any = {
        call_status: currentStatus,
      };

      // const extractions = data.extractions || {}; // Already declared above
      let finalSummary = summary;
      if (currentStatus === 'completed' && Object.keys(extractions).length > 0) {
        finalSummary = (summary || 'Call completed.') + '\n\nEXTRACTED REQUIREMENTS:\n';
        if (extractions.location || extractions.preferred_location) finalSummary += `- Location: ${extractions.location || extractions.preferred_location}\n`;
        if (extractions.configuration || extractions.property_type) finalSummary += `- Property Type: ${extractions.configuration || extractions.property_type}\n`;
        if (extractions.budget || extractions.budget_range) finalSummary += `- Budget: ${extractions.budget || extractions.budget_range}\n`;
        if (extractions.timeline || extractions.purchase_timeline) finalSummary += `- Timeline: ${extractions.timeline || extractions.purchase_timeline}\n`;
      }

      // Only overwrite if we actually received non-null data
      if (finalSummary) updateData.summary = finalSummary;
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
    // const extractions = data.extractions || {}; // Already declared above
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

      const leadUpdate: any = { status: newStatus, interest_level: newInterestLevel };
      if (extractions.budget || extractions.budget_range) leadUpdate.budget = extractions.budget || extractions.budget_range;
      if (extractions.configuration || extractions.property_type) leadUpdate.property_type = extractions.configuration || extractions.property_type;

      await supabaseAdmin
        .from('leads')
        .update(leadUpdate)
        .eq('id', callRecord.lead_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
