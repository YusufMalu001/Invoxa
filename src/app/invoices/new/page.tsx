"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Decimal from "decimal.js";
import { toast } from "sonner";
import { Plus, Trash2, FileText, Download, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

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

function InvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialClientId = searchParams.get('clientId') || '';

  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { register, control, handleSubmit, watch, setValue, getValues } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema as any),
    defaultValues: {
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

  const onSubmit = async (data: InvoiceFormValues) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        subtotal,
        total: subtotal,
      };

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to create invoice");
      const created = await res.json();
      
      toast.success("Invoice created successfully");
      router.push(`/invoices/${created.id}`);
    } catch (error) {
      toast.error("Failed to create invoice");
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
          <button className="px-4 py-2 border border-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors">
            Save Draft
          </button>
          <button 
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSaving ? "Saving..." : "Create & Send"}
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
                        className={`w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none ${isSection ? 'font-bold text-indigo-400' : ''}`}
                      />
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
              <FileText className="w-4 h-4 mr-2" /> Live Preview
            </h3>
            <button className="text-neutral-400 hover:text-white flex items-center text-sm transition-colors">
              <Download className="w-4 h-4 mr-1" /> PDF
            </button>
          </div>
          <div className="flex-1 bg-neutral-900 p-8 flex justify-center overflow-y-auto">
            <div className="w-[650px] bg-white shadow-lg p-10 text-black font-sans shrink-0">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-[#4C8BF5] mb-1">{watch("senderName") || "Sender Name"}</h1>
                </div>
                <div className="text-right text-sm">
                  <table className="ml-auto">
                    <tbody>
                      <tr>
                        <td className="pr-4 text-left py-1 text-gray-700">Date</td>
                        <td className="border border-gray-400 px-4 py-1 font-medium bg-white">{watch("date") ? new Date(watch("date")).toLocaleDateString('en-US') : "[date]"}</td>
                      </tr>
                      <tr>
                        <td className="pr-4 text-left py-1 text-gray-700">Invoice #</td>
                        <td className="border border-gray-400 px-4 py-1 font-medium bg-white text-[#4C8BF5]">{watch("invoiceNumber") || "[number]"}</td>
                      </tr>
                      <tr>
                        <td className="pr-4 text-left py-1 text-gray-700">Due Date</td>
                        <td className="border border-gray-400 px-4 py-1 font-medium bg-white">{watch("dueDate") ? new Date(watch("dueDate")!).toLocaleDateString('en-US') : "[due date]"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-sm font-bold text-[#1a365d] uppercase border-b border-gray-300 pb-1 mb-2 inline-block w-48">BILL TO</h2>
                <p className="text-sm text-gray-800">
                  Company: {watch("billToCompany") || (clients.find(c => c.id === watchClientId)?.name) || "[client company name]"}
                </p>
              </div>

              <table className="w-full text-sm text-left border-collapse border border-gray-400 mb-8">
                <thead>
                  <tr className="bg-[#4C8BF5] text-white border-b border-gray-400">
                    <th className="py-2 px-3 font-semibold border-r border-gray-400 text-center">Description</th>
                    <th className="py-2 px-3 font-semibold border-r border-gray-400 text-center w-24">Hours</th>
                    <th className="py-2 px-3 font-semibold text-center w-24">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {watchLineItems.map((item, i) => (
                    <tr key={i} className="border-b border-gray-400">
                      {item.isSection ? (
                        <>
                          <td className="py-2 px-3 font-bold text-gray-900 text-center border-r border-gray-400">{item.description || "Section Header Label"}</td>
                          <td className="border-r border-gray-400"></td>
                          <td></td>
                        </>
                      ) : (
                        <>
                          <td className="py-2 px-3 border-r border-gray-400 align-top whitespace-pre-wrap">{item.description || "Item description"}</td>
                          <td className="py-2 px-3 border-r border-gray-400 text-center align-top">{item.hours || ""}</td>
                          <td className="py-2 px-3 text-center align-top">{item.cost || ""}</td>
                        </>
                      )}
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-400">
                    <td className="py-2 px-3 font-bold text-right border-r border-gray-400">TOTAL</td>
                    <td className="py-2 px-3 font-bold text-center border-r border-gray-400">
                      {watchLineItems.reduce((sum, item) => sum + (item.isSection ? 0 : (item.hours || 0)), 0)}
                    </td>
                    <td className="py-2 px-3 font-bold text-center">
                      ${subtotal.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-12 text-sm">
                <h2 className="font-bold text-gray-900 mb-3">INVOICE ADDRESS:</h2>
                <div className="grid grid-cols-[150px_1fr] gap-x-4 gap-y-1">
                  <div className="font-bold text-gray-900">Payment Method</div>
                  <div className="text-gray-800">
                    <div>{watch("paymentMethod") || "[method]"}</div>
                    {watch("bankAccountName") && <div>Bank Account Name: {watch("bankAccountName")}</div>}
                    {watch("bankName") && <div>Bank Name: {watch("bankName")}</div>}
                    {watch("accountNumber") && <div>Account number: <span className="font-semibold">{watch("accountNumber")}</span></div>}
                    {watch("ifscCode") && <div>IFSC code: <span className="font-semibold">{watch("ifscCode")}</span></div>}
                    {watch("swiftCode") && <div>SWIFT code: <span className="font-semibold">{watch("swiftCode")}</span></div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}>
      <InvoiceForm />
    </Suspense>
  );
}
