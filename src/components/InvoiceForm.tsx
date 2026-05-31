"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Decimal from "decimal.js";
import { toast } from "sonner";
import { Plus, Trash2, FileText, Download, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { InvoicePDFDocument } from "@/components/InvoicePDFDocument";

const PDFViewer = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-neutral-500"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading PDF engine...</div>
});

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  currency: z.string().default("USD"),
  paymentTerms: z.string().optional(),
  senderName: z.string().default("Abbas Ali Lokhandwala"),
  date: z.string(),
  invoiceNumber: z.string(),
  dueDate: z.string().optional(),
  billToCompany: z.string().optional(),
  paymentMethod: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  swiftCode: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string().min(1, "Required"),
    hours: z.number().optional(),
    cost: z.number().optional(),
    amount: z.number().optional(),
    isSection: z.boolean().default(false)
  })).min(1, "At least one item required"),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export function InvoiceForm({ initialData, isEdit = false }: { initialData?: any, isEdit?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialClientId = searchParams.get('clientId') || '';

  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { register, control, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema as any),
    defaultValues: initialData || {
      clientId: initialClientId,
      currency: "USD",
      senderName: "Abbas Ali Lokhandwala",
      date: new Date().toISOString().split('T')[0],
      invoiceNumber: "#2604", 
      lineItems: [{ description: "", hours: 0, cost: 0, amount: 0, isSection: false }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems"
  });

  const watchLineItems = watch("lineItems");
  const watchClientId = watch("clientId");
  
  useEffect(() => {
    const client = clients.find(c => c.id === watchClientId);
    if (client) {
      if (client.paymentMethod) setValue("paymentMethod", client.paymentMethod);
      if (client.bankAccountName) setValue("bankAccountName", client.bankAccountName);
      if (client.bankName) setValue("bankName", client.bankName);
      if (client.accountNumber) setValue("accountNumber", client.accountNumber);
      if (client.ifscCode) setValue("ifscCode", client.ifscCode);
      if (client.swiftCode) setValue("swiftCode", client.swiftCode);
    }
  }, [watchClientId, clients, setValue]);

  const subtotal = watchLineItems.reduce((sum, item) => {
    if (item.isSection) return sum;
    return new Decimal(sum).plus(new Decimal(item.hours || 0).times(item.cost || 0)).toNumber();
  }, 0);

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setClients(data);
      })
      .catch(() => toast.error("Failed to load clients"));
  }, []);

  useEffect(() => {
    if (initialClientId) {
      setValue('clientId', initialClientId);
    }
  }, [initialClientId, setValue]);

  useEffect(() => {
    const interval = setInterval(() => {
      const data = getValues();
      if (data.clientId) {
        toast.info("Autosaving draft...", { duration: 1000 });
        setLastSaved(new Date());
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [getValues]);

  const onSubmit = async (data: InvoiceFormValues, status: 'SENT' | 'DRAFT' = 'SENT') => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        subtotal,
        total: subtotal,
        status,
      };

      const url = isEdit ? `/api/invoices/${initialData.id}` : '/api/invoices';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save invoice");
      const saved = await res.json();
      
      if (status === 'DRAFT') {
        toast.success(isEdit ? "Draft updated" : "Draft saved");
        router.push('/invoices');
      } else {
        toast.success(isEdit ? "Invoice updated" : "Invoice created successfully");
        router.push(`/invoices/${saved.id}`);
      }
    } catch (error) {
      toast.error("Failed to save invoice");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create Invoice</h2>
          <p className="text-neutral-400">
            {lastSaved ? `Draft saved at ${lastSaved.toLocaleTimeString()}` : "Generate a new AI-assisted invoice."}
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            type="button"
            onClick={handleSubmit((d) => onSubmit(d, 'DRAFT'))}
            disabled={isSaving}
            className="px-4 py-2 border border-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {isEdit ? 'Save Draft' : 'Save Draft'}
          </button>
          <button 
            type="button"
            onClick={handleSubmit((d) => onSubmit(d, 'SENT'))}
            disabled={isSaving}
            className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSaving ? "Saving..." : (isEdit ? "Update Invoice" : "Create Invoice")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-6 overflow-hidden">
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b border-neutral-800 pb-2">Invoice Meta</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">From</label>
                <input type="text" {...register("senderName")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Date</label>
                <input type="date" {...register("date")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Invoice #</label>
                <input type="text" {...register("invoiceNumber")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Due Date</label>
                <input type="date" {...register("dueDate")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Bill To (Client)</label>
                <select {...register("clientId")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
                  <option value="">Select a client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.clientId && <p className="text-rose-500 text-xs mt-1">{errors.clientId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Company Name</label>
                <input type="text" {...register("billToCompany")} placeholder="Client Company" className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Line Items</h3>
              <div className="flex space-x-3">
                <button 
                  type="button" 
                  onClick={() => append({ description: "", hours: 0, cost: 0, amount: 0, isSection: true })}
                  className="text-indigo-400 text-sm flex items-center hover:text-indigo-300"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Section
                </button>
                <button 
                  type="button" 
                  onClick={() => append({ description: "", hours: 0, cost: 0, amount: 0, isSection: false })}
                  className="text-indigo-400 text-sm flex items-center hover:text-indigo-300"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Row
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 80px 100px 110px 40px', gap: '8px', alignItems: 'center' }} className="text-sm font-medium text-neutral-400 px-1">
                <span>Description</span>
                <span className="text-right">Hours</span>
                <span className="text-right">Cost</span>
                <span className="text-right">Amount</span>
                <span></span>
              </div>

              {fields.map((field, index) => {
                const isSection = watchLineItems[index]?.isSection;
                return (
                  <div key={field.id} style={{ display: 'grid', gridTemplateColumns: '3fr 80px 100px 110px 40px', gap: '8px', alignItems: 'center' }}>
                    <div style={{ minWidth: 0 }}>
                      <input 
                        {...register(`lineItems.${index}.description` as const)} 
                        placeholder={isSection ? "Section Header Label" : "Item description"} 
                        className={`w-full min-w-0 bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none ${isSection ? 'font-bold text-indigo-400' : ''}`}
                      />
                      {errors.lineItems?.[index]?.description && <p className="text-rose-500 text-xs mt-1">{errors.lineItems[index]?.description?.message}</p>}
                    </div>
                    {!isSection ? (
                      <>
                        <input 
                          type="number" 
                          step="0.1"
                          {...register(`lineItems.${index}.hours` as const, { valueAsNumber: true })} 
                          placeholder="0" 
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm text-right focus:ring-1 focus:ring-indigo-500 outline-none min-w-0"
                          onChange={(e) => {
                            const hours = parseFloat(e.target.value) || 0;
                            const cost = watchLineItems[index]?.cost || 0;
                            setValue(`lineItems.${index}.amount`, new Decimal(hours).times(cost).toNumber());
                          }}
                        />
                        <input 
                          type="number" 
                          step="0.01"
                          {...register(`lineItems.${index}.cost` as const, { valueAsNumber: true })} 
                          placeholder="0.00" 
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm text-right focus:ring-1 focus:ring-indigo-500 outline-none min-w-0"
                          onChange={(e) => {
                            const cost = parseFloat(e.target.value) || 0;
                            const hours = watchLineItems[index]?.hours || 0;
                            setValue(`lineItems.${index}.amount`, new Decimal(hours).times(cost).toNumber());
                          }}
                        />
                        <div className="py-2 px-3 bg-neutral-900 border border-neutral-800 rounded-md text-sm text-right text-neutral-400 truncate min-w-0">
                          ${watchLineItems[index]?.amount?.toFixed(2) || "0.00"}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-span-3"></div>
                      </>
                    )}
                    <button 
                      type="button" 
                      onClick={() => remove(index)}
                      className="p-2 text-neutral-500 hover:text-rose-400 transition-colors flex justify-center min-w-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm text-neutral-400">
                  <span>Total Hours</span>
                  <span>{watchLineItems.reduce((sum, item) => sum + (item.isSection ? 0 : (item.hours || 0)), 0)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg border-t border-neutral-800 pt-3">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800 space-y-4">
            <h3 className="text-lg font-medium border-b border-neutral-800 pb-2">Invoice Address & Payment Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Payment Method</label>
                <select {...register("paymentMethod")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
                  <option value="">Select Method...</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Crypto">Crypto</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Wise">Wise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Bank Account Name</label>
                <input type="text" {...register("bankAccountName")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Bank Name</label>
                <input type="text" {...register("bankName")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Account Number</label>
                <input type="text" {...register("accountNumber")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">IFSC Code</label>
                <input type="text" {...register("ifscCode")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">SWIFT Code</label>
                <input type="text" {...register("swiftCode")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
          </div>

        </div>

        <div className="hidden lg:flex rounded-xl border border-neutral-800 bg-neutral-900/50 flex-col overflow-hidden h-[900px]">
          <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
            <h3 className="text-sm font-medium flex items-center text-neutral-300">
              <FileText className="w-4 h-4 mr-2" /> Live PDF Preview
            </h3>
          </div>
          <div className="flex-1 w-full h-full bg-neutral-900">
            <PDFViewer width="100%" height="100%" className="border-0">
              <InvoicePDFDocument 
                data={watch()} 
                clientName={clients.find(c => c.id === watchClientId)?.name || ''} 
              />
            </PDFViewer>
          </div>
        </div>
      </div>
    </div>
  );
}

