"use client";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-neutral-400">Configure your platform preferences.</p>
      </div>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col min-h-[500px]">
        <div className="flex border-b border-neutral-800 px-4">
          {['Company', 'Invoices', 'Notifications', 'AI Integrations', 'Team'].map((tab, i) => (
            <button key={tab} className={`py-4 px-4 text-sm font-medium border-b-2 ${i===0 ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}>{tab}</button>
          ))}
        </div>
        <div className="p-8">
          <div className="max-w-xl space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1.5">Company Name</label>
              <input type="text" defaultValue="Invoxa Agency" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1.5">Base Currency</label>
              <select className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-white">
                <option>USD</option><option>EUR</option><option>INR</option>
              </select>
            </div>
            <button className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">Save Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}
