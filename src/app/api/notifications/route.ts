import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const unread = searchParams.get('unread') === 'true';
  if (unread) {
    const count = await prisma.notification.count({ where: { isRead: false } });
    return NextResponse.json({ count });
  }
  const n = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
  return NextResponse.json(n);
}