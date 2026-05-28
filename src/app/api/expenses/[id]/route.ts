import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const expense = await prisma.expense.findUnique({ where: { id: (await params).id } });
  return NextResponse.json(expense);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const expense = await prisma.expense.update({ where: { id: (await params).id }, data: body });
  return NextResponse.json(expense);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await prisma.expense.delete({ where: { id: (await params).id } });
  return NextResponse.json({ success: true });
}