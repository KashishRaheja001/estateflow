import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log("--- LEADS ---");
  const { data: leads, error: leadError } = await supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5);
  if (leadError) console.error("Lead Error:", leadError);
  console.log(leads?.map(l => ({ id: l.id, name: l.name, phone: l.phone, status: l.status })));

  console.log("\n--- CALLS ---");
  const { data: calls, error: callError } = await supabase.from('calls').select('id, lead_id, bolna_execution_id, call_status, summary').order('created_at', { ascending: false }).limit(5);
  if (callError) console.error("Call Error:", callError);
  console.log(calls);
}

checkData();
