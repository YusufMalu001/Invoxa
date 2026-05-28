"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Network } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        toast.success("Welcome back");
        window.location.href = '/';
      } else {
        toast.error("Invalid credentials");
      }
    } catch {
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-950">
      <div className="hidden lg:flex flex-1 flex-col justify-center px-12 bg-gradient-to-br from-indigo-900/40 to-neutral-950 relative overflow-hidden">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-6">
            <Network className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-bold text-white">Invoxa</h1>
          </div>
          <h2 className="text-4xl font-semibold text-white tracking-tight leading-tight max-w-lg mb-4">
            AI-Native Financial Operations for Modern Agencies
          </h2>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24">
        <div className="w-full max-w-sm mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
          <h3 className="text-2xl font-semibold text-white mb-6">Welcome back</h3>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2.5 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-white transition-shadow" placeholder="admin@invoxa.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2.5 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-white transition-shadow" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
