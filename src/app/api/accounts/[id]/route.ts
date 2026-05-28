export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const account = await prisma.financialAccount.findUnique({ where: { id: params.id }, include: { debitEntries: true, creditEntries: true } });
  return NextResponse.json(account);
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const account = await prisma.financialAccount.update({ where: { id: params.id }, data: body });
  return NextResponse.json(account);
}