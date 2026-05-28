import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma';
import { QUEUES } from '../lib/queue-service';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const recurringWorker = new Worker(QUEUES.RECURRING_WORKFLOWS, async (job: Job) => {
  console.log(`Processing recurring job ${job.id} of type ${job.name}`);
  
  const { workflowId, type } = job.data;
  
  if (type === 'INVOICE') {
    // Look up workflow
    const workflow = await prisma.recurringWorkflow.findUnique({
      where: { id: workflowId }
    });
    
    if (!workflow || !workflow.isActive) return;
    
    // In a real scenario, this would create an invoice from the template
    console.log(`Generating recurring invoice for workflow ${workflow.id}`);
    
    // Log to audit
    await prisma.auditLog.create({
      data: {
        entityType: 'RecurringWorkflow',
        entityId: workflowId,
        action: 'EXECUTED_RECURRING_INVOICE',
      }
    });
    
  } else if (type === 'REMINDER') {
    const { invoiceId, email } = job.data;
    
    await transporter.sendMail({
      from: '"Invoxa Billing" <billing@invoxa.com>',
      to: email,
      subject: 'Payment Reminder: Invoice Due Soon',
      text: `This is a reminder that your invoice ${invoiceId} is due in 3 days.`,
    });
    
    console.log(`Sent reminder email to ${email}`);
  }
  
  return { success: true };
}, { connection: connection as any });

recurringWorker.on('completed', job => {
  console.log(`${job.id} has completed!`);
});

recurringWorker.on('failed', (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
});
