import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: (await params).id },
      include: { client: true, settlement: true }
    });
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const invoice = await prisma.invoice.update({
      where: { id: (await params).id },
      data: body
    });

    if (body.status === 'PAID') {
      let arAccount = await prisma.financialAccount.findFirst({ where: { name: 'Accounts Receivable' } });
      if (!arAccount) arAccount = await prisma.financialAccount.create({ data: { name: 'Accounts Receivable', type: 'BANK', currency: 'USD' } });
      let revenueAccount = await prisma.financialAccount.findFirst({ where: { name: 'Sales Revenue' } });
      if (!revenueAccount) revenueAccount = await prisma.financialAccount.create({ data: { name: 'Sales Revenue', type: 'BANK', currency: 'USD' } });
      
      await prisma.journalEntry.create({
        data: {
          date: new Date(),
          description: `Revenue recognized for Invoice ${invoice.invoiceNumber}`,
          debitAccountId: arAccount.id,
          creditAccountId: revenueAccount.id,
          amount: invoice.total,
          currency: invoice.currency,
          referenceType: 'INVOICE',
          referenceId: invoice.id
        }
      });
    }

    await logAction('Invoice', invoice.id, 'UPDATED', body);

    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Soft delete not natively in prisma schema, so we just update status to CANCELLED
    const invoice = await prisma.invoice.update({
      where: { id: (await params).id },
      data: { status: 'CANCELLED' }
    });

    await logAction('Invoice', invoice.id, 'SOFT_DELETED');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
