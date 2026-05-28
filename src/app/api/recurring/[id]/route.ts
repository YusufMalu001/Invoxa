export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const r = await prisma.recurringWorkflow.update({ where: { id: params.id }, data: body });
  return NextResponse.json(r);
}