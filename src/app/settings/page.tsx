import SettingsForm from "./SettingsForm";

export default function SettingsPage() {
  return (
    <div className="space-y-12 py-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-5xl font-serif text-on-surface tracking-tighter mb-4">
          Configuration
        </h1>
        <p className="text-on-surface-muted text-lg font-serif leading-relaxed">
          Configure your Bolna AI agent settings and webhook integrations here.
        </p>
      </div>
      
      <SettingsForm />
    </div>
  );
}
