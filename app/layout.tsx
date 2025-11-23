"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Share2, Volume2 } from "lucide-react";
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
    setLogs(prev => [...prev, msg]);
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

  const startNode = async () => {
    setRunning(true);
    setLogs([]);
    setEarnings(0);
    setProgress(0);
    addLog("🚀 Node started — " + gpu.name);
    addLog("🔗 Connected to GenSyn swarm");

    // Simulate job loop
    while (running) {
      if (paused) {
        await new Promise(r => setTimeout(r, 500));
        continue;
      }

      const job = jobs[Math.floor(Math.random() * jobs.length)];
      addLog(`📦 New job: ${job.name}`);
      playSound(600);

      // Real tiny training with TF.js
      const model = tf.sequential({
        layers: [
          tf.layers.dense({ units: 32, activation: "relu", inputShape: [10] }),
          tf.layers.dense({ units: 1, activation: "sigmoid" }),
        ],
      });
      model.compile({ optimizer: "adam", loss: "binaryCrossentropy" });

      const xs = tf.randomNormal([100, 10]);
      const ys = tf.randomUniform([100, 1]).greater(0.5);

      for (let i = 0; i < 12; i++) {
        if (!running || paused) break;
        const h = await model.fit(xs, ys, { epochs: 1 });
        const loss = Array.isArray(h.history.loss) ? h.history.loss[0] : h.history.loss;
        addLog(`   Epoch ${i + 1}/12 → loss: ${loss.toFixed(4)}`);
        setProgress(((i + 1) / 12) * 100);
        await new Promise(r => setTimeout(r, 400 / gpu.speed));
      }

      xs.dispose();
      ys.dispose();

      if (running && !paused) {
        const reward = (job.reward * gpu.speed).toFixed(2);
        setEarnings(prev => prev + parseFloat(reward));
        addLog(`✅ Proof verified! +${reward} $SY earned`);
        playSound(1000);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  };

  useEffect(() => {
    if (running) startNode();
    return () => setRunning(false);
  }, [running, paused, gpu]);

  return (
    <>
      <AnimatePresence>{showConfetti && <Confetti recycle={false} />}</AnimatePresence>

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
                onChange={e => setGpu(gpus.find(g => g.name === e.target.value)!)}
                className="w-full p-4 bg-gray-900 border border-purple-600 rounded-xl text-xl"
              >
                {gpus.map(g => (
                  <option key={g
