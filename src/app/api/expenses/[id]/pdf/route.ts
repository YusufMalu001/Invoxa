export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  title: { fontSize: 20, fontWeight: 'bold' },
  companyName: { fontSize: 14, fontWeight: 'bold' },
  companyAddress: { color: '#666' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  label: { fontWeight: 'bold', width: 60 },
  value: { flex: 1 },
  detailsLeft: { flex: 1 },
  detailsRight: { flex: 1, textAlign: 'right' },
  sectionTitle: { fontSize: 10, fontWeight: 'bold', borderBottom: '1pt solid #000', paddingBottom: 4, marginBottom: 10, marginTop: 20 },
  tableHeader: { flexDirection: 'row', borderBottom: '1pt solid #000', paddingBottom: 4, marginBottom: 4 },
  tableRow: { flexDirection: 'row', borderBottom: '1pt solid #eee', paddingVertical: 4 },
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: 'center' },
  colRate: { flex: 1, textAlign: 'center' },
  colAmt: { flex: 1, textAlign: 'right' },
  tableRowSection: { flexDirection: 'row', borderBottom: '1pt solid #eee', paddingVertical: 4, backgroundColor: '#f9f9f9' },
  sectionText: { fontWeight: 'bold', color: '#111' },
  totals: { marginTop: 10, alignSelf: 'flex-end', width: 200 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  totalRowBold: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderTop: '1pt solid #000', marginTop: 4, fontWeight: 'bold' },
  paymentSection: { marginTop: 30, borderTop: '1pt solid #000', paddingTop: 10 },
  paymentRow: { flexDirection: 'row', marginBottom: 4 },
  paymentLabel: { fontWeight: 'bold', width: 100 },
  paymentValue: { flex: 1 }
});

const ExpensePDF = ({ expense }: { expense: any }) => {
  const lineItems = Array.isArray(expense.lineItems) ? expense.lineItems : [];
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>EXPENSE RECEIPT</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.companyName}>Invoxa</Text>
            <Text style={styles.companyAddress}>123 Business St.</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailsLeft}>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}><Text style={styles.label}>Vendor:</Text><Text style={styles.value}>{expense.vendor}</Text></View>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}><Text style={styles.label}>Category:</Text><Text style={styles.value}>{expense.category}</Text></View>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}><Text style={styles.label}>Account:</Text><Text style={styles.value}>{expense.account?.name || 'N/A'}</Text></View>
          </View>
          <View style={styles.detailsRight}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 }}><Text style={{ fontWeight: 'bold', marginRight: 4 }}>Date:</Text><Text>{new Date(expense.date).toLocaleDateString('en-US')}</Text></View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 }}><Text style={{ fontWeight: 'bold', marginRight: 4 }}>Expense #:</Text><Text>{expense.expenseNumber || 'N/A'}</Text></View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>DETAILS</Text>
        
        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>Description</Text>
          <Text style={styles.colQty}>Qty</Text>
          <Text style={styles.colRate}>Rate</Text>
          <Text style={styles.colAmt}>Amount</Text>
        </View>
        
        {lineItems.map((item: any, i: number) => {
          if (item.isSection) {
            return (
              <View key={i} style={styles.tableRowSection}>
                <Text style={styles.sectionText}>{item.description}</Text>
              </View>
            )
          }
          return (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.qty}</Text>
              <Text style={styles.colRate}>{item.rate}</Text>
              <Text style={styles.colAmt}>${Number(item.amount || 0).toFixed(2)}</Text>
            </View>
          )
        })}

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>${Number(expense.subtotal || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax ({expense.taxRate || 0}%)</Text>
            <Text>${(Number(expense.total || 0) - Number(expense.subtotal || 0)).toFixed(2)}</Text>
          </View>
          <View style={styles.totalRowBold}>
            <Text>TOTAL</Text>
            <Text>${Number(expense.total || expense.amount || 0).toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.paymentSection}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>PAYMENT</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Method:</Text>
            <Text style={styles.paymentValue}>{expense.paymentMethod || 'N/A'}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Paid From:</Text>
            <Text style={styles.paymentValue}>{expense.account?.name || 'N/A'}</Text>
          </View>
          <View style={{ ...styles.paymentRow, marginTop: 4 }}>
            <Text style={styles.paymentLabel}>Notes:</Text>
            <Text style={styles.paymentValue}>{expense.notes || 'None'}</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        account: true,
        project: true
      }
    });

    if (!expense) {
      return new NextResponse('Expense not found', { status: 404 });
    }

    const buffer = await renderToBuffer(<ExpensePDF expense={expense} />);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="expense-${expense.expenseNumber || id}.pdf"`
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new NextResponse('Internal Server Error generating PDF', { status: 500 });
  }
}
