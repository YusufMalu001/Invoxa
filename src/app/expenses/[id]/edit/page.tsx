"use client";

import { use, useEffect, useState } from "react";
import { ExpenseForm } from "@/components/ExpenseForm";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/expenses/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setExpense(data);
      })
      .catch(err => toast.error("Failed to load expense"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-neutral-500" /></div>;
  }

  if (!expense) return <div className="text-center py-20">Expense not found</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <ExpenseForm initialData={expense} isEdit={true} />
    </div>
  );
}
