export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await prisma.settlementRecord.findUnique({ where: { id: params.id } });
  return NextResponse.json(s);
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const s = await prisma.settlementRecord.update({ where: { id: params.id }, data: body });
  return NextResponse.json(s);
}