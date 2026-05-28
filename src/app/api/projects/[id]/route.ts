import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const project = await prisma.project.findUnique({ where: { id: (await params).id }, include: { milestones: true, expenses: true } });
  return NextResponse.json(project);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const project = await prisma.project.update({ where: { id: (await params).id }, data: body });
  return NextResponse.json(project);
}