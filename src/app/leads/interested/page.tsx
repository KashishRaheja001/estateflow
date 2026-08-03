import { supabaseAdmin } from "@/lib/supabase";
import LeadsTable from "../LeadsTable";

export const revalidate = 0; // Disable cache for this page since it's dynamic

export default async function InterestedLeadsPage() {
  const { data: leads, error } = await supabaseAdmin
    .from("leads")
    .select(`
      id,
      name,
      phone,
      email,
      status,
      interest_level,
      created_at,
      budget,
      property_type,
      calls ( id, summary, transcript, duration, call_status )
    `)
    .or('status.eq.Interested,interest_level.eq.High')
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching leads:", error);
  }

  return (
    <div className="space-y-12 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <a href="/leads" className="text-sm font-semibold text-on-surface-muted hover:text-primary transition-colors mb-4 inline-block">&larr; Back to All Leads</a>
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-5xl font-serif text-on-surface tracking-tighter">
              Hot Leads
            </h1>
            <div className="bg-red-100 text-red-800 border border-red-200 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mt-2">
              Interested Only
            </div>
          </div>
          <p className="text-on-surface-muted text-lg max-w-2xl font-serif leading-relaxed">
            These prospects have shown a high level of interest during their AI consultation.
          </p>
        </div>
      </div>
      
      <LeadsTable initialLeads={leads || []} hideTabs={true} />
    </div>
  );
}
