export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InvoiceStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const [allCount, sentCount, paidCount, overdueCount, draftCount] = await Promise.all([
      prisma.invoice.count({ where: { deletedAt: null } }),
      prisma.invoice.count({ where: { deletedAt: null, status: 'SENT' } }),
      prisma.invoice.count({ where: { deletedAt: null, status: 'PAID' } }),
      prisma.invoice.count({ where: { deletedAt: null, status: 'OVERDUE' } }),
      prisma.invoice.count({ where: { deletedAt: null, status: 'DRAFT' } }),
    ]);

    return NextResponse.json({
      all: allCount,
      sent: sentCount,
      paid: paidCount,
      overdue: overdueCount,
      draft: draftCount
    });
  } catch (error) {
    console.error('Error fetching invoice counts:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice counts' }, { status: 500 });
  }
}
