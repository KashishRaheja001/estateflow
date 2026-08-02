"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function addLead(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const budget = formData.get("budget") as string;
  const property_type = formData.get("property_type") as string;
  const preferred_location = formData.get("preferred_location") as string;
  const timeline = formData.get("timeline") as string;
  const purpose = formData.get("purpose") as string;

  if (!name || !phone) {
    return { error: "Name and Phone are required." };
  }

  const { data, error } = await supabaseAdmin
    .from("leads")
    .insert([
      {
        name,
        phone,
        email,
        budget,
        property_type,
        preferred_location,
        timeline,
        purpose,
        status: "New",
        interest_level: "Pending",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error adding lead:", error);
    return { error: error.message };
  }

  revalidatePath("/leads");
  revalidatePath("/");
  
  return { success: true, lead: data };
}

export async function deleteLead(id: string) {
  const { error } = await supabaseAdmin
    .from("leads")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }
  
  revalidatePath("/leads");
  revalidatePath("/");
  return { success: true };
}
