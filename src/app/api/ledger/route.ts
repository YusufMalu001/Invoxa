import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const ledger = await prisma.journalEntry.findMany({ include: { debitAccount: true, creditAccount: true } });
  return NextResponse.json(ledger);
}