"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditorialUser } from "@/lib/admin/roles";
import { makeSlug } from "@/lib/admin/slug";
import { publicContentHref } from "@/lib/admin/content";

const allowedSectionTypes = new Set([
  "paragraph","heading","intro","quote","stat","callout","graph","timeline","claim_cluster","source_list","perspective_cluster","void",
]);

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function optionalNumber(formData: FormData, key: string) {
  const raw = text(formData, key);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function lines(formData: FormData, key: string) {
  return text(formData, key).split("\n").map((item) => item.trim()).filter(Boolean);
}

function revalidateContent(contentType: string, slug: string) {
  revalidatePath("/");
  revalidatePath("/artikelen");
  revalidatePath("/onderzoek");
  revalidatePath(publicContentHref(contentType, slug));
  revalidatePath("/admin");
  revalidatePath("/admin/content");
  revalidatePath("/admin/onderzoeken");
}

export async function createContent(formData: FormData) {
  const { supabase, user } = await requireEditorialUser();
  const title = text(formData, "title");
  const contentType = text(formData, "content_type") || "article";
  const slug = makeSlug(text(formData, "slug") || title);

  const { data, error } = await supabase.from("content_items").insert({
    title,
    slug,
    eyebrow: text(formData, "eyebrow") || null,
    subtitle: text(formData, "subtitle") || null,
    summary: text(formData, "summary") || null,
    hero_image: text(formData, "hero_image") || null,
    image_alt: text(formData, "image_alt") || null,
    content_type: contentType,
    status: "draft",
    author_id: user.id,
    metadata: {},
  }).select("id").single();

  if (error || !data) redirect("/admin/content/nieuw?error=1");
  revalidateContent(contentType, slug);
  redirect(`/admin/content/${data.id}`);
}

export async function createResearch(formData: FormData) {
  const { supabase, user } = await requireEditorialUser();
  const title = text(formData, "title");
  const slug = makeSlug(text(formData, "slug") || title);

  const { data, error } = await supabase.from("content_items").insert({
    title,
    slug,
    eyebrow: text(formData, "eyebrow") || "ONDERZOEK",
    summary: text(formData, "summary") || null,
    hero_image: text(formData, "hero_image") || null,
    image_alt: text(formData, "image_alt") || null,
    content_type: "research",
    status: "researching",
    featured: false,
    author_id: user.id,
    metadata: {},
  }).select("id").single();

  if (error || !data) redirect("/admin/onderzoeken/nieuw?error=1");

  await supabase.from("research_dossiers").insert({
    content_id: data.id,
    central_question: text(formData, "central_question") || title,
    method: text(formData, "method") || null,
    boundaries: text(formData, "boundaries") || null,
    dimensions: lines(formData, "dimensions"),
    missing_information: [],
  });

  revalidateContent("research", slug);
  redirect(`/admin/content/${data.id}`);
}

export async function updateContent(formData: FormData) {
  const { supabase } = await requireEditorialUser();
  const id = text(formData, "id");
  const { data: current } = await supabase.from("content_items").select("content_type,slug,metadata").eq("id", id).single();
  if (!current) redirect("/admin/content");

  const title = text(formData, "title");
  const slug = makeSlug(text(formData, "slug") || title);
  const featured = checked(formData, "featured");
  const metadata = {
    ...(current.metadata && typeof current.metadata === "object" ? current.metadata : {}),
    experiences: optionalNumber(formData, "experiences"),
    experts: optionalNumber(formData, "experts"),
    provinces: optionalNumber(formData, "provinces"),
    display_date: text(formData, "display_date") || null,
  };

  await supabase.from("content_items").update({
    title,
    slug,
    eyebrow: text(formData, "eyebrow") || null,
    subtitle: text(formData, "subtitle") || null,
    summary: text(formData, "summary") || null,
    hero_image: text(formData, "hero_image") || null,
    image_alt: text(formData, "image_alt") || null,
    status: text(formData, "status") || "draft",
    featured,
    featured_position: featured ? (text(formData, "featured_position") || "side") : null,
    metadata,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (current.content_type === "research") {
    await supabase.from("research_dossiers").upsert({
      content_id: id,
      central_question: text(formData, "central_question") || title,
      method: text(formData, "method") || null,
      boundaries: text(formData, "boundaries") || null,
      dimensions: lines(formData, "dimensions"),
      missing_information: lines(formData, "missing_information"),
      updated_at: new Date().toISOString(),
    }, { onConflict: "content_id" });
  }

  revalidateContent(current.content_type, current.slug);
  if (slug !== current.slug) revalidateContent(current.content_type, slug);
  revalidatePath(`/admin/content/${id}`);
  redirect(`/admin/content/${id}?saved=1`);
}

export async function publishContent(formData: FormData) {
  const { supabase, role } = await requireEditorialUser();
  if (!["owner","admin","editor"].includes(role)) redirect("/admin?error=no_publish_permission");

  const id = text(formData, "id");
  const { data: current } = await supabase.from("content_items").select("content_type,slug,published_at").eq("id", id).single();
  if (!current) redirect("/admin/content");

  await supabase.from("content_items").update({
    status: "published",
    published_at: current.published_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  revalidateContent(current.content_type, current.slug);
  revalidatePath(`/admin/content/${id}`);
  redirect(`/admin/content/${id}?published=1`);
}

export async function deleteContent(formData: FormData) {
  const { supabase, role } = await requireEditorialUser();
  if (!["owner","admin","editor"].includes(role)) redirect("/admin?error=no_delete_permission");

  const id = text(formData, "id");
  const { data: current } = await supabase.from("content_items").select("content_type,slug").eq("id", id).single();
  if (current) {
    await supabase.from("content_items").delete().eq("id", id);
    revalidateContent(current.content_type, current.slug);
  }
  redirect("/admin/content?deleted=1");
}

export async function addSection(formData: FormData) {
  const { supabase } = await requireEditorialUser();
  const contentId = text(formData, "content_id");
  const requestedType = text(formData, "section_type") || "paragraph";
  const sectionType = allowedSectionTypes.has(requestedType) ? requestedType : "paragraph";

  const { data: last } = await supabase.from("content_sections").select("position").eq("content_id", contentId).order("position", { ascending: false }).limit(1).maybeSingle();

  await supabase.from("content_sections").insert({
    content_id: contentId,
    section_type: sectionType,
    title: text(formData, "title") || null,
    body: text(formData, "body") || null,
    data: {
      eyebrow: text(formData, "eyebrow") || null,
      points: lines(formData, "points"),
    },
    position: (last?.position ?? 0) + 10,
  });

  revalidatePath(`/admin/content/${contentId}`);
}

export async function updateSection(formData: FormData) {
  const { supabase } = await requireEditorialUser();
  const id = text(formData, "section_id");
  const contentId = text(formData, "content_id");
  const requestedType = text(formData, "section_type");
  const sectionType = allowedSectionTypes.has(requestedType) ? requestedType : "paragraph";
  const { data: current } = await supabase.from("content_sections").select("data").eq("id", id).single();

  await supabase.from("content_sections").update({
    section_type: sectionType,
    title: text(formData, "section_title") || null,
    body: text(formData, "section_body") || null,
    data: {
      ...(current?.data && typeof current.data === "object" ? current.data : {}),
      eyebrow: text(formData, "section_eyebrow") || null,
      points: lines(formData, "section_points"),
    },
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  revalidatePath(`/admin/content/${contentId}`);
  revalidatePath("/");
}

export async function deleteSection(formData: FormData) {
  const { supabase } = await requireEditorialUser();
  const id = text(formData, "section_id");
  const contentId = text(formData, "content_id");
  await supabase.from("content_sections").delete().eq("id", id);
  revalidatePath(`/admin/content/${contentId}`);
  revalidatePath("/");
}

export async function moveSection(formData: FormData) {
  const { supabase } = await requireEditorialUser();
  const id = text(formData, "section_id");
  const contentId = text(formData, "content_id");
  const direction = text(formData, "direction");
  const { data: sections } = await supabase.from("content_sections").select("id,position").eq("content_id", contentId).order("position", { ascending: true });
  const rows = sections ?? [];
  const index = rows.findIndex((row) => row.id === id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (index >= 0 && targetIndex >= 0 && targetIndex < rows.length) {
    const current = rows[index];
    const target = rows[targetIndex];
    await supabase.from("content_sections").update({ position: target.position }).eq("id", current.id);
    await supabase.from("content_sections").update({ position: current.position }).eq("id", target.id);
  }

  revalidatePath(`/admin/content/${contentId}`);
  revalidatePath("/");
}
