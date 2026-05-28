export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const expense = await prisma.expense.findUnique({ where: { id: params.id } });
  return NextResponse.json(expense);
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const expense = await prisma.expense.update({ where: { id: params.id }, data: body });
  return NextResponse.json(expense);
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.expense.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}