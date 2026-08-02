import { supabaseAdmin } from "@/lib/supabase";
import PropertiesTable from "@/app/properties/PropertiesTable";


export const revalidate = 0;

export default async function PropertiesPage() {
  const { data: properties, error } = await supabaseAdmin
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching properties:", error);
  }

  return (
    <div className="space-y-12 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-serif text-on-surface tracking-tighter mb-4">
            Properties
          </h1>
          <p className="text-on-surface-muted text-lg max-w-2xl font-serif leading-relaxed">
            Manage your real estate portfolio. The AI uses these properties to pitch and answer questions during calls.
          </p>
        </div>
      </div>
      
      <PropertiesTable initialProperties={properties || []} />
    </div>
  );
}
