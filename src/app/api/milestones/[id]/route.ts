import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const m = await prisma.milestone.findUnique({ where: { id: (await params).id } });
  return NextResponse.json(m);
}
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const m = await prisma.milestone.update({ where: { id: (await params).id }, data: body });
  return NextResponse.json(m);
}