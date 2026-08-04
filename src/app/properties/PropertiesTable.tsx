"use client";
import { useState } from "react";
import { addProperty, deleteProperty, updateProperty } from "@/app/actions/propertyActions";
import { format } from "date-fns";

export default function PropertiesTable({ initialProperties }: { initialProperties: any[] }) {
  const [properties, setProperties] = useState(initialProperties);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProperty, setEditProperty] = useState<any>(null); // State for editing

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    const res = await deleteProperty(id);
    if (res.error) alert(res.error);
    else setProperties(properties.filter(p => p.id !== id));
  };

  return (
    <div className="bg-surface border border-border/50 rounded-2xl p-8 shadow-sm relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif text-on-surface tracking-tight">Active Properties</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-neutral text-on-surface border border-border/50 px-6 py-2 rounded-full text-sm font-semibold hover:bg-tertiary transition-colors shadow-sm"
        >
          + Add Property
        </button>
      </div>

      {/* ADD/EDIT MODAL */}
      {(showAddModal || editProperty) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-8 shadow-xl relative border border-border/50">
            <h3 className="text-2xl font-serif mb-6 text-on-surface">
              {editProperty ? "Edit Property" : "New Property"}
            </h3>
            <form action={async (formData) => {
              if (editProperty) {
                const res = await updateProperty(editProperty.id, formData);
                if (res.error) alert(res.error);
                else {
                  setProperties(properties.map(p => p.id === editProperty.id ? {
                    ...p,
                    project_name: formData.get("project_name"),
                    builder: formData.get("builder"),
                    location: formData.get("location"),
                    description: formData.get("description"),
                    price_range: formData.get("price_range"),
                    configurations: formData.get("configurations")
                  } : p));
                  setEditProperty(null);
                }
              } else {
                const res = await addProperty(formData);
                if (res.error) alert(res.error);
                else {
                  setProperties([res.property, ...properties]);
                  setShowAddModal(false);
                }
              }
            }} className="space-y-4">
              <div>
                <input type="text" name="project_name" defaultValue={editProperty?.project_name || ""} placeholder="Project Name" required className="w-full bg-neutral border border-border/50 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="builder" defaultValue={editProperty?.builder || ""} placeholder="Builder" className="w-full bg-neutral border border-border/50 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                <input type="text" name="location" defaultValue={editProperty?.location || ""} placeholder="Location" required className="w-full bg-neutral border border-border/50 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
              </div>
              <div>
                <textarea name="description" defaultValue={editProperty?.description || ""} placeholder="Description" rows={3} className="w-full bg-neutral border border-border/50 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="price_range" defaultValue={editProperty?.price_range || ""} placeholder="Price Range" className="w-full bg-neutral border border-border/50 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                <input type="text" name="configurations" defaultValue={editProperty?.configurations || ""} placeholder="Configurations (e.g. 2BHK)" className="w-full bg-neutral border border-border/50 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-primary text-white py-2.5 rounded-full font-bold text-sm">
                  {editProperty ? "Save Changes" : "Save Property"}
                </button>
                <button type="button" onClick={() => { setShowAddModal(false); setEditProperty(null); }} className="flex-1 bg-neutral text-on-surface border border-border/50 py-2.5 rounded-full font-bold text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {properties.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 text-sm font-semibold text-on-surface-muted uppercase tracking-wider">
                <th className="pb-4 font-sans font-bold">Project</th>
                <th className="pb-4 font-sans font-bold">Address</th>
                <th className="pb-4 font-sans font-bold">Price</th>
                <th className="pb-4 font-sans font-bold">Added On</th>
                <th className="pb-4 font-sans font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {properties.map((prop: any) => (
                <tr key={prop.id} className="border-b border-border/20 last:border-0 hover:bg-tertiary/50 transition-colors">
                  <td className="py-5">
                    <div className="font-semibold text-on-surface text-base">{prop.project_name}</div>
                    <div className="text-on-surface-muted text-sm mt-1">{prop.builder}</div>
                    <div className="text-on-surface-muted text-xs">{prop.configurations}</div>
                  </td>
                  <td className="py-5">
                    <span className="text-on-surface-muted font-medium">
                      {prop.location}
                    </span>
                  </td>
                  <td className="py-5">
                    <span className="text-on-surface-muted font-medium">
                      {prop.price_range}
                    </span>
                  </td>
                  <td className="py-5 text-on-surface-muted">
                    {format(new Date(prop.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="py-5 text-right space-x-3">
                    <button 
                      onClick={() => setEditProperty(prop)}
                      className="text-on-surface hover:text-primary transition-colors text-sm font-medium underline underline-offset-2"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(prop.id)}
                      className="text-on-surface hover:text-red-500 transition-colors text-sm font-medium underline underline-offset-2"
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
          <p className="text-lg font-serif mb-2">No properties listed.</p>
          <p className="text-sm">Add properties so your AI agent can pitch them to leads.</p>
        </div>
      )}
    </div>
  );
}
