"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface IntegrationStatus {
  ai: boolean;
  github: boolean;
  jobs: boolean;
  hackathons: boolean;
  database: boolean;
}

export default function ApiSetupPage() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkHealth() {
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${BASE_URL}/api/health`);
        const data = await res.json();
        
        if (data.integrations) {
          setStatus(data.integrations);
        } else {
          setError("Backend did not return integration status.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to connect to backend");
      } finally {
        setLoading(false);
      }
    }
    checkHealth();
  }, []);

  const IntegrationCard = ({ title, isActive, description }: { title: string, isActive: boolean, description: string }) => (
    <div className={`p-4 rounded-xl border ${isActive ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"} flex items-center gap-4`}>
      <div className="shrink-0">
        {isActive ? <CheckCircle2 className="w-8 h-8 text-green-500" /> : <XCircle className="w-8 h-8 text-red-500" />}
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-neutral-400">{description}</p>
        {!isActive && (
          <p className="text-xs text-red-400 mt-1">Missing environment variable configuration.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">API Setup Guide</h1>
        <p className="text-neutral-400">
          TulasiAI requires external API keys to function securely in production. Check your integration status below.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
          Error checking API health: {error}
        </div>
      ) : status ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <IntegrationCard 
            title="Database Connection" 
            description="PostgreSQL / SQLite via SQLModel" 
            isActive={status.database} 
          />
          <IntegrationCard 
            title="AI Agents (Gemini)" 
            description="Required for DSA, Communication, and Interview agents." 
            isActive={status.ai} 
          />
          <IntegrationCard 
            title="GitHub API" 
            description="Uses Public API by default. Add token to increase rate limits." 
            isActive={status.github} 
          />
          <IntegrationCard 
            title="Jobs / Internships API" 
            description="Uses Free RemoteOK API. Adzuna/Jooble are optional." 
            isActive={status.jobs} 
          />
          <IntegrationCard 
            title="Hackathons API" 
            description="Uses Free Devpost RSS Feed." 
            isActive={status.hackathons} 
          />
        </motion.div>
      ) : null}
      
      <div className="p-6 bg-neutral-900 rounded-xl border border-white/10 mt-8">
        <h3 className="font-semibold mb-4">How to set up integrations?</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm text-neutral-300">
          <li>TulasiAI uses a Free-First API architecture.</li>
          <li>Open the <code className="bg-black px-1 py-0.5 rounded">.env.example</code> file in the <code>backend/</code> folder.</li>
          <li>Copy it to a new file named <code className="bg-black px-1 py-0.5 rounded">.env</code> in the same folder.</li>
          <li>Add a <code>GEMINI_API_KEY</code> from Google AI Studio.</li>
          <li>Restart the backend server.</li>
        </ul>
      </div>
    </div>
  );
}
