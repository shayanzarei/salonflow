import { SERVICE_CATEGORIES } from "@/lib/service-categories";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ categories: [...SERVICE_CATEGORIES] });
}
