export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { ExpensePDFDocument } from '@/components/ExpensePDFDocument';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        account: true,
        project: true
      }
    });

    if (!expense) {
      return new NextResponse('Expense not found', { status: 404 });
    }

    const buffer = await renderToBuffer(<ExpensePDFDocument expense={expense} />);

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="expense-${expense.expenseNumber || id}.pdf"`
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new NextResponse('Internal Server Error generating PDF', { status: 500 });
  }
}
