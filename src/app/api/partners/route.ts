import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // CUSTOMER | VENDOR

    const where = type ? { type } : {};
    const partners = await prisma.partner.findMany({
      where,
      orderBy: { id: "desc" },
    });
    return NextResponse.json({ success: true, partners });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, type, email, phone, address, npwp, termsDays } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Nama pelanggan/pemasok wajib diisi" }, { status: 400 });
    }

    const partner = await prisma.partner.create({
      data: {
        name,
        type: type || "CUSTOMER",
        email: email || null,
        phone: phone || null,
        address: address || null,
        npwp: npwp || null,
        termsDays: Number(termsDays) || 30,
      },
    });

    return NextResponse.json({ success: true, partner });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
