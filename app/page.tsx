"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const gpus = ["RTX 4090", "H100", "A100", "RTX 3090", "MacBook M2"];
const jobs = [
  "Train ResNet-18 on CIFAR-10",
  "Fine-tune Llama-7B",
  "Run Stable Diffusion inference",
  "Train GPT-2 from scratch",
];

export default function Home() {
  const [gpu, setGpu] = useState(gpus[0]);
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [earnings, setEarnings] = useState(0);

  const addLog = (msg: string) => setLogs((l) => [...l, msg]);

  const start = () => {
    setRunning(true);
    setLogs([]);
    setEarnings(0);
    addLog("Starting GenSyn node...");
    addLog(`GPU: ${gpu}`);

    setTimeout(() => {
      const job = jobs[Math.floor(Math.random() * jobs.length)];
      addLog(`Found job: ${job}`);
      addLog("Bidding...");
      setTimeout(() => {
        addLog("Bid won!");
        let epoch = 0;
        const interval = setInterval(() => {
          epoch++;
          addLog(`Epoch ${epoch}/10 – loss: ${(2.4 - epoch * 0.2).toFixed(2)}`);
          if (epoch >= 10) {
            clearInterval(interval);
            const reward = Number((Math.random() * 3 + 0.5).toFixed(3));
            setEarnings(reward);
            addLog(`Proof verified! Earned +${reward} $SY`);
            addLog("Node idle – waiting for next job");
            setRunning(false);
          }
        }, 600);
      }, 1200);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            GenSyn Node Simulator
          </h1>
          <p className="mt-4 text-xl text-gray-300">
            See how decentralized ML training works — right in your browser
          </p>
        </div>

        {!running ? (
          <div className="space-y-6">
            <select
              value={gpu}
              onChange={(e) => setGpu(e.target.value)}
              className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-lg"
            >
              {gpus.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <button
              onClick={start}
              className="w-full py-5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-xl font-bold hover:scale-105 transition"
            >
              Start Node
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-3xl font-bold text-green-400 text-center">
              +{earnings.toFixed(3)} $SY earned
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 font-mono text-sm h-96 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className="text-green-400">{log}</div>
              ))}
            </div>

            <div className="grid grid-cols-8 gap-2">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-purple-600 rounded"
                  animate={{ height: running ? ["20%", "80%", "40%"] : "20%" }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
