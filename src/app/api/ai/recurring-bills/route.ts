import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const expenses = await prisma.expense.findMany({ where: { createdAt: { gte: new Date(Date.now() - 90 * 86400000) } }});
  return NextResponse.json({ bills: [] }); // Stub logic for brevity
}