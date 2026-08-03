import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Insert Dummy Properties (50 Indian context properties)
    const propertiesData = [
      { project_name: 'DLF Camellias', builder: 'DLF', location: 'Golf Course Road, Gurgaon', description: 'Ultra-luxury residences with golf course views.', price_range: '₹35 Cr - ₹70 Cr', configurations: '4 BHK, 5 BHK, Penthouse', amenities: 'Clubhouse, Golf Course, Concierge' },
      { project_name: 'M3M Golfestate', builder: 'M3M', location: 'Sector 65, Gurgaon', description: 'Luxury apartments with resort-style living.', price_range: '₹5 Cr - ₹12 Cr', configurations: '3 BHK, 4 BHK, 5 BHK', amenities: 'Golf Theme, Pool, Spa, Gym' },
      { project_name: 'Emaar Marbella', builder: 'Emaar', location: 'Sector 66, Gurgaon', description: 'Exclusive Spanish style villas.', price_range: '₹12 Cr - ₹20 Cr', configurations: '4 BHK, 5 BHK Villa', amenities: 'Private Garden, Clubhouse, Tennis Court' },
      { project_name: 'Godrej Meridien', builder: 'Godrej Properties', location: 'Sector 106, Gurgaon', description: 'Premium residences with a massive clubhouse.', price_range: '₹2.5 Cr - ₹4.5 Cr', configurations: '2 BHK, 3 BHK, 4 BHK', amenities: 'Wine Tasting Room, Library, Pool' },
      { project_name: 'Sobha City', builder: 'Sobha', location: 'Sector 108, Gurgaon', description: 'Urban park residences with vast open spaces.', price_range: '₹3 Cr - ₹5 Cr', configurations: '2 BHK, 3 BHK', amenities: 'Cricket Ground, 2 Clubhouses' },
      { project_name: 'Tata Primanti', builder: 'Tata Housing', location: 'Sector 72, Gurgaon', description: 'European architecture inspired luxury apartments.', price_range: '₹4 Cr - ₹8 Cr', configurations: '3 BHK, 4 BHK, Villa', amenities: 'Spa, Restaurant, Pool' },
      { project_name: 'SmartWorld Gems', builder: 'SmartWorld', location: 'Sector 89, Gurgaon', description: 'Low rise independent floors.', price_range: '₹1.2 Cr - ₹1.8 Cr', configurations: '2 BHK, 3 BHK', amenities: 'Dedicated Terrace, Office Space' },
      { project_name: 'Trump Towers', builder: 'Tribeca', location: 'Sector 65, Gurgaon', description: 'Iconic luxury towers with signature glass facade.', price_range: '₹8 Cr - ₹15 Cr', configurations: '3 BHK, 4 BHK', amenities: 'Private Elevator, Concierge, Infinity Pool' },
      { project_name: 'Tulip Monsella', builder: 'Tulip', location: 'Sector 53, Gurgaon', description: 'High-rise ultra-luxury apartments on Golf Course Road.', price_range: '₹7 Cr - ₹14 Cr', configurations: '3 BHK, 4 BHK, 5 BHK', amenities: 'Zero Vehicular Movement on Ground, Club' },
      { project_name: 'Pioneer Araya', builder: 'Pioneer Urban', location: 'Sector 62, Gurgaon', description: 'Spacious luxury apartments with modern amenities.', price_range: '₹6 Cr - ₹10 Cr', configurations: '4 BHK, 5 BHK', amenities: 'Squash Court, Indoor Games' },
      // Generating 40 more dynamically via map to save space but ensure 50 rows in DB
      ...Array.from({ length: 40 }).map((_, i) => ({
        project_name: `Gurgaon Heights Phase ${i + 1}`,
        builder: ['DLF', 'M3M', 'Emaar', 'Godrej', 'Signature Global'][i % 5],
        location: `Sector ${50 + i}, Gurgaon`,
        description: 'Premium modern apartments with excellent connectivity.',
        price_range: `₹${(1.5 + (i % 5)).toFixed(1)} Cr - ₹${(3 + (i % 5)).toFixed(1)} Cr`,
        configurations: ['2 BHK, 3 BHK', '3 BHK, 4 BHK', 'Plot', 'Commercial Office'][i % 4],
        amenities: '24/7 Security, Power Backup, Gym, Park',
      }))
    ];

    const { data: properties, error: propError } = await supabaseAdmin
      .from('properties')
      .insert(propertiesData)
      .select();

    if (propError) {
      console.error('Property Seed Error:', propError);
      return NextResponse.json({ error: 'Failed to insert properties', details: propError }, { status: 500 });
    }

    // 2. Insert Dummy Leads (Indian Context)
    const { data: leads, error: leadError } = await supabaseAdmin
      .from('leads')
      .insert([
        {
          name: 'Rahul Sharma',
          phone: '+919876543210',
          email: 'rahul.s@example.in',
          budget: '₹3 Cr',
          preferred_location: 'Sector 65, Gurgaon',
          property_type: '3 BHK Apartment',
          timeline: 'Immediate',
          purpose: 'End Use',
          status: 'New',
          interest_level: 'High'
        },
        {
          name: 'Priya Patel',
          phone: '+919988776655',
          email: 'priya.p@example.in',
          budget: '₹1.5 Cr',
          preferred_location: 'Dwarka Expressway',
          property_type: '2 BHK',
          timeline: '6 months',
          purpose: 'Investment',
          status: 'Follow Up',
          interest_level: 'Medium'
        },
        {
          name: 'Amit Kumar',
          phone: '+919123456789',
          email: 'amit.k@example.in',
          budget: '₹8 Cr',
          preferred_location: 'Golf Course Road',
          property_type: '4 BHK / Penthouse',
          timeline: '1 month',
          purpose: 'End Use',
          status: 'New',
          interest_level: 'High'
        }
      ])
      .select();

    if (leadError) {
      console.error('Lead Seed Error:', leadError);
      return NextResponse.json({ error: 'Failed to insert leads', details: leadError }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Database seeded successfully with dummy data!',
      propertyCount: propertiesData.length,
      properties,
      leads
    });

  } catch (error) {
    console.error('Seeding Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
