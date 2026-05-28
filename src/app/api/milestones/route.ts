import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const m = await prisma.milestone.findMany();
  return NextResponse.json(m);
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  const m = await prisma.milestone.create({ data: body });
  return NextResponse.json(m, { status: 201 });
}