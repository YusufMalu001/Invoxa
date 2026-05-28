import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await prisma.settlementRecord.findUnique({ where: { id: (await params).id } });
  return NextResponse.json(s);
}
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const s = await prisma.settlementRecord.update({ where: { id: (await params).id }, data: body });
  return NextResponse.json(s);
}