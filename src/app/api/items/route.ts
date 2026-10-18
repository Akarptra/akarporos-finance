import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, code, type, unit, sellPrice, costPrice } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Nama barang wajib diisi" }, { status: 400 });
    }

    const itemCode = code || `BRG-${Date.now().toString().slice(-4)}`;

    const item = await prisma.item.create({
      data: {
        name,
        code: itemCode,
        type: type || "PRODUCT",
        unit: unit || "pcs",
        sellPrice: Number(sellPrice) || 0,
        costPrice: Number(costPrice) || 0,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
