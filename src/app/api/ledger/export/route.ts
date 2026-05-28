import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const entries = await prisma.journalEntry.findMany({ include: { debitAccount: true, creditAccount: true } });
  const csv = "Date,Description,Debit Account,Credit Account,Amount,Currency\n" + 
    entries.map(e => `${e.date.toISOString()},${e.description},${e.debitAccount.name},${e.creditAccount.name},${e.amount},${e.currency}`).join("\n");
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv' }});
}