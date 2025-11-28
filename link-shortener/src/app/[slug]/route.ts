import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Slug es requerido" }, { status: 400 });
    }

    // Buscar el link en la BD
    const link = await prisma.link.findUnique({
      where: { slug },
    });

    if (!link) {
      return NextResponse.json({ error: "URL no encontrada" }, { status: 404 });
    }

    // Actualizar contador de clics
    await prisma.link.update({
      where: { slug },
      data: { clicks: link.clicks + 1 }
    });

    // Redirigir
    return NextResponse.redirect(link.url);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}