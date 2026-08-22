"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditorialUser } from "@/lib/admin/roles";
import { makeSlug } from "@/lib/admin/slug";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createContent(formData: FormData) {
  const { supabase, user } = await requireEditorialUser();
  const title = text(formData, "title");

  const { data, error } = await supabase
    .from("content_items")
    .insert({
      title,
      slug: makeSlug(text(formData, "slug") || title),
      summary: text(formData, "summary") || null,
      content_type: text(formData, "content_type") || "article",
      status: "draft",
      author_id: user.id,
    })
    .select("id")
    .single();

  if (error || !data) redirect("/admin/content/nieuw?error=1");
  redirect(`/admin/content/${data.id}`);
}

export async function createResearch(formData: FormData) {
  const { supabase, user } = await requireEditorialUser();
  const title = text(formData, "title");

  const { data, error } = await supabase
    .from("content_items")
    .insert({
      title,
      slug: makeSlug(text(formData, "slug") || title),
      summary: text(formData, "summary") || null,
      content_type: "research",
      status: "researching",
      author_id: user.id,
    })
    .select("id")
    .single();

  if (error || !data) redirect("/admin/onderzoeken/nieuw?error=1");

  await supabase.from("research_dossiers").insert({
    content_id: data.id,
    central_question: text(formData, "central_question") || title,
    method: text(formData, "method") || null,
    boundaries: text(formData, "boundaries") || null,
  });

  redirect(`/admin/content/${data.id}`);
}

export async function addSection(formData: FormData) {
  const { supabase } = await requireEditorialUser();
  const contentId = text(formData, "content_id");

  const { data: last } = await supabase
    .from("content_sections")
    .select("position")
    .eq("content_id", contentId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("content_sections").insert({
    content_id: contentId,
    section_type: text(formData, "section_type") || "paragraph",
    title: text(formData, "title") || null,
    body: text(formData, "body") || null,
    position: (last?.position ?? -1) + 1,
  });

  revalidatePath(`/admin/content/${contentId}`);
}

export async function updateContent(formData: FormData) {
  const { supabase } = await requireEditorialUser();
  const id = text(formData, "id");

  await supabase.from("content_items").update({
    title: text(formData, "title"),
    slug: makeSlug(text(formData, "slug")),
    summary: text(formData, "summary") || null,
    status: text(formData, "status"),
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  revalidatePath(`/admin/content/${id}`);
}

export async function publishContent(formData: FormData) {
  const { supabase, role } = await requireEditorialUser();
  if (!["owner","admin","editor"].includes(role)) redirect("/admin?error=no_publish_permission");

  const id = text(formData, "id");
  await supabase.from("content_items").update({
    status: "published",
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  revalidatePath("/artikelen");
  revalidatePath("/onderzoek");
  revalidatePath(`/admin/content/${id}`);
}
