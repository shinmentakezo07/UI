"use client";

import { motion } from "framer-motion";
import { 
  Book, Code2, Zap, Key, Database, Shield, TrendingUp, 
  Terminal, Globe, CheckCircle, ArrowRight, Copy, ExternalLink,
  Layers, Settings, BarChart3, Lock, Sparkles, AlertTriangle,
  Activity, Webhook
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  }
};

const CodeBlock = ({ code, language = "bash" }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white/70 hover:text-white transition-all flex items-center gap-2"
        >
          {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="bg-black border border-white/10 rounded-xl p-6 overflow-x-auto font-mono text-sm">
        <code className="text-green-400">{code}</code>
      </pre>
    </div>
  );
};

const Section = ({ id, icon: Icon, title, children }: any) => (
  <motion.section
    id={id}
    variants={itemVariants}
    className="mb-16 scroll-mt-24"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary ring-1 ring-primary/20">
        <Icon className="w-6 h-6" />
      </div>
      <h2 className="text-3xl font-bold text-white">{title}</h2>
    </div>
    <div className="space-y-6 text-muted-foreground leading-relaxed">
      {children}
    </div>
  </motion.section>
);

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-foreground">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-2">
              <h3 className="text-lg font-bold text-white mb-6">Documentation</h3>
              {[
                { id: "quickstart", label: "Quick Start", icon: Zap },
                { id: "authentication", label: "Authentication", icon: Key },
                { id: "api-reference", label: "API Reference", icon: Code2 },
                { id: "rate-limits", label: "Rate Limits", icon: Shield },
                { id: "error-handling", label: "Error Handling", icon: AlertTriangle },
                { id: "models", label: "Available Models", icon: Layers },
                { id: "streaming", label: "Streaming Responses", icon: Activity },
                { id: "pricing", label: "Pricing & Credits", icon: TrendingUp },
                { id: "database", label: "Database Schema", icon: Database },
                { id: "dashboard", label: "Dashboard Features", icon: BarChart3 },
                { id: "webhooks", label: "Webhooks", icon: Webhook },
                { id: "security", label: "Security", icon: Lock },
                { id: "examples", label: "Code Examples", icon: Terminal },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-all group"
                >
                  <item.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                  <span className="text-sm">{item.label}</span>
                </a>
              ))}
            </div>
          </aside>

          {/* Documentation Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-3 space-y-16"
          >
            {/* Quick Start */}
            <Section id="quickstart" icon={Zap} title="Quick Start">
              <p className="text-lg">
                Get started with Yapapa AI Gateway in under 5 minutes. Follow these steps to make your first API call.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">1</div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Create an Account</h4>
                    <p>Sign up at <Link href="/signup" className="text-primary hover:underline">/signup</Link> to get started.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">2</div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Generate API Key</h4>
                    <p>Navigate to <Link href="/dashboard/keys" className="text-primary hover:underline">Dashboard → API Keys</Link> and create a new key.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">3</div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Make Your First Request</h4>
                    <p className="mb-4">Use the API key to send requests to any supported model:</p>
                    <CodeBlock code={`curl https://api.yapapa.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`} />
                  </div>
                </div>
              </div>
            </Section>

            {/* Authentication */}
            <Section id="authentication" icon={Key} title="Authentication">
              <p>
                All API requests require authentication using an API key. Include your key in the Authorization header:
              </p>
              <CodeBlock code={`Authorization: Bearer YOUR_API_KEY`} />
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-500 font-semibold mb-2">Security Best Practices</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Never commit API keys to version control</li>
                      <li>• Use environment variables to store keys</li>
                      <li>• Rotate keys regularly</li>
                      <li>• Revoke unused keys immediately</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Section>

            {/* API Reference */}
            <Section id="api-reference" icon={Code2} title="API Reference">
              <h3 className="text-xl font-bold text-white mb-4">Base URL</h3>
              <CodeBlock code={`https://api.yapapa.ai/v1`} />

              <h3 className="text-xl font-bold text-white mb-4 mt-8">Endpoints</h3>
              
              <div className="space-y-6">
                <div className="glass-card rounded-xl p-6 bg-[#0A0A0A] border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 font-mono text-xs font-bold">POST</span>
                    <code className="text-white font-mono">/chat/completions</code>
                  </div>
                  <p className="mb-4">Create a chat completion with any supported model.</p>
                  <h4 className="text-white font-semibold mb-2">Request Body:</h4>
                  <CodeBlock language="json" code={`{
  "model": "gpt-4",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}`} />
                </div>

                <div className="glass-card rounded-xl p-6 bg-[#0A0A0A] border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 font-mono text-xs font-bold">GET</span>
                    <code className="text-white font-mono">/models</code>
                  </div>
                  <p>List all available models and their capabilities.</p>
                </div>

                <div className="glass-card rounded-xl p-6 bg-[#0A0A0A] border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 font-mono text-xs font-bold">GET</span>
                    <code className="text-white font-mono">/usage</code>
                  </div>
                  <p>Get your current usage statistics and credit balance.</p>
                </div>
              </div>
            </Section>

            {/* Rate Limits */}
            <Section id="rate-limits" icon={Shield} title="Rate Limits">
              <p>
                Rate limits protect the API from abuse and ensure fair usage across all users. Limits vary by model and subscription tier.
              </p>

              <div className="glass-card rounded-xl p-6 bg-[#0A0A0A] border border-white/10 mt-6">
                <h4 className="text-white font-semibold mb-4">Default Rate Limits</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div>
                      <p className="text-white font-semibold">Requests per minute</p>
                      <p className="text-sm text-muted-foreground">Maximum API calls</p>
                    </div>
                    <span className="text-2xl font-bold text-primary">60</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div>
                      <p className="text-white font-semibold">Tokens per minute</p>
                      <p className="text-sm text-muted-foreground">Combined input + output</p>
                    </div>
                    <span className="text-2xl font-bold text-primary">100K</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div>
                      <p className="text-white font-semibold">Concurrent requests</p>
                      <p className="text-sm text-muted-foreground">Simultaneous connections</p>
                    </div>
                    <span className="text-2xl font-bold text-primary">10</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mt-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-blue-500 font-semibold mb-2">Rate Limit Headers</h4>
                    <p className="text-sm mb-3">Every response includes rate limit information:</p>
                    <CodeBlock code={`X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640000000`} />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-500 font-semibold mb-2">Handling Rate Limits</h4>
                    <p className="text-sm mb-3">When you exceed rate limits, you'll receive a 429 status code. Implement exponential backoff:</p>
                    <CodeBlock language="python" code={`import time

def make_request_with_retry(max_retries=3):
    for attempt in range(max_retries):
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 429:
            wait_time = 2 ** attempt  # Exponential backoff
            time.sleep(wait_time)
            continue
        return response
    raise Exception("Max retries exceeded")`} />
                  </div>
                </div>
              </div>
            </Section>

            {/* Error Handling */}
            <Section id="error-handling" icon={AlertTriangle} title="Error Handling">
              <p>
                Yapapa uses standard HTTP status codes and provides detailed error messages to help you debug issues quickly.
              </p>

              <div className="space-y-4 mt-6">
                <div className="glass-card rounded-xl p-5 bg-[#0A0A0A] border border-red-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 font-mono text-sm font-bold">400</span>
                    <h4 className="text-white font-semibold">Bad Request</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Invalid request parameters or malformed JSON</p>
                  <CodeBlock language="json" code={`{
  "error": {
    "message": "Invalid model specified",
    "type": "invalid_request_error",
    "code": "invalid_model"
  }
}`} />
                </div>

                <div className="glass-card rounded-xl p-5 bg-[#0A0A0A] border border-yellow-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 font-mono text-sm font-bold">401</span>
                    <h4 className="text-white font-semibold">Unauthorized</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Invalid or missing API key</p>
                </div>

                <div className="glass-card rounded-xl p-5 bg-[#0A0A0A] border border-orange-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-lg bg-orange-500/20 text-orange-400 font-mono text-sm font-bold">402</span>
                    <h4 className="text-white font-semibold">Insufficient Credits</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Your account has run out of credits. Add more to continue.</p>
                </div>

                <div className="glass-card rounded-xl p-5 bg-[#0A0A0A] border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-400 font-mono text-sm font-bold">429</span>
                    <h4 className="text-white font-semibold">Rate Limit Exceeded</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Too many requests. Implement exponential backoff and retry.</p>
                </div>

                <div className="glass-card rounded-xl p-5 bg-[#0A0A0A] border border-red-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 font-mono text-sm font-bold">500</span>
                    <h4 className="text-white font-semibold">Server Error</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Internal server error. Retry with exponential backoff.</p>
                </div>

                <div className="glass-card rounded-xl p-5 bg-[#0A0A0A] border border-blue-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 font-mono text-sm font-bold">503</span>
                    <h4 className="text-white font-semibold">Service Unavailable</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Temporary service disruption. The model provider may be down.</p>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-green-500 font-semibold mb-2">Best Practices</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Always check the HTTP status code before parsing the response</li>
                      <li>• Implement retry logic with exponential backoff for 429 and 5xx errors</li>
                      <li>• Log error details for debugging and monitoring</li>
                      <li>• Handle insufficient credits gracefully in your UI</li>
                      <li>• Set reasonable timeouts (30-60 seconds for most requests)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Section>

            {/* Available Models */}
            <Section id="models" icon={Layers} title="Available Models">
              <p>
                Yapapa provides access to 100+ AI models from leading providers. All models use the same unified API format.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {[
                  { name: "GPT-4 Turbo", provider: "OpenAI", context: "128K", color: "emerald" },
                  { name: "Claude 3 Opus", provider: "Anthropic", context: "200K", color: "purple" },
                  { name: "Gemini Pro", provider: "Google", context: "32K", color: "blue" },
                  { name: "Llama 3 70B", provider: "Meta", context: "8K", color: "orange" },
                ].map((model) => (
                  <div key={model.name} className="glass-card rounded-xl p-5 bg-[#0A0A0A] border border-white/10 hover:border-white/20 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">{model.name}</h4>
                      <span className={`px-2 py-1 rounded-lg bg-${model.color}-500/20 text-${model.color}-400 text-xs font-mono`}>
                        {model.context}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{model.provider}</p>
                  </div>
                ))}
              </div>

              <Link href="/models" className="inline-flex items-center gap-2 text-primary hover:underline mt-4">
                View all models <ExternalLink className="w-4 h-4" />
              </Link>
            </Section>

            {/* Streaming Responses */}
            <Section id="streaming" icon={Activity} title="Streaming Responses">
              <p>
                Stream responses token-by-token for real-time user experiences. Perfect for chatbots and interactive applications.
              </p>

              <div className="glass-card rounded-xl p-6 bg-[#0A0A0A] border border-white/10 mt-6">
                <h4 className="text-white font-semibold mb-4">Enable Streaming</h4>
                <p className="text-sm text-muted-foreground mb-4">Set <code className="px-2 py-1 rounded bg-white/10 text-primary font-mono text-xs">stream: true</code> in your request:</p>
                <CodeBlock language="json" code={`{
  "model": "gpt-4",
  "messages": [{"role": "user", "content": "Tell me a story"}],
  "stream": true
}`} />
              </div>

              <div className="space-y-6 mt-6">
                <div>
                  <h4 className="text-white font-semibold mb-3">JavaScript Example</h4>
                  <CodeBlock language="javascript" code={`const response = await fetch('https://api.yapapa.ai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello!' }],
    stream: true
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\\n').filter(line => line.trim());
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') break;
      
      const parsed = JSON.parse(data);
      const content = parsed.choices[0]?.delta?.content;
      if (content) {
        process.stdout.write(content); // Display token
      }
    }
  }
}`} />
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3">Python Example</h4>
                  <CodeBlock language="python" code={`import openai

openai.api_base = "https://api.yapapa.ai/v1"
openai.api_key = "YOUR_API_KEY"

stream = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}],
    stream=True
)

for chunk in stream:
    content = chunk.choices[0].delta.get("content", "")
    if content:
        print(content, end="", flush=True)`} />
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mt-6">
                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-blue-500 font-semibold mb-2">Server-Sent Events (SSE)</h4>
                    <p className="text-sm">Streaming uses SSE format. Each chunk is prefixed with <code className="px-2 py-1 rounded bg-white/10 text-blue-400 font-mono text-xs">data:</code> and the stream ends with <code className="px-2 py-1 rounded bg-white/10 text-blue-400 font-mono text-xs">data: [DONE]</code></p>
                  </div>
                </div>
              </div>
            </Section>

            {/* Pricing */}
            <Section id="pricing" icon={TrendingUp} title="Pricing & Credits">
              <p>
                Yapapa uses a pay-as-you-go credit system. You only pay for what you use, with transparent per-token pricing.
              </p>

              <div className="glass-card rounded-xl p-6 bg-[#0A0A0A] border border-white/10 mt-6">
                <h4 className="text-white font-semibold mb-4">How Credits Work</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>1 credit = $0.000001 USD (1 microcent)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Costs calculated per token (input + output)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Real-time usage tracking in dashboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>No monthly fees or subscriptions</span>
                  </li>
                </ul>
              </div>

              <Link href="/pricing" className="inline-flex items-center gap-2 text-primary hover:underline mt-4">
                View detailed pricing <ExternalLink className="w-4 h-4" />
              </Link>
            </Section>

            {/* Database Schema */}
            <Section id="database" icon={Database} title="Database Schema">
              <p>
                Yapapa uses PostgreSQL with Drizzle ORM. Here's an overview of the main tables:
              </p>

              <div className="space-y-4 mt-6">
                {[
                  { name: "users", desc: "User accounts with authentication" },
                  { name: "apiKeys", desc: "API key management and tracking" },
                  { name: "apiLogs", desc: "Request/response logs with metrics" },
                  { name: "userCredits", desc: "Credit balance and spending" },
                  { name: "creditTransactions", desc: "Purchase and usage history" },
                ].map((table) => (
                  <div key={table.name} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <Database className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <code className="text-white font-mono font-semibold">{table.name}</code>
                      <p className="text-sm text-muted-foreground mt-1">{table.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mt-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-blue-500 font-semibold mb-2">Database Setup</h4>
                    <p className="text-sm mb-3">Push the schema to your database:</p>
                    <CodeBlock code={`cd apps/web\nnpm run db:push`} />
                  </div>
                </div>
              </div>
            </Section>

            {/* Dashboard Features */}
            <Section id="dashboard" icon={BarChart3} title="Dashboard Features">
              <p>
                Monitor your API usage, manage keys, and track costs through the comprehensive dashboard.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {[
                  { title: "Overview", desc: "Real-time metrics and quick stats", icon: BarChart3, link: "/dashboard" },
                  { title: "API Keys", desc: "Generate and manage access keys", icon: Key, link: "/dashboard/keys" },
                  { title: "Logs", desc: "Request history with full details", icon: Terminal, link: "/dashboard/logs" },
                  { title: "Analytics", desc: "Usage trends and cost analysis", icon: TrendingUp, link: "/dashboard/analytics" },
                ].map((feature) => (
                  <Link
                    key={feature.title}
                    href={feature.link}
                    className="glass-card rounded-xl p-6 bg-[#0A0A0A] border border-white/10 hover:border-primary/50 transition-all group"
                  >
                    <feature.icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </Link>
                ))}
              </div>
            </Section>

            {/* Webhooks */}
            <Section id="webhooks" icon={Webhook} title="Webhooks">
              <p>
                Receive real-time notifications about events in your account. Webhooks allow you to build event-driven integrations.
              </p>

              <div className="glass-card rounded-xl p-6 bg-[#0A0A0A] border border-white/10 mt-6">
                <h4 className="text-white font-semibold mb-4">Supported Events</h4>
                <div className="space-y-3">
                  {[
                    { event: "request.completed", desc: "Fired when an API request completes successfully" },
                    { event: "request.failed", desc: "Fired when an API request fails" },
                    { event: "credit.low", desc: "Fired when credit balance falls below threshold" },
                    { event: "credit.depleted", desc: "Fired when credit balance reaches zero" },
                    { event: "key.created", desc: "Fired when a new API key is generated" },
                    { event: "key.revoked", desc: "Fired when an API key is revoked" },
                  ].map((item) => (
                    <div key={item.event} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                      <code className="px-2 py-1 rounded bg-primary/20 text-primary font-mono text-xs flex-shrink-0">{item.event}</code>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6 mt-6">
                <div>
                  <h4 className="text-white font-semibold mb-3">Webhook Payload Example</h4>
                  <CodeBlock language="json" code={`{
  "event": "request.completed",
  "timestamp": "2026-04-16T07:45:00Z",
  "data": {
    "request_id": "req_abc123",
    "model": "gpt-4",
    "tokens": {
      "input": 150,
      "output": 300,
      "total": 450
    },
    "cost": 4500,
    "latency_ms": 1250,
    "status": "success"
  }
}`} />
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3">Webhook Endpoint Setup</h4>
                  <p className="text-sm text-muted-foreground mb-4">Configure webhooks in your dashboard at <Link href="/dashboard/settings" className="text-primary hover:underline">Settings → Webhooks</Link></p>
                  <CodeBlock language="javascript" code={`// Express.js webhook handler example
app.post('/webhooks/yapapa', (req, res) => {
  const signature = req.headers['x-yapapa-signature'];
  const payload = req.body;
  
  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).send('Invalid signature');
  }
  
  // Handle the event
  switch (payload.event) {
    case 'request.completed':
      console.log('Request completed:', payload.data);
      break;
    case 'credit.low':
      console.log('Low credit alert:', payload.data);
      // Send notification to admin
      break;
  }
  
  res.status(200).send('OK');
});`} />
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mt-6">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-500 font-semibold mb-2">Security</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Always verify webhook signatures using your webhook secret</li>
                      <li>• Use HTTPS endpoints only</li>
                      <li>• Implement idempotency to handle duplicate events</li>
                      <li>• Return 200 status code within 5 seconds to avoid retries</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Section>

            {/* Security */}
            <Section id="security" icon={Lock} title="Security">
              <p>
                Yapapa takes security seriously. All API communications are encrypted and authenticated.
              </p>

              <div className="space-y-4 mt-6">
                <div className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/10">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">TLS Encryption</h4>
                    <p className="text-sm">All API requests use HTTPS with TLS 1.3</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/10">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">API Key Authentication</h4>
                    <p className="text-sm">Secure bearer token authentication for all endpoints</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/10">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">Rate Limiting</h4>
                    <p className="text-sm">Automatic protection against abuse and DDoS attacks</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/10">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">Data Privacy</h4>
                    <p className="text-sm">Your data is never used for model training</p>
                  </div>
                </div>
              </div>
            </Section>

            {/* Code Examples */}
            <Section id="examples" icon={Terminal} title="Code Examples">
              <p>
                Integration examples in popular programming languages:
              </p>

              <div className="space-y-6 mt-6">
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-mono">Python</span>
                  </h4>
                  <CodeBlock language="python" code={`import openai

openai.api_base = "https://api.yapapa.ai/v1"
openai.api_key = "YOUR_API_KEY"

response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)`} />
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs font-mono">JavaScript</span>
                  </h4>
                  <CodeBlock language="javascript" code={`import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.yapapa.ai/v1',
  apiKey: process.env.YAPAPA_API_KEY,
});

const response = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
});

console.log(response.choices[0].message.content);`} />
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs font-mono">cURL</span>
                  </h4>
                  <CodeBlock code={`curl https://api.yapapa.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "claude-3-opus",
    "messages": [
      {"role": "user", "content": "Explain quantum computing"}
    ]
  }'`} />
                </div>
              </div>
            </Section>

            {/* Footer CTA */}
            <div className="glass-card rounded-2xl p-12 bg-gradient-to-br from-primary/10 to-purple-500/10 border border-white/10 text-center mt-16">
              <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Create your account and start building with 100+ AI models through one unified API.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-all flex items-center gap-2"
                >
                  Sign Up Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/playground"
                  className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all"
                >
                  Try Playground
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
