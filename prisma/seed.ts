import { PrismaClient, AccountType, InvoiceStatus, SettlementStatus, ProjectStatus } from '@prisma/client';
import { addDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create Financial Accounts (3)
  const bankAccount = await prisma.financialAccount.create({
    data: {
      name: 'Mercury USD',
      type: AccountType.BANK,
      currency: 'USD',
      balance: 45000,
    },
  });

  const wiseAccount = await prisma.financialAccount.create({
    data: {
      name: 'Wise Business',
      type: AccountType.WISE,
      currency: 'USD',
      balance: 12500,
    },
  });

  const cryptoAccount = await prisma.financialAccount.create({
    data: {
      name: 'USDC Treasury',
      type: AccountType.CRYPTO,
      currency: 'USD',
      balance: 10000,
      walletAddress: '0x1234567890123456789012345678901234567890',
    },
  });

  console.log('Created Financial Accounts');

  // 2. Create Clients (5)
  const clientsData = [
    { name: 'Acme Corp', email: 'billing@acme.co', country: 'US', currency: 'USD' },
    { name: 'Globex Inc', email: 'finance@globex.com', country: 'UK', currency: 'GBP' },
    { name: 'Soylent Corp', email: 'ap@soylent.net', country: 'CA', currency: 'CAD' },
    { name: 'Initech', email: 'accounting@initech.com', country: 'US', currency: 'USD' },
    { name: 'Umbrella Corp', email: 'payments@umbrella.co', country: 'CH', currency: 'CHF' },
  ];

  const clients = await Promise.all(
    clientsData.map(c => prisma.client.create({ data: c }))
  );
  console.log(`Created ${clients.length} Clients`);

  // 3. Create Projects (2)
  const project1 = await prisma.project.create({
    data: {
      name: 'Acme Website Redesign',
      clientId: clients[0].id,
      budget: 50000,
      currency: 'USD',
      status: ProjectStatus.ACTIVE,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Initech Mobile App',
      clientId: clients[3].id,
      budget: 120000,
      currency: 'USD',
      status: ProjectStatus.ACTIVE,
    },
  });
  console.log('Created Projects');

  // 4. Create Invoices (20)
  const now = new Date();
  
  for (let i = 1; i <= 20; i++) {
    const client = clients[i % 5];
    const status = i <= 5 ? InvoiceStatus.DRAFT : 
                   i <= 10 ? InvoiceStatus.SENT : 
                   i <= 18 ? InvoiceStatus.PAID : InvoiceStatus.OVERDUE;
    
    const amount = 1000 + (i * 500);
    const isPaid = status === InvoiceStatus.PAID;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${2024}-${i.toString().padStart(4, '0')}`,
        clientId: client.id,
        lineItems: [
          { description: 'Consulting Services', quantity: 1, rate: amount, amount: amount }
        ],
        subtotal: amount,
        tax: 0,
        total: amount,
        currency: client.currency,
        status: status,
        dueDate: addDays(now, i % 2 === 0 ? 15 : -5), // some overdue, some future
        paidAt: isPaid ? subDays(now, i) : null,
      },
    });

    if (isPaid) {
      await prisma.settlementRecord.create({
        data: {
          invoiceId: invoice.id,
          invoicedUSD: amount,
          receivedUSD: amount - 25, // Assuming wire fee
          realizedINR: (amount - 25) * 83.5, // Fake exchange rate
          exchangeRate: 83.5,
          platformFee: 25,
          status: SettlementStatus.SETTLED,
        }
      });
    }
  }
  console.log('Created 20 Invoices (and Settlement Records)');

  // 5. Create Expenses (10)
  const expenseCategories = ['Software', 'Travel', 'Marketing', 'Contractors', 'Office'];
  
  for (let i = 1; i <= 10; i++) {
    await prisma.expense.create({
      data: {
        vendor: `Vendor ${i}`,
        category: expenseCategories[i % 5],
        amount: 50 + (i * 20),
        currency: 'USD',
        date: subDays(now, i * 2),
        accountId: bankAccount.id,
        projectId: i % 3 === 0 ? project1.id : null,
        aiCategorized: true,
      }
    });
  }
  console.log('Created 10 Expenses');
  
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
