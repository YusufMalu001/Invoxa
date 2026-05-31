export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const expense = await prisma.expense.findFirst({
      where: { id, deletedAt: null },
      include: {
        account: true,
        project: true
      }
    });

    if (!expense) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const expense = await prisma.expense.findUnique({ where: { id } });
    
    if (!expense) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (expense.status === 'DRAFT') {
      await prisma.expense.delete({ where: { id } });
    } else {
      await prisma.expense.update({ where: { id }, data: { deletedAt: new Date() } });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const body = await request.json();
    
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        vendor: body.vendor,
        expenseNumber: body.expenseNumber,
        amount: body.amount,
        subtotal: body.subtotal,
        total: body.total,
        date: body.date ? new Date(body.date) : undefined,
        category: body.category,
        currency: body.currency,
        accountId: body.accountId,
        projectId: body.projectId,
        status: body.status,
        isRecurring: body.isRecurring,
        paymentMethod: body.paymentMethod,
        notes: body.notes,
        lineItems: body.lineItems,
      }
    });
    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}