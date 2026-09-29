import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function wav(samples, sampleRate = 22050) {
  const dataSize = samples.length * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  return buf;
}

function tone(duration, fn) {
  const sr = 22050;
  const n = Math.floor(sr * duration);
  const samples = new Float64Array(n);
  for (let i = 0; i < n; i++) samples[i] = fn(i / sr);
  return wav(samples, sr);
}

const yes = tone(0.58, (t) => {
  const env = Math.min(1, t * 45) * Math.exp(-t * 3.1);
  return (
    0.2 *
    env *
    (Math.sin(2 * Math.PI * 523.25 * t) +
      0.55 * Math.sin(2 * Math.PI * 783.99 * t) +
      0.2 * Math.sin(2 * Math.PI * 1046.5 * t))
  );
});

const no = tone(0.52, (t) => {
  const env = Math.min(1, t * 18) * Math.exp(-t * 3.8);
  return 0.18 * env * Math.sin(2 * Math.PI * (196 - t * 40) * t);
});

const dir = path.join(__dirname, "..", "assets", "sounds");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "yes.wav"), yes);
fs.writeFileSync(path.join(dir, "no.wav"), no);
console.log("wrote assets/sounds/yes.wav and no.wav");
