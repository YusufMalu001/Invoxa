import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const all = await prisma.expense.count({ where: { deletedAt: null } });
    const saved = await prisma.expense.count({ where: { status: 'SAVED', deletedAt: null } });
    const draft = await prisma.expense.count({ where: { status: 'DRAFT', deletedAt: null } });
    const recurring = await prisma.expense.count({ where: { isRecurring: true, deletedAt: null } });

    // For overdue, let's find recurring expenses whose date is older than 30 days.
    // In a real app, this would use the nextRunAt logic from recurring workflows, 
    // but the expense model only has a boolean `isRecurring`. 
    // We'll estimate "overdue" as expenses that are marked recurring and are older than 30 days 
    // (assuming monthly recurrence) without a newer expense for the same vendor.
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // We'll just do a rough query to simulate the logic for now:
    const overdue = await prisma.expense.count({ 
      where: { 
        isRecurring: true, 
        date: { lt: thirtyDaysAgo }, 
        deletedAt: null 
      } 
    });

    return NextResponse.json({
      all,
      saved,
      draft,
      recurring,
      overdue
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch counts' }, { status: 500 });
  }
}
