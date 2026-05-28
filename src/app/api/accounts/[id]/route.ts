import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const account = await prisma.financialAccount.findUnique({ where: { id: (await params).id }, include: { debitEntries: true, creditEntries: true } });
  return NextResponse.json(account);
}
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const account = await prisma.financialAccount.update({ where: { id: (await params).id }, data: body });
  return NextResponse.json(account);
}