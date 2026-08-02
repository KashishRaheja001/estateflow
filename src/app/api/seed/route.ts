import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Insert Dummy Properties
    const { data: properties, error: propError } = await supabaseAdmin
      .from('properties')
      .insert([
        {
          project_name: 'Skyline Residencies',
          builder: 'Emaar',
          location: 'Downtown, Sector 45',
          description: 'Luxury high-rise apartments with panoramic city views.',
          price_range: '$500k - $1.2M',
          configurations: '2BHK, 3BHK, 4BHK',
          amenities: 'Pool, Gym, Smart Home, Security',
        },
        {
          project_name: 'Green Valley Villas',
          builder: 'DLF',
          location: 'Suburbs, Green Area',
          description: 'Spacious villas surrounded by nature with private gardens.',
          price_range: '$800k - $2M',
          configurations: '4BHK, 5BHK',
          amenities: 'Private Garden, Clubhouse, Tennis Court',
        }
      ])
      .select();

    if (propError) {
      console.error('Property Seed Error:', propError);
      return NextResponse.json({ error: 'Failed to insert properties', details: propError }, { status: 500 });
    }

    // 2. Insert Dummy Leads
    const { data: leads, error: leadError } = await supabaseAdmin
      .from('leads')
      .insert([
        {
          name: 'Jane Smith',
          phone: '+12345678901',
          email: 'jane.smith@example.com',
          budget: '$600k',
          preferred_location: 'Downtown',
          property_type: '3BHK Apartment',
          timeline: '3 months',
          purpose: 'Investment',
          status: 'New',
          interest_level: 'Interested'
        },
        {
          name: 'John Doe',
          phone: '+19876543210',
          email: 'john.doe@example.com',
          budget: '$1.5M',
          preferred_location: 'Suburbs',
          property_type: 'Villa',
          timeline: '1 month',
          purpose: 'End Use',
          status: 'Follow Up',
          interest_level: 'Requires Review'
        }
      ])
      .select();

    if (leadError) {
      console.error('Lead Seed Error:', leadError);
      return NextResponse.json({ error: 'Failed to insert leads', details: leadError }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Database seeded successfully with dummy data!',
      properties,
      leads
    });

  } catch (error) {
    console.error('Seeding Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
