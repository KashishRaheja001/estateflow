"use client";

import { useState } from "react";
import { format } from "date-fns";
import { addLead, deleteLead } from "@/app/actions/leadActions";
export default function LeadsTable({ initialLeads, hideTabs = false }: { initialLeads: any[], hideTabs?: boolean }) {
  const [leads, setLeads] = useState(initialLeads || []);
  const [callingId, setCallingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"new" | "contacted">(hideTabs ? "contacted" : "new");

  const handleCall = async (leadId: string, phone: string) => {
    setCallingId(leadId);
    try {
      const response = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Uses NEXT_PUBLIC_BOLNA_AGENT_ID from .env.local
        body: JSON.stringify({ leadId, phone, agentId: process.env.NEXT_PUBLIC_BOLNA_AGENT_ID || localStorage.getItem("bolna_agent_id") || "YOUR_AGENT_ID" }),
      });
      const data = await response.json();
      if (data.success) {
        setLeads(leads.map(l => l.id === leadId ? { ...l, status: "Calling..." } : l));
        alert("Call initiated successfully. Webhook will update status upon completion.");
      } else {
        alert("Failed to initiate call: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while initiating the call.");
    } finally {
      setCallingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      const res = await deleteLead(id);
      if (res.error) alert(res.error);
      else setLeads(leads.filter(l => l.id !== id));
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (activeTab === "new") return lead.status === "New";
    return lead.status !== "New"; // Everything else goes to Contacted
  });

  return (
    <div className="bg-surface border border-border/50 rounded-2xl p-8 shadow-sm relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-serif text-on-surface tracking-tight">Active Leads</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-neutral text-on-surface border border-border/50 px-6 py-2 rounded-full text-sm font-semibold hover:bg-tertiary transition-colors shadow-sm"
        >
          + Add Lead
        </button>
      </div>

      {!hideTabs && (
        <div className="flex border-b border-border/50 mb-6 gap-8">
          <button 
            onClick={() => setActiveTab("new")}
            className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === "new" ? "text-primary" : "text-on-surface-muted hover:text-on-surface"}`}
          >
            New Leads
            {activeTab === "new" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
          </button>
          <button 
            onClick={() => setActiveTab("contacted")}
            className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === "contacted" ? "text-primary" : "text-on-surface-muted hover:text-on-surface"}`}
          >
            Contacted Leads
            {activeTab === "contacted" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-8 shadow-xl relative border border-border/50">
            <h3 className="text-2xl font-serif mb-6 text-on-surface">New Lead</h3>
            <form action={async (formData) => {
              const res = await addLead(formData);
              if (res.error) alert(res.error);
              else {
                setLeads([res.lead, ...leads]);
                setShowAddModal(false);
                setActiveTab("new");
              }
            }} className="space-y-4">
              <div>
                <input type="text" name="name" placeholder="Full Name" required className="w-full bg-neutral border border-border/50 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
              </div>
              <div>
                <input type="text" name="phone" placeholder="Phone Number (e.g. +1234567890)" required className="w-full bg-neutral border border-border/50 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
              </div>
              <div>
                <input type="email" name="email" placeholder="Email Address" className="w-full bg-neutral border border-border/50 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="budget" placeholder="Budget" className="w-full bg-neutral border border-border/50 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                <input type="text" name="property_type" placeholder="Property Type" className="w-full bg-neutral border border-border/50 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-primary text-white py-2.5 rounded-full font-bold text-sm">Save Lead</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-neutral text-on-surface border border-border/50 py-2.5 rounded-full font-bold text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {filteredLeads.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 text-sm font-semibold text-on-surface-muted uppercase tracking-wider">
                <th className="pb-4 font-sans font-bold">Contact Info</th>
                <th className="pb-4 font-sans font-bold">Status</th>
                <th className="pb-4 font-sans font-bold">Interest</th>
                <th className="pb-4 font-sans font-bold">Added Date</th>
                <th className="pb-4 font-sans font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredLeads.map((lead: any) => (
                <tr key={lead.id} className="border-b border-border/20 last:border-0 hover:bg-tertiary/50 transition-colors">
                  <td className="py-5">
                    <div className="font-semibold text-on-surface text-base">{lead.name}</div>
                    <div className="text-on-surface-muted text-sm mt-1">{lead.phone}</div>
                    {lead.email && <div className="text-on-surface-muted text-xs">{lead.email}</div>}
                  </td>
                  <td className="py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      lead.status === "Calling..." ? "bg-amber-100 text-amber-800 border-amber-200" :
                      lead.status === "New" ? "bg-blue-100 text-blue-800 border-blue-200" :
                      lead.status === "Interested" ? "bg-green-100 text-green-800 border-green-200" :
                      lead.status === "Not Interested" ? "bg-red-100 text-red-800 border-red-200" :
                      "bg-tertiary text-on-surface border-border/50"
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-5">
                    <span className="text-on-surface-muted font-medium">
                      {lead.interest_level}
                    </span>
                  </td>
                  <td className="py-5 text-on-surface-muted">
                    {format(new Date(lead.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="py-5 text-right space-x-3 whitespace-nowrap">
                    {lead.status === "New" || lead.status === "Calling..." ? (
                      <button 
                        onClick={() => handleCall(lead.id, lead.phone)}
                        disabled={callingId === lead.id || lead.status === "Calling..."}
                        className="bg-primary text-white px-5 py-2 rounded-full text-sm font-bold tracking-wide shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {callingId === lead.id || lead.status === "Calling..." ? "Calling..." : "Call AI"}
                      </button>
                    ) : (
                      <a href={`/leads/${lead.id}`} className="inline-block bg-primary text-white px-5 py-2 rounded-full text-sm font-bold tracking-wide shadow-sm hover:opacity-90 transition-opacity">
                        View Results
                      </a>
                    )}
                    <button 
                      onClick={() => handleDelete(lead.id)}
                      className="text-on-surface hover:text-red-500 transition-colors text-sm font-medium underline underline-offset-2 ml-3"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 text-on-surface-muted bg-neutral/50 rounded-xl border border-border/30">
          <p className="text-lg font-serif mb-2">No leads found in this section.</p>
          <p className="text-sm">Click "Add Lead" to start building your CRM, or check the other tab.</p>
        </div>
      )}
    </div>
  );
}
