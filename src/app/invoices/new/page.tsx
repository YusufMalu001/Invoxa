"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { InvoiceForm } from "@/components/InvoiceForm";

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}>
      <InvoiceForm />
    </Suspense>
  );
}
