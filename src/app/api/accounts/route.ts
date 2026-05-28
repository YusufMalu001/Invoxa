import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';

export async function GET() {
  try {
    const accounts = await prisma.financialAccount.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const account = await prisma.financialAccount.create({
      data: {
        name: body.name,
        type: body.type,
        currency: body.currency,
        balance: body.balance || 0,
        walletAddress: body.walletAddress,
      }
    });

    await logAction('FinancialAccount', account.id, 'CREATED', body);

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
