import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const r = await prisma.recurringWorkflow.findMany();
  return NextResponse.json(r);
}
export async function POST(req: Request) {
  const body = await req.json();
  const r = await prisma.recurringWorkflow.create({ data: body });
  return NextResponse.json(r, { status: 201 });
}