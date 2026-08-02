import { supabaseAdmin } from "@/lib/supabase";
import LeadsTable from "./LeadsTable";

export const revalidate = 0; // Disable cache for this page since it's dynamic

export default async function LeadsPage() {
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
      calls ( id, summary, transcript, duration, call_status )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching leads:", error);
  }

  return (
    <div className="space-y-12 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-serif text-on-surface tracking-tighter mb-4">
            Leads
          </h1>
          <p className="text-on-surface-muted text-lg max-w-2xl font-serif leading-relaxed">
            Manage your prospective buyers. Initiate AI voice calls, view call transcripts, and track conversion status.
          </p>
        </div>
      </div>
      
      <LeadsTable initialLeads={leads || []} />
    </div>
  );
}
