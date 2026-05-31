import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  senderName: { fontSize: 24, fontWeight: 'bold', color: '#4C8BF5', width: '60%' },
  metaTable: { width: '35%' },
  metaRow: { flexDirection: 'row', borderBottom: '1pt solid #999', borderRight: '1pt solid #999', borderLeft: '1pt solid #999' },
  metaRowTop: { borderTop: '1pt solid #999' },
  metaLabel: { width: '40%', padding: 4, color: '#333' },
  metaValue: { width: '60%', padding: 4, fontWeight: 'bold', borderLeft: '1pt solid #999', textAlign: 'right' },
  metaValueBlue: { color: '#4C8BF5' },
  billToContainer: { marginBottom: 30 },
  billToTitle: { fontSize: 10, fontWeight: 'bold', color: '#1a365d', borderBottom: '1pt solid #ccc', paddingBottom: 2, marginBottom: 4, width: 200 },
  table: { width: '100%', border: '1pt solid #4C8BF5', borderBottom: 'none' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#4C8BF5', color: '#fff' },
  colDesc: { flex: 3, padding: 5, borderRight: '1pt solid #4C8BF5', fontWeight: 'bold' },
  colHours: { flex: 1, padding: 5, borderRight: '1pt solid #4C8BF5', textAlign: 'center', fontWeight: 'bold' },
  colCost: { flex: 1, padding: 5, borderRight: '1pt solid #4C8BF5', textAlign: 'center', fontWeight: 'bold' },
  colAmount: { flex: 1, padding: 5, textAlign: 'right', fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderBottom: '1pt solid #4C8BF5' },
  tableRowSection: { flexDirection: 'row', borderBottom: '1pt solid #4C8BF5', backgroundColor: '#f0f5ff' },
  cellDesc: { flex: 3, padding: 5, borderRight: '1pt solid #4C8BF5' },
  cellHours: { flex: 1, padding: 5, borderRight: '1pt solid #4C8BF5', textAlign: 'center' },
  cellCost: { flex: 1, padding: 5, borderRight: '1pt solid #4C8BF5', textAlign: 'center' },
  cellAmount: { flex: 1, padding: 5, textAlign: 'right' },
  cellSection: { flex: 1, padding: 5, fontWeight: 'bold' },
  totalRow: { flexDirection: 'row', borderBottom: '1pt solid #4C8BF5' },
  totalLabel: { flex: 3, padding: 5, borderRight: '1pt solid #4C8BF5', textAlign: 'right', fontWeight: 'bold' },
  totalHours: { flex: 1, padding: 5, borderRight: '1pt solid #4C8BF5', textAlign: 'center', fontWeight: 'bold' },
  totalAmountEmpty: { flex: 1, padding: 5, borderRight: '1pt solid #4C8BF5' },
  totalAmount: { flex: 1, padding: 5, textAlign: 'right', fontWeight: 'bold' },
  paymentContainer: { marginTop: 40 },
  paymentTitle: { fontWeight: 'bold', fontSize: 10, marginBottom: 10 },
  paymentRow: { flexDirection: 'row', marginBottom: 3 },
  paymentLabel: { width: 120, fontWeight: 'bold' },
  paymentValue: { flex: 1 }
});

export const InvoicePDFDocument = ({ data, clientName }: { data: any, clientName: string }) => {
  const lineItems = Array.isArray(data.lineItems) ? data.lineItems : [];
  const totalHours = lineItems.reduce((sum: number, item: any) => sum + (item.isSection ? 0 : (item.hours || 0)), 0);
  const totalAmount = lineItems.reduce((sum: number, item: any) => {
    if (item.isSection) return sum;
    return sum + ((item.hours || 0) * (item.cost || 0));
  }, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        <View style={styles.headerContainer}>
          <Text style={styles.senderName}>{data.senderName || 'Sender Name'}</Text>
          <View style={styles.metaTable}>
            <View style={[styles.metaRow, styles.metaRowTop]}>
              <Text style={styles.metaLabel}>Date</Text>
              <Text style={styles.metaValue}>{data.date ? new Date(data.date).toLocaleDateString('en-US') : '[date]'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice #</Text>
              <Text style={[styles.metaValue, styles.metaValueBlue]}>{data.invoiceNumber || '[number]'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Due Date</Text>
              <Text style={styles.metaValue}>{data.dueDate ? new Date(data.dueDate).toLocaleDateString('en-US') : '[due date]'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.billToContainer}>
          <Text style={styles.billToTitle}>BILL TO</Text>
          <Text>Company: {data.billToCompany || clientName || '[client company name]'}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colHours}>Hours</Text>
            <Text style={styles.colCost}>Cost</Text>
            <Text style={styles.colAmount}>Amount</Text>
          </View>
          
          {lineItems.map((item: any, i: number) => {
            if (item.isSection) {
              return (
                <View key={i} style={styles.tableRowSection}>
                  <Text style={styles.cellSection}>{item.description || 'Section Header Label'}</Text>
                </View>
              );
            }
            return (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.cellDesc}>{item.description || 'Item description'}</Text>
                <Text style={styles.cellHours}>{item.hours || ''}</Text>
                <Text style={styles.cellCost}>{item.cost || ''}</Text>
                <Text style={styles.cellAmount}>
                  ${((item.hours || 0) * (item.cost || 0)).toFixed(2)}
                </Text>
              </View>
            );
          })}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalHours}>{totalHours}</Text>
            <Text style={styles.totalAmountEmpty}></Text>
            <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.paymentContainer}>
          <Text style={styles.paymentTitle}>INVOICE ADDRESS:</Text>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Method</Text>
            <View style={styles.paymentValue}>
              <Text>{data.paymentMethod || '[method]'}</Text>
              {data.bankAccountName ? <Text>Bank Account Name: {data.bankAccountName}</Text> : null}
              {data.bankName ? <Text>Bank Name: {data.bankName}</Text> : null}
              {data.accountNumber ? <Text>Account number: {data.accountNumber}</Text> : null}
              {data.ifscCode ? <Text>IFSC code: {data.ifscCode}</Text> : null}
              {data.swiftCode ? <Text>SWIFT code: {data.swiftCode}</Text> : null}
            </View>
          </View>
        </View>
        
      </Page>
    </Document>
  );
};
