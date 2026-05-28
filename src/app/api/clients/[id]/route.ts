import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = await prisma.client.findUnique({ where: { id: (await params).id }, include: { invoices: true } });
  return NextResponse.json(client);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const client = await prisma.client.update({ where: { id: (await params).id }, data: body });
  return NextResponse.json(client);
}