'use client';
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { UploadCloud, FileText, Loader2 } from "lucide-react";
import { pdfApi } from "@/lib/api";

export default function PDFPage() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken;
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  const handleUpload = async () => {
    if (!file || !token) {
      if(!token) alert("Please log in to upload PDFs.");
      return;
    }
    setUploading(true);
    setAnswer("");
    try {
      const res = await pdfApi.upload(file, token);
      setSessionId(res.session_id);
      alert("PDF Uploaded and Processed successfully!");
    } catch (e: any) {
      console.error(e);
      alert(`Upload failed: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleQuery = async () => {
    if (!query.trim() || !token || !sessionId) {
      if(!sessionId) alert("Please upload a PDF first.");
      return;
    }
    setAsking(true);
    try {
      const res = await pdfApi.ask(query, sessionId, token);
      setAnswer(res.answer);
    } catch (e: any) {
      console.error(e);
      setAnswer(`Error: ${e.message}`);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-8 text-neutral-50 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-8"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Document RAG Intelligence
          </h1>
          <p className="text-neutral-400 mt-2">Upload any PDF and instantly query its contents using AI.</p>
        </div>

        {/* Upload Section */}
        <div className="border-2 border-dashed border-neutral-700 rounded-2xl p-10 flex flex-col items-center justify-center bg-neutral-950/50 hover:bg-neutral-800/50 transition-colors">
          <UploadCloud className="w-12 h-12 text-emerald-500 mb-4" />
          <p className="text-neutral-300 font-medium mb-4">Click to upload or drag and drop</p>
          <Input 
            type="file" 
            accept=".pdf" 
            className="hidden" 
            id="pdf-upload"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <label htmlFor="pdf-upload">
            <Button variant="secondary" className="pointer-events-none bg-neutral-800 text-white hover:bg-neutral-700">
              Select PDF File
            </Button>
          </label>
          {file && (
            <div className="mt-4 flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-lg">
              <FileText className="w-5 h-5" />
              <span>{file.name}</span>
            </div>
          )}
          {file && (
            <Button 
              onClick={handleUpload} 
              disabled={uploading}
              className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white w-full max-w-xs"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {uploading ? "Processing Document..." : "Upload & Analyze"}
            </Button>
          )}
        </div>

        {/* Query Section */}
        <div className="space-y-4 pt-6 border-t border-neutral-800">
          <h3 className="text-xl font-semibold">Ask Questions</h3>
          <div className="flex gap-2">
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., What are the key points in chapter 3?"
              className="bg-neutral-950 border-neutral-700"
            />
            <Button 
              onClick={handleQuery} 
              disabled={asking || !query.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-8"
            >
              {asking ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ask"}
            </Button>
          </div>
          
          {answer && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-6 bg-neutral-950 border border-neutral-800 rounded-xl"
            >
              <h4 className="flex items-center gap-2 text-cyan-400 font-semibold mb-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                AI Analysis
              </h4>
              <p className="text-neutral-300 leading-relaxed">{answer}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
