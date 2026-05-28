import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const r = await prisma.recurringWorkflow.update({ where: { id: (await params).id }, data: body });
  return NextResponse.json(r);
}