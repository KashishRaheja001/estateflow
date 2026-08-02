"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function addProperty(formData: FormData) {
  const project_name = formData.get("project_name") as string;
  const builder = formData.get("builder") as string;
  const location = formData.get("location") as string;
  const description = formData.get("description") as string;
  const price_range = formData.get("price_range") as string;
  const configurations = formData.get("configurations") as string;
  const amenities = formData.get("amenities") as string;

  if (!project_name || !location) {
    return { error: "Project Name and Location are required." };
  }

  const { data, error } = await supabaseAdmin
    .from("properties")
    .insert([
      {
        project_name,
        builder,
        location,
        description,
        price_range,
        configurations,
        amenities,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error adding property:", error);
    return { error: error.message };
  }

  revalidatePath("/properties");
  revalidatePath("/");
  
  return { success: true, property: data };
}

export async function deleteProperty(id: string) {
  const { error } = await supabaseAdmin
    .from("properties")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }
  
  revalidatePath("/properties");
  revalidatePath("/");
  return { success: true };
}
