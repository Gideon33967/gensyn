"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Share2 } from "lucide-react";
import Confetti from "react-confetti";
import * as tf from "@tensorflow/tfjs";

const gpus = [
  { name: "RTX 4090", power: 450, speed: 1.2 },
  { name: "H100", power: 700, speed: 1.8 },
  { name: "A100", power: 400, speed: 1.0 },
  { name: "RTX 3090", power: 350, speed: 0.9 },
  { name: "M2 MacBook", power: 30, speed: 0.3 },
];

const jobs = [
  { name: "Train ResNet-18 on CIFAR-10", reward: 1.2 },
  { name: "Fine-tune Llama-7B", reward: 2.8 },
  { name: "Stable Diffusion Proof", reward: 0.9 },
  { name: "GPT-2 from scratch", reward: 1.6 },
];

export default function Home() {
  const [gpu, setGpu] = useState(gpus[0]);
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [earnings, setEarnings] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [paused, setPaused] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, msg]);
    setTimeout(() => logsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const playSound = (freq: number) => {
    if (typeof window !== "undefined") {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  };

  useEffect(() => {
    if (running && !paused) {
      const runJob = async () => {
        const job = jobs[Math.floor(Math.random() * jobs.length)];
        addLog(`📦 New job: ${job.name}`);
        playSound(600);

        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 32, activation: "relu", inputShape: [10] }));
        model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));
        model.compile({ optimizer: "adam", loss: "binaryCrossentropy" });

        const xs = tf.randomNormal([100, 10]);
        const ys = tf.randomUniform([100, 1]).greater(0.5);

        for (let i = 0; i < 12; i++) {
          if (paused) return;
          const h = await model.fit(xs, ys, { epochs: 1 });
          const loss = h.history.loss[0] as number;
          addLog(`   Epoch ${i + 1}/12 → loss: ${loss.toFixed(4)}`);
          setProgress(((i + 1) / 12) * 100);
          await new Promise((r) => setTimeout(r, 400 / gpu.speed));
        }

        xs.dispose();
        ys.dispose();
        model.dispose();

        const reward = (job.reward * gpu.speed).toFixed(2);
        setEarnings((prev) => prev + parseFloat(reward));
        addLog(`✅ Proof verified! +${reward} $SY earned`);
        playSound(1000);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
        setProgress(0);

        if (running) runJob(); // Chain next job
      };
      runJob();
    }
  }, [running, paused, gpu]);

  return (
    <>
      {showConfetti && <Confetti recycle={false} />}
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />

        <div className="max-w-4xl w-full z-10 space-y-8">
          <div className="text-center">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              GenSyn Playground
            </h1>
            <p className="text-xl mt-4 text-gray-400">Real ML training • Live proofs • Earn fake $SY</p>
          </div>

          {!running ? (
            <div className="space-y-6">
              <select
                value={gpu.name}
                onChange={(e) => setGpu(gpus.find((g) => g.name === e.target.value)!)}
                className="w-full p-4 bg-gray-900 border border-purple-600 rounded-xl text-xl"
              >
                {gpus.map((g) => (
                  <option key={g.name}>{g.name} ({g.power}W)</option>
                ))}
              </select>

              <button
                onClick={() => setRunning(true)}
                className="w-full py-6 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl text-2xl font-bold hover:scale-105 transition"
              >
                <Play className="inline mr-3" /> Start Node
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold text-green-400">
                  +{earnings.toFixed(2)} $SY
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setPaused(!paused)} className="p-3 bg-yellow-600 rounded-lg">
                    {paused ? <Play /> : <Pause />}
                  </button>
                  <button onClick={() => { setRunning(false); setPaused(false); }} className="p-3 bg-red-600 rounded-lg">
                    Stop
                  </button>
                </div>
              </div>

              <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                  animate={{ width: `${progress}%` }}
                />
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 h-80 overflow-y-auto font-mono text-sm">
                {logs.map((log, i) => (
                  <div key={i} className="text-green-400">{log}</div>
                ))}
                <div ref={logsEndRef} />
              </div>

              {/* Neural net visualizer */}
              <div className="grid grid-cols-8 gap-2">
                {Array(32).fill(0).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-6 h-6 bg-purple-600 rounded-full"
                    animate={{
                      scale: running && !paused ? [1, 1.5, 1] : 1,
                      opacity: running && !paused ? [0.5, 1, 0.5] : 0.4,
                    }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.05 }}
                  />
                ))}
              </div>

              <button
                onClick={() => navigator.clipboard.writeText(`I earned ${earnings.toFixed(2)} $SY on GenSyn Playground! https://gensynplayground.vercel.app`)}
                className="w-full py-4 bg-gray-800 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-700 transition"
              >
                <Share2 size={20} /> Copy Share Link
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
