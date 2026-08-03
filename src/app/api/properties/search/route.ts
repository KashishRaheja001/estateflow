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
      return NextResponse.json({
        found: false,
        message: "I couldn't find any properties exactly matching those requirements in our current inventory. However, we have other great options in nearby sectors. Should I tell you about those?"
      });
    }

    // Format the response so the AI can easily read it over the phone
    const propertyDescriptions = data.map((p, index) => {
      return `Property ${index + 1}: ${p.project_name} by ${p.builder} located at ${p.location}. It offers ${p.configurations} with prices ranging from ${p.price_range}.`;
    }).join(' ');

    return NextResponse.json({
      found: true,
      message: `I found some excellent matches for you. ${propertyDescriptions} Would you like me to schedule a site visit for any of these?`
    });

  } catch (error) {
    console.error('Property Search Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
