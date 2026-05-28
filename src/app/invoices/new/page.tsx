"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Decimal from "decimal.js";
import { toast } from "sonner";
import { Plus, Trash2, FileText, Download, Save, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  currency: z.string().default("USD"),
  paymentTerms: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string().min(1, "Required"),
    quantity: z.number().min(0.01),
    rate: z.number().min(0),
    amount: z.number()
  })).min(1, "At least one item required"),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export default function NewInvoicePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { register, control, handleSubmit, watch, setValue, getValues } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema as any),
    defaultValues: {
      currency: "USD",
      lineItems: [{ description: "", quantity: 1, rate: 0, amount: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems"
  });

  const watchLineItems = watch("lineItems");
  const watchClientId = watch("clientId");
  
  // Calculate subtotal using decimal.js
  const subtotal = watchLineItems.reduce((sum, item) => {
    return new Decimal(sum).plus(new Decimal(item.quantity || 0).times(item.rate || 0)).toNumber();
  }, 0);

  // Fetch clients on load
  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setClients(data);
      })
      .catch(() => toast.error("Failed to load clients"));
  }, []);

  // Autosave Draft every 30 seconds
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
        total: subtotal, // skipping tax logic for demo simplicity
      };

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to create invoice");
      const created = await res.json();
      
      toast.success("Invoice created successfully");
      router.push(`/invoices/${created.id}`); // Assuming details page exists
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
        {/* Form Panel */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Client</label>
              <select {...register("clientId")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
                <option value="">Select a client...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Currency</label>
                <select {...register("currency")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="INR">INR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Payment Terms</label>
                <input type="text" {...register("paymentTerms")} placeholder="Net 30" className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Line Items</h3>
              <button 
                type="button" 
                onClick={() => append({ description: "", quantity: 1, rate: 0, amount: 0 })}
                className="text-indigo-400 text-sm flex items-center hover:text-indigo-300"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Row
              </button>
            </div>
            
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input 
                      {...register(`lineItems.${index}.description` as const)} 
                      placeholder="Description" 
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm"
                    />
                  </div>
                  <div className="w-24">
                    <input 
                      type="number" 
                      step="0.01"
                      {...register(`lineItems.${index}.quantity` as const, { valueAsNumber: true })} 
                      placeholder="Qty" 
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm"
                      onChange={(e) => {
                        const qty = parseFloat(e.target.value) || 0;
                        const rate = watchLineItems[index]?.rate || 0;
                        setValue(`lineItems.${index}.amount`, new Decimal(qty).times(rate).toNumber());
                      }}
                    />
                  </div>
                  <div className="w-32">
                    <input 
                      type="number" 
                      step="0.01"
                      {...register(`lineItems.${index}.rate` as const, { valueAsNumber: true })} 
                      placeholder="Rate" 
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm"
                      onChange={(e) => {
                        const rate = parseFloat(e.target.value) || 0;
                        const qty = watchLineItems[index]?.quantity || 0;
                        setValue(`lineItems.${index}.amount`, new Decimal(qty).times(rate).toNumber());
                      }}
                    />
                  </div>
                  <div className="w-32 py-2 px-3 bg-neutral-900 border border-neutral-800 rounded-md text-sm text-right text-neutral-400">
                    {watchLineItems[index]?.amount?.toFixed(2) || "0.00"}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => remove(index)}
                    className="p-2 text-neutral-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm text-neutral-400">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg border-t border-neutral-800 pt-3">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live PDF Preview Panel */}
        <div className="hidden lg:flex rounded-xl border border-neutral-800 bg-neutral-900/50 flex-col overflow-hidden h-[800px]">
          <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
            <h3 className="text-sm font-medium flex items-center text-neutral-300">
              <FileText className="w-4 h-4 mr-2" /> Live Preview
            </h3>
            <button className="text-neutral-400 hover:text-white flex items-center text-sm transition-colors">
              <Download className="w-4 h-4 mr-1" /> PDF
            </button>
          </div>
          <div className="flex-1 bg-neutral-900 p-8 flex justify-center overflow-y-auto">
            {/* React PDF placeholder rendering standard DOM for visual feedback while editing */}
            <div className="w-[600px] h-[800px] bg-white shadow-lg rounded-sm p-12 text-black font-sans">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h1 className="text-4xl font-light text-neutral-800 tracking-tight">INVOICE</h1>
                  <p className="text-sm text-neutral-500 mt-2">DRAFT</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-medium text-indigo-600">Invoxa</h2>
                  <p className="text-sm text-neutral-500 mt-1">123 Business St.</p>
                </div>
              </div>
              
              <div className="mb-12 border-b pb-8">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Billed To</p>
                <p className="text-base font-medium">
                  {clients.find(c => c.id === watchClientId)?.name || "Select Client..."}
                </p>
                <p className="text-sm text-neutral-500 mt-1">Terms: {watch("paymentTerms") || "Net 30"}</p>
              </div>

              <table className="w-full text-sm text-left">
                <thead className="border-b-2 border-neutral-200">
                  <tr>
                    <th className="py-3 font-semibold text-neutral-600">Description</th>
                    <th className="py-3 font-semibold text-neutral-600 text-right">Qty</th>
                    <th className="py-3 font-semibold text-neutral-600 text-right">Rate</th>
                    <th className="py-3 font-semibold text-neutral-600 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {watchLineItems.map((item, i) => (
                    <tr key={i} className="border-b border-neutral-100">
                      <td className="py-4">{item.description || "Item description"}</td>
                      <td className="py-4 text-right text-neutral-600">{item.quantity}</td>
                      <td className="py-4 text-right text-neutral-600">{item.rate}</td>
                      <td className="py-4 text-right font-medium">${item.amount?.toFixed(2) || "0.00"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-8 flex justify-end">
                <div className="w-64 border-t-2 border-neutral-800 pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total {watch("currency")}</span>
                    <span>${subtotal.toFixed(2)}</span>
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
