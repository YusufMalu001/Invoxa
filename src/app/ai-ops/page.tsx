"use client";

import { useState } from "react";
import { Bot, Scan, UploadCloud, Loader2 } from "lucide-react";
import Tesseract from 'tesseract.js';
import { toast } from "sonner";

export default function AIOpsPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [aiData, setAiData] = useState<any>(null);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      toast.info("Starting local OCR with Tesseract...");
      
      // Local OCR
      const result = await Tesseract.recognize(file, 'eng');
      setExtractedText(result.data.text);
      
      toast.success("OCR Complete. Sending to Claude for structuring...");

      // Send to AI API
      const res = await fetch('/api/ai/extract-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: result.data.text })
      });

      if (!res.ok) throw new Error("AI Extraction failed");
      
      const structured = await res.json();
      setAiData(structured);
      toast.success("AI Structured data ready");

    } catch (error) {
      console.error(error);
      toast.error("Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveExpense = async () => {
    if (!aiData) return;
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor: aiData.vendor,
          amount: parseFloat(aiData.amount),
          date: aiData.date,
          category: aiData.category,
          aiCategorized: true
        })
      });

      const data = await res.json();
      if (data.duplicateWarning) {
        toast.warning("Duplicate detected! Please review.");
      } else {
        toast.success("Expense saved to ledger");
      }
      setAiData(null);
      setExtractedText("");
    } catch (e) {
      toast.error("Failed to save expense");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Operations Center</h2>
        <p className="text-neutral-400">Manage OCR extractions, smart categorization, and AI jobs.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Receipt OCR Panel */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col">
          <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Scan className="w-5 h-5 text-indigo-400" />
              Receipt & Bill OCR
            </h3>
          </div>
          
          <div className="p-6 flex-1 flex flex-col items-center justify-center border-2 border-dashed border-neutral-700 m-6 rounded-lg bg-neutral-950 hover:border-indigo-500 transition-colors relative">
            <input 
              type="file" 
              accept="image/*,application/pdf"
              onChange={handleFileUpload} 
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isProcessing}
            />
            {isProcessing ? (
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            ) : (
              <UploadCloud className="w-10 h-10 text-neutral-500 mb-4" />
            )}
            <p className="text-sm text-neutral-300 font-medium">
              {isProcessing ? "Processing..." : "Click or drag & drop receipts here"}
            </p>
            <p className="text-xs text-neutral-500 mt-2">Supports PDF, PNG, JPG (Tesseract.js)</p>
          </div>

          {aiData && (
            <div className="p-6 border-t border-neutral-800 bg-neutral-950">
              <h4 className="text-sm font-medium mb-4 text-emerald-400">Extraction Successful</h4>
              <div className="space-y-3 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-neutral-500">Vendor</label>
                    <input type="text" value={aiData.vendor} onChange={(e) => setAiData({...aiData, vendor: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-1 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500">Amount</label>
                    <input type="text" value={aiData.amount} onChange={(e) => setAiData({...aiData, amount: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-1 text-sm mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-neutral-500">Date</label>
                    <input type="date" value={aiData.date} onChange={(e) => setAiData({...aiData, date: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-1 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500">Category</label>
                    <input type="text" value={aiData.category} onChange={(e) => setAiData({...aiData, category: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-1 text-sm mt-1" />
                  </div>
                </div>
              </div>
              <button onClick={saveExpense} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded transition-colors text-sm">
                Confirm & Save Expense
              </button>
            </div>
          )}
        </div>

        {/* AI Processing Queue */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col">
          <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              Processing Queue
            </h3>
            <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">{isProcessing ? "1 Active" : "Idle"}</span>
          </div>
          <div className="p-0 flex-1">
            <div className="divide-y divide-neutral-800">
              {isProcessing && (
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-400">OCR Extraction & Structuring</p>
                    <p className="text-xs text-neutral-500">Tesseract.js + Claude AI Processing</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
                </div>
              )}
              <div className="p-4 flex items-center justify-between opacity-50">
                <div>
                  <p className="text-sm font-medium">Anomaly Detection Scan</p>
                  <p className="text-xs text-neutral-500">Completed 10 mins ago</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
