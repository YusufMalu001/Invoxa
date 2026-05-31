export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Duplicate Detection Logic
    // Check for expenses within 7 days, same vendor, within 5% amount
    const dateObj = new Date(body.date);
    const sevenDaysAgo = new Date(dateObj.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysFuture = new Date(dateObj.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const amountNum = parseFloat(body.amount);
    const lowerBound = amountNum * 0.95;
    const upperBound = amountNum * 1.05;

    const duplicates = await prisma.expense.findMany({
      where: {
        vendor: { equals: body.vendor },
        date: { gte: sevenDaysAgo, lte: sevenDaysFuture },
        amount: { gte: lowerBound, lte: upperBound }
      }
    });

    const expense = await prisma.expense.create({
      data: {
        vendor: body.vendor,
        expenseNumber: body.expenseNumber || undefined,
        amount: amountNum,
        subtotal: body.subtotal,
        total: body.total,
        date: dateObj,
        category: body.category,
        currency: body.currency || 'USD',
        accountId: body.accountId || undefined,
        projectId: body.projectId || undefined,
        status: body.status || 'SAVED',
        isRecurring: body.isRecurring || false,
        paymentMethod: body.paymentMethod || undefined,
        notes: body.notes || undefined,
        lineItems: body.lineItems || [],
        aiCategorized: false,
      }
    });

    await logAction('Expense', expense.id, 'CREATED', body);

    // Auto-create Journal Entry
    let expenseAccount = await prisma.financialAccount.findFirst({ where: { type: 'EXPENSE' } });
    if (!expenseAccount) expenseAccount = await prisma.financialAccount.create({ data: { name: 'General Expenses', type: 'EXPENSE', currency: 'USD' } });
    
    let bankAccount = await prisma.financialAccount.findFirst({ where: { type: 'BANK' } });
    if (!bankAccount) bankAccount = await prisma.financialAccount.create({ data: { name: 'Main Bank', type: 'BANK', currency: 'USD' } });

    await prisma.journalEntry.create({
      data: {
        date: dateObj,
        description: `Expense: ${body.vendor}`,
        debitAccountId: expenseAccount.id,
        creditAccountId: bankAccount.id,
        amount: amountNum,
        currency: body.currency || 'USD',
        referenceType: 'EXPENSE',
        referenceId: expense.id,
        expenseId: expense.id
      }
    });

    // If duplicate found, return the warning in the response
    if (duplicates.length > 0) {
      return NextResponse.json({
        ...expense,
        duplicateWarning: true,
        duplicateIds: duplicates.map(d => d.id)
      }, { status: 201 });
    }

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const isRecurring = url.searchParams.get('isRecurring') === 'true';

    let where: any = { deletedAt: null };

    if (isRecurring) {
      where.isRecurring = true;
    } else if (status && status !== 'active') {
      where.status = status;
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { account: true, project: true }
    });
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
