import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Storage not configured — BLOB_READ_WRITE_TOKEN is missing." },
      { status: 500 }
    );
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const entry = form.get("file");
    if (!entry || typeof entry === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    file = entry as File;
  } catch (err) {
    console.error("[upload] formData parse error:", err);
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  // Validate MIME type
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, GIF, and AVIF images are allowed" },
      { status: 400 }
    );
  }

  // Validate size (10 MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 10 MB" }, { status: 400 });
  }

  // Build a unique filename
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const pathname = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // Convert File to Buffer for Node.js fetch
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload to Vercel Blob REST API
  // ?access=public is required for publicly-readable blobs
  // ?addRandomSuffix=0 because we already add our own random suffix
  const blobUrl = `https://blob.vercel-storage.com/${pathname}?access=public&addRandomSuffix=0`;
  let blobRes: Response;
  try {
    blobRes = await fetch(blobUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": file.type,
      },
      body: buffer,
    });
  } catch (err) {
    console.error("[upload] fetch to Vercel Blob failed:", err);
    return NextResponse.json({ error: "Could not reach storage service." }, { status: 502 });
  }

  const responseText = await blobRes.text();
  if (!blobRes.ok) {
    console.error("[upload] Vercel Blob error", blobRes.status, responseText);
    return NextResponse.json(
      { error: `Storage error ${blobRes.status}: ${responseText}` },
      { status: 502 }
    );
  }

  let blob: { url?: string; downloadUrl?: string };
  try {
    blob = JSON.parse(responseText);
  } catch {
    console.error("[upload] unexpected non-JSON response:", responseText);
    return NextResponse.json({ error: "Unexpected response from storage." }, { status: 502 });
  }

  const url = blob.url ?? blob.downloadUrl;
  if (!url) {
    console.error("[upload] no url in blob response:", blob);
    return NextResponse.json({ error: "Storage did not return a URL." }, { status: 502 });
  }

  return NextResponse.json({ url });
}
