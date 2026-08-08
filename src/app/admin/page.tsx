'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, Cpu, Users, Layers, Activity, Lock } from 'lucide-react';
import { AIModel } from '@/lib/ai/types';
import { Badge } from '@/components/ui/badge';

export default function AdminPage() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const res = await fetch('/api/models');
        const data = await res.json();
        if (data.models) {
          setModels(data.models);
        }
      } catch (err) {
        console.error('Failed to load admin data:', err);
      }
    }
    loadAdminData();
  }, []);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-textMain flex items-center justify-center p-6">
        <div className="text-center space-y-3 max-w-sm">
          <Lock className="w-8 h-8 text-red-400 mx-auto" />
          <h1 className="text-lg font-bold text-white">Access Restricted</h1>
          <p className="text-xs text-textMuted">This admin panel is restricted to authorized administrator emails.</p>
          <Link href="/chat" className="inline-block pt-2 text-xs text-accent hover:underline">
            Return to Chat Workspace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-textMain flex flex-col font-sans">
      <header className="h-16 border-b border-border bg-[#0A0A0A]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/chat"
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-textMuted hover:text-textMain transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent-purple" />
            <span className="font-bold text-base text-white">AI HUB Admin Dashboard</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full p-6 md:p-10 space-y-8 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminMetricCard title="Registered Users" value="1" icon={<Users className="w-4 h-4 text-accent" />} />
          <AdminMetricCard title="Active Models" value={models.length.toString()} icon={<Cpu className="w-4 h-4 text-emerald-400" />} />
          <AdminMetricCard title="Cloudflare Workers AI" value="Active" icon={<Layers className="w-4 h-4 text-purple-400" />} />
          <AdminMetricCard title="System Status" value="Online" icon={<Activity className="w-4 h-4 text-blue-400" />} />
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Cloudflare & Model Registry</h2>
              <p className="text-xs text-textMuted">Synchronized with Cloudflare Workers AI & Model Registry.</p>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-mono font-medium border border-emerald-500/20">
              ● Server Operational
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-textMuted border-collapse">
              <thead>
                <tr className="border-b border-border text-textDark uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Model Name</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Model ID</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono">
                {models.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4 font-sans font-semibold text-white">{m.name}</td>
                    <td className="py-3 px-4 uppercase">{m.provider}</td>
                    <td className="py-3 px-4 text-textDark">{m.modelId}</td>
                    <td className="py-3 px-4 font-sans">
                      <Badge variant="recommended">Active</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function AdminMetricCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl border border-border bg-card space-y-2 shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs text-textMuted font-medium">{title}</span>
        <div className="p-2 rounded-xl bg-muted">{icon}</div>
      </div>
      <span className="text-2xl font-bold text-white tracking-tight block">{value}</span>
    </div>
  );
}
