import { supabaseAdmin } from "@/lib/supabase";
import { format } from "date-fns";

export const revalidate = 0;

export default async function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: lead, error: leadError } = await supabaseAdmin
    .from("leads")
    .select(`
      id,
      name,
      phone,
      email,
      budget,
      property_type,
      status,
      interest_level,
      created_at,
      calls ( id, summary, transcript, duration, call_status, created_at, recording_url )
    `)
    .eq("id", id)
    .single();

  if (leadError || !lead) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-serif text-on-surface">Lead not found</h1>
        <p className="text-on-surface-muted mt-2">The lead you are looking for does not exist or has been deleted.</p>
        <a href="/leads" className="mt-6 inline-block bg-primary text-white px-6 py-2 rounded-full font-bold">Back to Leads</a>
      </div>
    );
  }

  // Find the most recent call
  const recentCall = lead.calls && lead.calls.length > 0 
    ? lead.calls.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null;

  return (
    <div className="space-y-12 py-8 max-w-5xl mx-auto">
      {/* Header section with back button and main status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <a href="/leads" className="text-sm font-semibold text-on-surface-muted hover:text-primary transition-colors mb-4 inline-block">&larr; Back to Leads</a>
          <h1 className="text-5xl font-serif text-on-surface tracking-tighter mb-2">{lead.name}</h1>
          <p className="text-on-surface-muted font-medium">{lead.phone} {lead.email && `• ${lead.email}`}</p>
        </div>
        
        {/* Massive Status Badge */}
        <div className={`px-8 py-4 rounded-2xl border-2 flex flex-col items-center justify-center min-w-[200px] shadow-sm ${
          lead.interest_level === 'High' || lead.status === 'Interested' ? 'bg-green-50 border-green-200 text-green-800' :
          lead.interest_level === 'Low' || lead.status === 'Not Interested' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <span className="text-sm font-bold uppercase tracking-wider opacity-80 mb-1">AI Verdict</span>
          <span className="text-2xl font-serif leading-none">
            {lead.status === 'New' ? 'Uncontacted' : lead.interest_level || lead.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Lead Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-serif mb-4 text-on-surface">Lead Details</h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-on-surface-muted mb-1">Budget</dt>
                <dd className="font-medium text-on-surface">{lead.budget || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-on-surface-muted mb-1">Property Type</dt>
                <dd className="font-medium text-on-surface">{lead.property_type || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-on-surface-muted mb-1">Added On</dt>
                <dd className="font-medium text-on-surface">{format(new Date(lead.created_at), "MMMM d, yyyy")}</dd>
              </div>
              <div>
                <dt className="text-on-surface-muted mb-1">Current Status</dt>
                <dd className="font-medium text-on-surface">{lead.status}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right Column: Call Results */}
        <div className="md:col-span-2 space-y-8">
          {recentCall ? (
            <>
              {/* Summary Section */}
              <div className="bg-surface border border-border/50 rounded-2xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif text-on-surface">Call Summary</h2>
                  <span className="text-sm font-medium text-on-surface-muted bg-neutral px-3 py-1 rounded-full border border-border/50">
                    {format(new Date(recentCall.created_at), "MMM d, h:mm a")} • {recentCall.call_status}
                  </span>
                </div>
                
                {recentCall.recording_url && (
                  <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <h3 className="text-sm font-bold text-on-surface mb-2 uppercase tracking-wide">Call Recording</h3>
                    <audio controls src={recentCall.recording_url} className="w-full h-10 outline-none" />
                  </div>
                )}

                <div className="prose prose-sm max-w-none text-on-surface">
                  <p className="whitespace-pre-wrap leading-relaxed text-base">{recentCall.summary || "No summary provided by the AI yet."}</p>
                </div>
              </div>

              {/* Transcript Section */}
              <div className="bg-surface border border-border/50 rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-serif text-on-surface mb-6">Full Transcript</h2>
                <div className="bg-neutral/30 border border-border/50 rounded-xl p-6 max-h-[500px] overflow-y-auto">
                  {recentCall.transcript ? (
                    <div className="space-y-4">
                      {/* We do a simple split by newline for a chat-like view if Bolna provides line breaks */}
                      {recentCall.transcript.split('\n').map((line: string, i: number) => {
                        if (!line.trim()) return null;
                        const isAI = line.toLowerCase().startsWith('ai:') || line.toLowerCase().startsWith('agent:');
                        const isUser = line.toLowerCase().startsWith('human:') || line.toLowerCase().startsWith('user:');
                        
                        return (
                          <div key={i} className={`p-3 rounded-lg text-sm ${isAI ? 'bg-primary/10 border border-primary/20 text-on-surface mr-12' : isUser ? 'bg-surface border border-border/50 text-on-surface-muted ml-12' : 'text-on-surface-muted'}`}>
                            {line}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-on-surface-muted italic">No transcript recorded for this call.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-surface border border-border/50 rounded-2xl p-12 shadow-sm text-center">
              <div className="w-16 h-16 bg-neutral rounded-full flex items-center justify-center mx-auto mb-4 border border-border/50">
                <span className="text-2xl opacity-50">📞</span>
              </div>
              <h2 className="text-2xl font-serif text-on-surface mb-2">No Calls Yet</h2>
              <p className="text-on-surface-muted mb-6">This lead hasn't been contacted by the AI voice agent.</p>
              <form action="/api/call" method="POST" className="inline-block">
                <input type="hidden" name="leadId" value={lead.id} />
                <input type="hidden" name="phone" value={lead.phone} />
                <button type="button" onClick={() => alert("Please initiate calls from the Leads table page.")} className="bg-primary text-white px-6 py-3 rounded-full font-bold shadow-sm hover:opacity-90 transition-opacity">
                  Go to Leads to Call
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
