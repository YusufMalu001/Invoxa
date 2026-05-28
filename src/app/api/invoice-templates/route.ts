export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const templates = await prisma.invoiceTemplate.findMany();
  return NextResponse.json(templates);
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  const template = await prisma.invoiceTemplate.create({ data: body });
  return NextResponse.json(template, { status: 201 });
}