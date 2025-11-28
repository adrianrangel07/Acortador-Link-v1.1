import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const RATE_LIMIT_MS = 2000;
const lastRequest: Record<string, number> = {};

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();

    if (lastRequest[ip] && now - lastRequest[ip] < RATE_LIMIT_MS) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Espera un momento." },
        { status: 429 }
      );
    }

    lastRequest[ip] = now;

    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "URL es requerida" }, { status: 400 });
    }

    // Validar URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 });
    }

    // Generar slug único
    const slug = Math.random().toString(36).substring(2, 8);

    const newLink = await prisma.link.create({
      data: { slug, url },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    
    return NextResponse.json({
      shorturl: `${baseUrl}/${newLink.slug}`,
      slug: newLink.slug,
    });
  } catch (error: any) {
    console.error("Database error:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Slug ya existe, intenta de nuevo" }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Error guardando enlace" }, { status: 500 });
  }
}