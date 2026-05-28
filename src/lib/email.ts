import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendInvoiceReminder(to: string, invoiceName: string, dueDate: string) {
  try {
    await transporter.sendMail({
      from: '"Invoxa Billing" <billing@invoxa.com>',
      to,
      subject: `Payment Reminder: Invoice ${invoiceName} Due Soon`,
      text: `This is a reminder that your invoice ${invoiceName} is due on ${dueDate}. Please arrange for payment to avoid late fees.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Invoice Reminder</h2>
          <p>This is a reminder that your invoice <strong>${invoiceName}</strong> is due on <strong>${dueDate}</strong>.</p>
          <p>Please arrange for payment to avoid late fees.</p>
          <br/>
          <p>Thank you,<br/>Invoxa Billing Team</p>
        </div>
      `,
    });
    console.log(`Reminder email sent to ${to} for invoice ${invoiceName}`);
  } catch (error) {
    console.error('Failed to send email reminder:', error);
  }
}
