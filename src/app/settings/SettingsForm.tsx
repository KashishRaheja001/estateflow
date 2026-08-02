"use client";

import { useState, useEffect } from "react";

export default function SettingsForm() {
  const [formData, setFormData] = useState({
    bolnaAgentId: "",
    webhookUrl: "",
    companyName: "",
    agentName: "",
    voiceLanguage: "en",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData({
      bolnaAgentId: localStorage.getItem("bolna_agent_id") || "",
      webhookUrl: localStorage.getItem("webhook_url") || "",
      companyName: localStorage.getItem("company_name") || "",
      agentName: localStorage.getItem("agent_name") || "",
      voiceLanguage: localStorage.getItem("voice_language") || "en",
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("bolna_agent_id", formData.bolnaAgentId);
    localStorage.setItem("webhook_url", formData.webhookUrl);
    localStorage.setItem("company_name", formData.companyName);
    localStorage.setItem("agent_name", formData.agentName);
    localStorage.setItem("voice_language", formData.voiceLanguage);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border/50 rounded-2xl p-8 shadow-sm space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2 uppercase tracking-wide">Bolna Agent ID</label>
          <input 
            type="text" 
            name="bolnaAgentId"
            value={formData.bolnaAgentId}
            onChange={handleChange}
            placeholder="e.g. agt_123456789"
            className="w-full bg-neutral border border-border/50 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2 uppercase tracking-wide">Webhook URL</label>
          <input 
            type="url" 
            name="webhookUrl"
            value={formData.webhookUrl}
            onChange={handleChange}
            placeholder="https://yourdomain.com/api/webhook"
            className="w-full bg-neutral border border-border/50 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2 uppercase tracking-wide">Company Name</label>
            <input 
              type="text" 
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="EstateFlow Realty"
              className="w-full bg-neutral border border-border/50 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2 uppercase tracking-wide">Agent Name (AI Voice)</label>
            <input 
              type="text" 
              name="agentName"
              value={formData.agentName}
              onChange={handleChange}
              placeholder="Sarah"
              className="w-full bg-neutral border border-border/50 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2 uppercase tracking-wide">Voice Language</label>
          <select 
            name="voiceLanguage"
            value={formData.voiceLanguage}
            onChange={handleChange}
            className="w-full bg-neutral border border-border/50 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
          >
            <option value="en">English (US)</option>
            <option value="en-gb">English (UK)</option>
            <option value="en-in">English (India)</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
      </div>
      
      <div className="pt-4 flex items-center gap-4 border-t border-border/50">
        <button 
          type="submit" 
          className="bg-primary text-white px-8 py-3 rounded-full text-sm font-bold tracking-wide shadow-sm hover:opacity-90 transition-opacity"
        >
          Save Configuration
        </button>
        {saved && <span className="text-sm font-medium text-green-600">Settings saved successfully.</span>}
      </div>
    </form>
  );
}
