"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-[20vh]">
      <Command 
        className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl overflow-hidden"
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        <div className="flex items-center border-b border-neutral-800 px-3">
          <Search className="w-5 h-5 text-neutral-500 mr-2" />
          <Command.Input 
            autoFocus
            placeholder="Search invoices, clients, expenses... (Cmd+K)" 
            className="w-full bg-transparent outline-none py-4 text-sm text-neutral-100 placeholder:text-neutral-500"
          />
        </div>

        <Command.List className="max-h-[300px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-neutral-500">No results found.</Command.Empty>

          <Command.Group heading="Navigation" className="px-2 text-xs font-medium text-neutral-500 mb-2">
            <Command.Item onSelect={() => { router.push('/'); setOpen(false); }} className="px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded-md cursor-pointer">Dashboard</Command.Item>
            <Command.Item onSelect={() => { router.push('/invoices'); setOpen(false); }} className="px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded-md cursor-pointer">Invoices</Command.Item>
            <Command.Item onSelect={() => { router.push('/clients'); setOpen(false); }} className="px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded-md cursor-pointer">Clients</Command.Item>
            <Command.Item onSelect={() => { router.push('/ai-ops'); setOpen(false); }} className="px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded-md cursor-pointer">AI Operations</Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
