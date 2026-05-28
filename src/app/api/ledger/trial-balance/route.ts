export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const entries = await prisma.journalEntry.findMany();
  const balances: Record<string, { debits: number, credits: number }> = {};
  entries.forEach(e => {
    if(!balances[e.debitAccountId]) balances[e.debitAccountId] = { debits: 0, credits: 0 };
    if(!balances[e.creditAccountId]) balances[e.creditAccountId] = { debits: 0, credits: 0 };
    balances[e.debitAccountId].debits += e.amount;
    balances[e.creditAccountId].credits += e.amount;
  });
  return NextResponse.json(balances);
}