-- This file is for your reference only. 
-- The tables below have already been created in your Supabase database.

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  builder TEXT,
  location TEXT NOT NULL,
  description TEXT,
  price_range TEXT,
  configurations TEXT,
  amenities TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  budget TEXT,
  preferred_location TEXT,
  property_type TEXT,
  timeline TEXT,
  purpose TEXT,
  status TEXT DEFAULT 'New',
  interest_level TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  bolna_execution_id TEXT,
  summary TEXT,
  transcript TEXT,
  duration INT,
  call_status TEXT DEFAULT 'Completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
