export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { InvoiceStatus } from '@prisma/client';

const createInvoiceSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  lineItems: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      rate: z.number(),
      amount: z.number()
    })
  ),
  subtotal: z.number(),
  tax: z.number().optional(),
  total: z.number(),
  currency: z.string().default('USD'),
  status: z.nativeEnum(InvoiceStatus).default(InvoiceStatus.DRAFT),
  dueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  notes: z.string().optional(),
  templateId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    
    let whereClause: any = { deletedAt: null };
    
    if (statusParam && statusParam !== 'ALL' && statusParam !== 'active') {
      whereClause.status = statusParam.toUpperCase();
    } else if (statusParam === 'active') {
      whereClause.status = { not: 'DRAFT' };
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        client: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createInvoiceSchema.parse(body);

    // Generate Invoice Number (simple logic for now)
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        ...validatedData,
        invoiceNumber,
        lineItems: validatedData.lineItems, // Prisma stores JSON
      },
      include: {
        client: true
      }
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: (error as any).errors }, { status: 400 });
    }
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
