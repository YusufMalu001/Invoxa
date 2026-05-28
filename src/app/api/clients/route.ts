import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const clients = await prisma.client.findMany();
  return NextResponse.json(clients);
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await prisma.client.create({ data: body });
    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
