"use client";

import { use, useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { InvoiceForm } from "@/components/InvoiceForm";

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/invoices/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => {
        // format date properly
        if (data.date) data.date = new Date(data.date).toISOString().split('T')[0];
        if (data.dueDate) data.dueDate = new Date(data.dueDate).toISOString().split('T')[0];
        setInvoice(data);
      })
      .catch(() => {
        toast.error("Invoice not found");
        router.push("/invoices");
      });
  }, [id, router]);

  if (!invoice) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}>
      <InvoiceForm initialData={invoice} isEdit={true} />
    </Suspense>
  );
}
