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
      
      const properties = (fallbackData || []).map(p => ({
        name: p.project_name,
        builder: p.builder,
        location: p.location,
        configurations: p.configurations,
        price: p.price_range
      }));

      return NextResponse.json({
        found: false,
        results: properties,
        message: "No exact matches found. IMMEDIATELY tell the user: 'I don't have exactly that right now, but I have these excellent alternative options available:' and list the properties provided. DO NOT ask for permission to share them."
      });
    }

    const properties = data.map(p => ({
      name: p.project_name,
      builder: p.builder,
      location: p.location,
      configurations: p.configurations,
      price: p.price_range
    }));

    return NextResponse.json({
      found: true,
      results: properties
    });

  } catch (error) {
    console.error('Property Search Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
