"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Decimal from "decimal.js";
import { toast } from "sonner";
import { Plus, Trash2, FileText, Download, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

const expenseSchema = z.object({
  vendor: z.string().min(1, "Vendor is required"),
  date: z.string(),
  expenseNumber: z.string(),
  category: z.string().min(1, "Category is required"),
  accountId: z.string().optional(),
  projectId: z.string().optional(),
  currency: z.string().default("USD"),
  notes: z.string().optional(),
  receiptUrl: z.string().optional(),
  isRecurring: z.boolean().default(false),
  taxRate: z.number().default(0),
  paymentMethod: z.string().optional(),
  paidFromAccountId: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string().min(1, "Required"),
    qty: z.number().optional(),
    rate: z.number().optional(),
    amount: z.number().optional(),
    isSection: z.boolean().default(false)
  })).min(1, "At least one item required")
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function NewExpensePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { register, control, handleSubmit, watch, setValue, getValues } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema as any),
    defaultValues: {
      currency: "USD",
      date: new Date().toISOString().split('T')[0],
      expenseNumber: "EXP-001",
      category: "",
      taxRate: 0,
      isRecurring: false,
      lineItems: [{ description: "", qty: 1, rate: 0, amount: 0, isSection: false }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems"
  });

  const watchLineItems = watch("lineItems");
  const watchAccountId = watch("accountId");
  const watchPaidFromId = watch("paidFromAccountId");
  const watchTaxRate = watch("taxRate");

  useEffect(() => {
    // We fetch financial accounts from /api/accounts if they exist, or clients...
    // In this codebase accounts might be at /api/financial-accounts or similar, assuming /api/accounts for now
    fetch('/api/accounts').then(res => res.json()).then(data => {
      if(Array.isArray(data)) setAccounts(data);
    }).catch(() => {});
    
    fetch('/api/projects').then(res => res.json()).then(data => {
      if(Array.isArray(data)) setProjects(data);
    }).catch(() => {});
  }, []);

  const subtotal = watchLineItems.reduce((sum, item) => {
    if (item.isSection) return sum;
    return new Decimal(sum).plus(new Decimal(item.qty || 0).times(item.rate || 0)).toNumber();
  }, 0);

  const taxAmount = new Decimal(subtotal).times(new Decimal(watchTaxRate || 0).dividedBy(100)).toNumber();
  const total = new Decimal(subtotal).plus(taxAmount).toNumber();

  const onSubmit = async (data: ExpenseFormValues) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        amount: total,
        subtotal,
        total,
        status: 'SAVED'
      };

      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to create expense");
      const created = await res.json();
      
      toast.success("Expense created successfully");
      router.push(`/expenses/${created.id}`);
    } catch (error) {
      toast.error("Failed to create expense");
    } finally {
      setIsSaving(false);
    }
  };

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || "[account name]";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create Expense</h2>
          <p className="text-neutral-400">Record a new outgoing payment or receipt.</p>
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
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isSaving ? "Saving..." : "Save Expense"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Panel */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-6 overflow-hidden">
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b border-neutral-800 pb-2">Expense Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Vendor Name</label>
                <input type="text" {...register("vendor")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Date</label>
                <input type="date" {...register("date")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Expense #</label>
                <input type="text" {...register("expenseNumber")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Category</label>
                <select {...register("category")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
                  <option value="">Select Category...</option>
                  {["Software", "Travel", "Marketing", "Office", "Contractors", "Utilities", "Subscriptions", "Reimbursements", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
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
                  <option value="">None</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Currency</label>
                <select {...register("currency")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
                  {["USD", "INR", "GBP", "EUR", "CAD", "CHF"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input type="checkbox" id="isRecurring" {...register("isRecurring")} className="rounded border-neutral-700 bg-neutral-900 text-indigo-600 focus:ring-indigo-500" />
                <label htmlFor="isRecurring" className="text-sm font-medium text-neutral-300">Is Recurring</label>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-300 mb-1">Receipt URL (Upload)</label>
                <input type="file" className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 text-neutral-400" 
                  onChange={(e) => {
                    if (e.target.files?.[0]) setValue("receiptUrl", e.target.files[0].name);
                  }}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-300 mb-1">Notes</label>
                <textarea {...register("notes")} rows={2} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Line Items</h3>
              <div className="flex space-x-3">
                <button 
                  type="button" 
                  onClick={() => append({ description: "", qty: 0, rate: 0, amount: 0, isSection: true })}
                  className="text-indigo-400 text-sm flex items-center hover:text-indigo-300"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Section
                </button>
                <button 
                  type="button" 
                  onClick={() => append({ description: "", qty: 1, rate: 0, amount: 0, isSection: false })}
                  className="text-indigo-400 text-sm flex items-center hover:text-indigo-300"
                >
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
                        className={`w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none ${isSection ? 'font-bold text-indigo-400' : ''}`}
                      />
                    </div>
                    {!isSection ? (
                      <>
                        <input 
                          type="number" 
                          step="0.1"
                          {...register(`lineItems.${index}.qty` as const, { valueAsNumber: true })} 
                          placeholder="0" 
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm text-right focus:ring-1 focus:ring-indigo-500 outline-none min-w-0"
                          onChange={(e) => {
                            const qty = parseFloat(e.target.value) || 0;
                            const rate = watchLineItems[index]?.rate || 0;
                            setValue(`lineItems.${index}.amount`, new Decimal(qty).times(rate).toNumber());
                          }}
                        />
                        <input 
                          type="number" 
                          step="0.01"
                          {...register(`lineItems.${index}.rate` as const, { valueAsNumber: true })} 
                          placeholder="0.00" 
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm text-right focus:ring-1 focus:ring-indigo-500 outline-none min-w-0"
                          onChange={(e) => {
                            const rate = parseFloat(e.target.value) || 0;
                            const qty = watchLineItems[index]?.qty || 0;
                            setValue(`lineItems.${index}.amount`, new Decimal(qty).times(rate).toNumber());
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
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-neutral-400">
                  <span>Tax (%)</span>
                  <input type="number" {...register("taxRate", { valueAsNumber: true })} className="w-16 bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-right outline-none" />
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
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Crypto">Crypto</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Paid From Account</label>
                <select {...register("paidFromAccountId")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
                  <option value="">Select Account...</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Live Preview Panel */}
        <div className="hidden lg:flex rounded-xl border border-neutral-800 bg-neutral-900/50 flex-col overflow-hidden h-[1000px]">
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
                  <h1 className="text-2xl font-bold text-gray-800 mb-1">EXPENSE RECEIPT</h1>
                </div>
                <div className="text-right text-sm">
                  <h2 className="text-lg font-bold text-gray-800">Invoxa</h2>
                  <p className="text-gray-600">123 Business St.</p>
                </div>
              </div>
              
              <div className="flex justify-between text-sm mb-6">
                <div>
                  <p className="mb-1"><span className="font-semibold">Vendor:</span> {watch("vendor") || "[vendor name]"}</p>
                  <p className="mb-1"><span className="font-semibold">Category:</span> {watch("category") || "[category]"}</p>
                  <p className="mb-1"><span className="font-semibold">Account:</span> {getAccountName(watchAccountId) || "[account name]"}</p>
                </div>
                <div className="text-right">
                  <p className="mb-1"><span className="font-semibold">Date:</span> {watch("date") ? new Date(watch("date")).toLocaleDateString('en-US') : "[date]"}</p>
                  <p className="mb-1"><span className="font-semibold">Expense #:</span> {watch("expenseNumber") || "[number]"}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold border-b border-black pb-1 mb-2">DETAILS</h3>
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-black">
                      <th className="py-2 font-semibold">Description</th>
                      <th className="py-2 font-semibold text-center w-20">Qty</th>
                      <th className="py-2 font-semibold text-center w-24">Rate</th>
                      <th className="py-2 font-semibold text-right w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchLineItems.map((item, i) => (
                      <tr key={i} className="border-b border-gray-200">
                        {item.isSection ? (
                          <td colSpan={4} className="py-2 font-bold text-gray-900 bg-gray-50">{item.description || "Section Header Label"}</td>
                        ) : (
                          <>
                            <td className="py-2 align-top whitespace-pre-wrap">{item.description || "Item description"}</td>
                            <td className="py-2 text-center align-top">{item.qty || ""}</td>
                            <td className="py-2 text-center align-top">{item.rate || ""}</td>
                            <td className="py-2 text-right align-top">${item.amount?.toFixed(2) || "0.00"}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-4 flex justify-end text-sm">
                  <table className="w-64">
                    <tbody>
                      <tr>
                        <td className="py-1 pr-4 text-right">Subtotal</td>
                        <td className="py-1 text-right font-medium">${subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-4 text-right">Tax ({watchTaxRate || 0}%)</td>
                        <td className="py-1 text-right font-medium">${taxAmount.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t border-black">
                        <td className="py-2 pr-4 text-right font-bold">TOTAL</td>
                        <td className="py-2 text-right font-bold">${total.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="text-sm mt-8 border-t border-black pt-4">
                <h3 className="font-bold mb-2">PAYMENT</h3>
                <div className="grid grid-cols-[120px_1fr] gap-y-1">
                  <div className="font-semibold">Payment Method:</div>
                  <div>{watch("paymentMethod") || "[method]"}</div>
                  <div className="font-semibold">Paid From:</div>
                  <div>{getAccountName(watchPaidFromId) || "[account name]"}</div>
                  <div className="font-semibold mt-2">Notes:</div>
                  <div className="mt-2 whitespace-pre-wrap text-gray-700">{watch("notes") || "[notes]"}</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
