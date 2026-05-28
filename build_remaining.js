const fs = require('fs');
const path = require('path');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const apis = [
  {
    path: 'api/invoices/[id]/pdf/route.ts',
    content: `import { NextResponse } from 'next/server';
// @react-pdf/renderer requires node environment or proper setup. This is a stub that returns a fake PDF stream or redirect.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  return new NextResponse('PDF generation placeholder', {
    headers: { 'Content-Type': 'application/pdf' }
  });
}`
  },
  {
    path: 'api/invoice-templates/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const templates = await prisma.invoiceTemplate.findMany();
  return NextResponse.json(templates);
}
export async function POST(req: Request) {
  const body = await req.json();
  const template = await prisma.invoiceTemplate.create({ data: body });
  return NextResponse.json(template, { status: 201 });
}`
  },
  {
    path: 'api/clients/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const clients = await prisma.client.findMany();
  return NextResponse.json(clients);
}
export async function POST(req: Request) {
  const body = await req.json();
  const client = await prisma.client.create({ data: body });
  return NextResponse.json(client, { status: 201 });
}`
  },
  {
    path: 'api/clients/[id]/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({ where: { id: params.id }, include: { invoices: true } });
  return NextResponse.json(client);
}
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const client = await prisma.client.update({ where: { id: params.id }, data: body });
  return NextResponse.json(client);
}`
  },
  {
    path: 'api/expenses/[id]/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const expense = await prisma.expense.findUnique({ where: { id: params.id } });
  return NextResponse.json(expense);
}
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const expense = await prisma.expense.update({ where: { id: params.id }, data: body });
  return NextResponse.json(expense);
}
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await prisma.expense.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}`
  },
  {
    path: 'api/settlements/[id]/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const s = await prisma.settlementRecord.findUnique({ where: { id: params.id } });
  return NextResponse.json(s);
}
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const s = await prisma.settlementRecord.update({ where: { id: params.id }, data: body });
  return NextResponse.json(s);
}`
  },
  {
    path: 'api/accounts/[id]/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const account = await prisma.financialAccount.findUnique({ where: { id: params.id }, include: { debitEntries: true, creditEntries: true } });
  return NextResponse.json(account);
}
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const account = await prisma.financialAccount.update({ where: { id: params.id }, data: body });
  return NextResponse.json(account);
}`
  },
  {
    path: 'api/projects/[id]/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id }, include: { milestones: true, expenses: true } });
  return NextResponse.json(project);
}
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const project = await prisma.project.update({ where: { id: params.id }, data: body });
  return NextResponse.json(project);
}`
  },
  {
    path: 'api/milestones/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const m = await prisma.milestone.findMany();
  return NextResponse.json(m);
}
export async function POST(req: Request) {
  const body = await req.json();
  const m = await prisma.milestone.create({ data: body });
  return NextResponse.json(m, { status: 201 });
}`
  },
  {
    path: 'api/milestones/[id]/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const m = await prisma.milestone.findUnique({ where: { id: params.id } });
  return NextResponse.json(m);
}
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const m = await prisma.milestone.update({ where: { id: params.id }, data: body });
  return NextResponse.json(m);
}`
  },
  {
    path: 'api/ledger/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const ledger = await prisma.journalEntry.findMany({ include: { debitAccount: true, creditAccount: true } });
  return NextResponse.json(ledger);
}`
  },
  {
    path: 'api/ledger/trial-balance/route.ts',
    content: `import { NextResponse } from 'next/server';
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
}`
  },
  {
    path: 'api/ledger/export/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const entries = await prisma.journalEntry.findMany({ include: { debitAccount: true, creditAccount: true } });
  const csv = "Date,Description,Debit Account,Credit Account,Amount,Currency\\n" + 
    entries.map(e => \`\${e.date.toISOString()},\${e.description},\${e.debitAccount.name},\${e.creditAccount.name},\${e.amount},\${e.currency}\`).join("\\n");
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv' }});
}`
  },
  {
    path: 'api/notifications/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const unread = searchParams.get('unread') === 'true';
  if (unread) {
    const count = await prisma.notification.count({ where: { isRead: false } });
    return NextResponse.json({ count });
  }
  const n = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
  return NextResponse.json(n);
}`
  },
  {
    path: 'api/notifications/mark-read/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function PATCH() {
  await prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
  return NextResponse.json({ success: true });
}`
  },
  {
    path: 'api/recurring/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const r = await prisma.recurringWorkflow.findMany();
  return NextResponse.json(r);
}
export async function POST(req: Request) {
  const body = await req.json();
  const r = await prisma.recurringWorkflow.create({ data: body });
  return NextResponse.json(r, { status: 201 });
}`
  },
  {
    path: 'api/recurring/[id]/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const r = await prisma.recurringWorkflow.update({ where: { id: params.id }, data: body });
  return NextResponse.json(r);
}`
  },
  {
    path: 'api/ai/recurring-bills/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const expenses = await prisma.expense.findMany({ where: { createdAt: { gte: new Date(Date.now() - 90 * 86400000) } }});
  return NextResponse.json({ bills: [] }); // Stub logic for brevity
}`
  }
];

apis.forEach(api => {
  const fullPath = path.join(__dirname, 'src/app', api.path);
  ensureDir(path.dirname(fullPath));
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, api.content);
    console.log('Created:', fullPath);
  }
});
