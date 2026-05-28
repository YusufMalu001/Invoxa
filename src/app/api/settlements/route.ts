import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { SettlementStatus } from '@prisma/client';

const createSettlementSchema = z.object({
  invoiceId: z.string(),
  invoicedUSD: z.number(),
  receivedUSD: z.number().optional(),
  realizedINR: z.number().optional(),
  exchangeRate: z.number().optional(),
  platformFee: z.number().optional(),
  transferFee: z.number().optional(),
  taxDeducted: z.number().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createSettlementSchema.parse(body);

    // Calculate Net Realized
    // Let's say receivedUSD - fees, converted to INR if not already provided
    let netRealized = data.realizedINR;
    if (!netRealized && data.receivedUSD && data.exchangeRate) {
      const fees = (data.platformFee || 0) + (data.transferFee || 0);
      netRealized = (data.receivedUSD - fees) * data.exchangeRate - (data.taxDeducted || 0);
    }

    const settlement = await prisma.settlementRecord.create({
      data: {
        ...data,
        netRealized,
        status: SettlementStatus.SETTLED,
        settledAt: new Date(),
      },
    });

    // Auto-create Journal Entry
    // Find a default accounts (mock logic for demo: picking first available or creating)
    let bankAccount = await prisma.financialAccount.findFirst({ where: { type: 'BANK' } });
    if (!bankAccount) bankAccount = await prisma.financialAccount.create({ data: { name: 'Main Bank', type: 'BANK', currency: 'INR' } });
    
    let arAccount = await prisma.financialAccount.findFirst({ where: { name: 'Accounts Receivable' } });
    if (!arAccount) arAccount = await prisma.financialAccount.create({ data: { name: 'Accounts Receivable', type: 'BANK', currency: 'USD' } });

    await prisma.journalEntry.create({
      data: {
        date: new Date(),
        description: `Settlement for Invoice ${data.invoiceId}`,
        debitAccountId: bankAccount.id,
        creditAccountId: arAccount.id,
        amount: netRealized || data.invoicedUSD,
        currency: 'INR',
        referenceType: 'SETTLEMENT',
        referenceId: settlement.id
      }
    });
    
    return NextResponse.json(settlement, { status: 201 });
  } catch (error) {
    console.error('Error creating settlement:', error);
    return NextResponse.json({ error: 'Failed to record settlement' }, { status: 500 });
  }
}
