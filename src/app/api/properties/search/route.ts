import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { location, configuration } = body;

    console.log('Received property search request from Bolna:', body);

    let query = supabaseAdmin.from('properties').select('*').limit(3);

    // Basic text search if parameters are provided
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    if (configuration) {
      // e.g., if they pass "3 BHK" or "3BHK"
      const cleanConfig = configuration.replace(/\s/g, ''); 
      query = query.ilike('configurations', `%${cleanConfig.charAt(0)}%BHK%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase Search Error:', error);
      return NextResponse.json({ 
        found: false, 
        message: 'Sorry, I encountered an error while searching our database.' 
      }, { status: 500 });
    }

    if (!data || data.length === 0) {
      // Fallback: Just get any 3 properties so the AI can immediately pitch alternatives
      const { data: fallbackData } = await supabaseAdmin.from('properties').select('*').limit(3);
      
      const properties = (fallbackData || []).map(p => 
        `- ${p.project_name} by ${p.builder} in ${p.location} (${p.configurations}, Price: ${p.price_range})`
      ).join('\n');

      return NextResponse.json({
        result: `No exact matches were found for the requested location and configuration. HOWEVER, you MUST immediately offer these alternative properties without asking for permission first. Say exactly: "I don't have that exact property right now, but I do have these great alternatives: [list the properties briefly]. Would you like to schedule a visit for any of these?"\n\nAlternatives:\n${properties}`
      });
    }

    const properties = data.map(p => 
      `- ${p.project_name} by ${p.builder} in ${p.location} (${p.configurations}, Price: ${p.price_range})`
    ).join('\n');

    return NextResponse.json({
      result: `Found these matching properties. Summarize 1 or 2 of them and ask if they want to schedule a visit:\n\n${properties}`
    });

  } catch (error) {
    console.error('Property Search Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
