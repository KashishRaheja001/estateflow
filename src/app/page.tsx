import { supabaseAdmin } from "@/lib/supabase";
import { format } from "date-fns";

export default async function DashboardPage() {
  // Fetch stats from Supabase
  const { count: totalCalls } = await supabaseAdmin.from("calls").select("*", { count: "exact", head: true });
  
  // For 'today', we'll get the start of the day in ISO
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const { count: todaysCalls } = await supabaseAdmin
    .from("calls")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfToday.toISOString());

  const { count: interestedLeads } = await supabaseAdmin
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("interest_level", "Interested");

  const { count: lostLeads } = await supabaseAdmin
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("interest_level", "Lost");

  const { count: followupLeads } = await supabaseAdmin
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("status", "Follow Up");

  // Fetch recent calls to display a small list
  const { data: recentCalls } = await supabaseAdmin
    .from("calls")
    .select(`
      id,
      created_at,
      call_status,
      duration,
      leads ( name, phone )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-12 py-8">
      <div>
        <h1 className="text-5xl font-serif text-on-surface tracking-tighter mb-4">
          Command Center
        </h1>
        <p className="text-on-surface-muted text-lg max-w-2xl font-serif leading-relaxed">
          Monitor your AI voice agent's real-time performance. High-level metrics to track conversions and call volume at a glance.
        </p>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Calls" value={totalCalls || 0} />
        <StatCard title="Calls Today" value={todaysCalls || 0} highlight />
        <StatCard title="Interested Leads" value={interestedLeads || 0} />
        <StatCard title="Follow-up Required" value={followupLeads || 0} />
        <StatCard title="Lost Leads" value={lostLeads || 0} />
      </div>

      {/* Recent Calls List */}
      <section className="bg-surface border border-border/50 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-serif text-on-surface mb-6 tracking-tight">Recent Activity</h2>
        
        {recentCalls && recentCalls.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-sm font-semibold text-on-surface-muted uppercase tracking-wider">
                  <th className="pb-4 font-sans font-bold">Lead</th>
                  <th className="pb-4 font-sans font-bold">Date</th>
                  <th className="pb-4 font-sans font-bold">Status</th>
                  <th className="pb-4 font-sans font-bold">Duration</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentCalls.map((call: any) => (
                  <tr key={call.id} className="border-b border-border/20 last:border-0 hover:bg-tertiary/50 transition-colors">
                    <td className="py-4">
                      <div className="font-semibold text-on-surface">{call.leads?.name || "Unknown"}</div>
                      <div className="text-on-surface-muted text-xs">{call.leads?.phone}</div>
                    </td>
                    <td className="py-4 text-on-surface-muted">
                      {format(new Date(call.created_at), "MMM d, yyyy h:mm a")}
                    </td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-tertiary text-on-surface border border-border/50">
                        {call.call_status}
                      </span>
                    </td>
                    <td className="py-4 text-on-surface-muted">
                      {call.duration ? `${call.duration}s` : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-on-surface-muted bg-neutral/50 rounded-xl border border-border/30">
            No recent calls found. Start an AI call to see activity here.
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ title, value, highlight = false }: { title: string; value: number; highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-2xl border transition-shadow hover:shadow-md ${
      highlight 
        ? "bg-primary text-white border-primary shadow-sm" 
        : "bg-surface border-border/50 text-on-surface shadow-sm"
    }`}>
      <h3 className={`text-sm font-semibold tracking-wide uppercase mb-2 ${highlight ? "text-white/80" : "text-on-surface-muted"}`}>
        {title}
      </h3>
      <p className="text-4xl font-serif tracking-tight">
        {value}
      </p>
    </div>
  );
}
