"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Decimal from "decimal.js";
import { toast } from "sonner";
import { Plus, Trash2, FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ExpensePDFDocument } from "@/components/ExpensePDFDocument";

const PDFViewer = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-neutral-500"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading PDF engine...</div>
});

const expenseSchema = z.object({
  vendor: z.string().min(1, "Vendor name is required"),
  expenseNumber: z.string().optional(),
  date: z.string(),
  category: z.string().min(1, "Category is required"),
  currency: z.string().min(1, "Currency is required"),
  accountId: z.string().optional(),
  projectId: z.string().optional(),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
  lineItems: z.array(z.object({
    description: z.string().min(1, "Required"),
    hours: z.number().optional(),
    cost: z.number().optional(),
    amount: z.number().optional(),
    isSection: z.boolean().default(false)
  })).min(1, "At least one item required"),
  taxRate: z.number().optional().default(0),
  paymentMethod: z.string().optional(),
  paidFromAccountId: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export function ExpenseForm({ initialData, isEdit = false }: { initialData?: any, isEdit?: boolean }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema as any),
    defaultValues: initialData || {
      vendor: "",
      expenseNumber: `EXP-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString().split('T')[0],
      category: "",
      currency: "USD",
      isRecurring: false,
      taxRate: 0,
      lineItems: [{ description: "", hours: 1, cost: 0, amount: 0, isSection: false }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lineItems" });

  const watchLineItems = watch("lineItems") || [];
  const taxRate = watch("taxRate") || 0;

  const subtotal = watchLineItems.reduce((sum, item) => {
    if (item.isSection) return sum;
    return new Decimal(sum).plus(new Decimal(item.hours || 0).times(item.cost || 0)).toNumber();
  }, 0);

  const total = new Decimal(subtotal).times(1 + (taxRate / 100)).toNumber();

  useEffect(() => {
    fetch('/api/accounts').then(res => res.json()).then(data => { if(Array.isArray(data)) setAccounts(data); }).catch(()=>{});
    fetch('/api/projects').then(res => res.json()).then(data => { if(Array.isArray(data)) setProjects(data); }).catch(()=>{});
  }, []);

  const onSubmit = async (data: ExpenseFormValues, status: 'SAVED' | 'DRAFT' = 'SAVED') => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        amount: total,
        subtotal,
        total,
        status,
      };

      const url = isEdit ? `/api/expenses/${initialData.id}` : '/api/expenses';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save expense");
      const saved = await res.json();
      
      if (status === 'DRAFT') {
        toast.success(isEdit ? "Draft updated" : "Draft saved");
        router.push('/expenses');
      } else {
        toast.success(isEdit ? "Expense updated" : "Expense saved successfully");
        router.push(`/expenses/${saved.id}`);
      }
    } catch (error) {
      toast.error("Failed to save expense");
    } finally {
      setIsSaving(false);
    }
  };

  const previewData = { ...watch(), subtotal, total, amount: total, account: accounts.find(a => a.id === watch('accountId')) };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{isEdit ? 'Edit Expense' : 'Create Expense'}</h2>
          <p className="text-neutral-400">Record a new outgoing payment.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            type="button"
            onClick={handleSubmit((d) => onSubmit(d, 'DRAFT'))}
            disabled={isSaving}
            className="px-4 py-2 border border-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button 
            type="button"
            onClick={handleSubmit((d) => onSubmit(d, 'SAVED'))}
            disabled={isSaving}
            className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSaving ? "Saving..." : (isEdit ? "Update Expense" : "Save Expense")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-6 overflow-hidden">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Vendor Name</label>
              <input type="text" {...register("vendor")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
              {errors.vendor && <p className="text-rose-500 text-xs mt-1">{errors.vendor.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Expense #</label>
              <input type="text" {...register("expenseNumber")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Date</label>
              <input type="date" {...register("date")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Category</label>
              <select {...register("category")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
                <option value="">Select Category...</option>
                {['Software', 'Travel', 'Marketing', 'Office', 'Contractors', 'Utilities', 'Subscriptions', 'Reimbursements', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-rose-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Currency</label>
              <select {...register("currency")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
                {['USD', 'INR', 'GBP', 'EUR', 'CAD', 'CHF'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Account</label>
              <select {...register("accountId")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
                <option value="">Select Account...</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Project (Optional)</label>
              <select {...register("projectId")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
                <option value="">Select Project...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex items-center space-x-2 mt-6">
              <input type="checkbox" id="isRecurring" {...register("isRecurring")} className="w-4 h-4 rounded border-neutral-800 bg-neutral-950 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="isRecurring" className="text-sm font-medium text-neutral-300">Is Recurring</label>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-300 mb-1">Notes</label>
              <textarea {...register("notes")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none h-20 resize-none"></textarea>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Line Items</h3>
              <div className="flex space-x-3">
                <button type="button" onClick={() => append({ description: "", hours: 0, cost: 0, amount: 0, isSection: true })} className="text-indigo-400 text-sm flex items-center hover:text-indigo-300">
                  <Plus className="w-4 h-4 mr-1" /> Add Section
                </button>
                <button type="button" onClick={() => append({ description: "", hours: 1, cost: 0, amount: 0, isSection: false })} className="text-indigo-400 text-sm flex items-center hover:text-indigo-300">
                  <Plus className="w-4 h-4 mr-1" /> Add Row
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 80px 100px 110px 40px', gap: '8px', alignItems: 'center' }} className="text-sm font-medium text-neutral-400 px-1">
                <span>Description</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Rate</span>
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
                          type="number" step="0.1"
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
                          type="number" step="0.01"
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
                      <div className="col-span-3"></div>
                    )}
                    <button type="button" onClick={() => remove(index)} className="p-2 text-neutral-500 hover:text-rose-400 transition-colors flex justify-center min-w-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              {errors.lineItems?.root && <p className="text-rose-500 text-xs mt-1">{errors.lineItems.root.message}</p>}
            </div>

            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between font-medium text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Tax %</span>
                  <input type="number" {...register("taxRate", { valueAsNumber: true })} className="w-20 bg-neutral-950 border border-neutral-800 rounded-md py-1 px-2 text-right focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="flex justify-between font-medium text-lg border-t border-neutral-800 pt-3">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800 space-y-4">
            <h3 className="text-lg font-medium border-b border-neutral-800 pb-2">Payment Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Payment Method</label>
                <select {...register("paymentMethod")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
                  <option value="">Select Method...</option>
                  {['Bank Transfer', 'Cash', 'Credit Card', 'Crypto', 'UPI'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Paid From</label>
                <select {...register("paidFromAccountId")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
                  <option value="">Select Account...</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
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
              <ExpensePDFDocument expense={previewData} />
            </PDFViewer>
          </div>
        </div>
      </div>
    </div>
  );
}
