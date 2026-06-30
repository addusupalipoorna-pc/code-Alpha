import { useEffect, useRef } from 'react';

export default function VoiceSpectrum({ stream }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let audioContext;
    let analyser;
    let source;
    let dataArray;

    const width = canvas.width;
    const height = canvas.height;

    // Real audio analysis if stream is active
    if (stream) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContextClass();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64; // Small size for simple bars
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
      } catch (err) {
        console.warn('Could not initialize audio analyzer:', err);
      }
    }

    let phase = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / dataArray.length) * 0.95;
        let barHeight;
        let x = 0;

        // Draw frequency bars
        for (let i = 0; i < dataArray.length; i++) {
          barHeight = (dataArray[i] / 255) * height * 0.85;

          // Glowing purple/cyan gradient
          const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
          grad.addColorStop(0, 'rgba(124, 58, 237, 0.2)'); // Violet
          grad.addColorStop(1, 'rgba(34, 211, 238, 0.95)'); // Cyan

          ctx.fillStyle = grad;
          // Round caps
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          x += barWidth + 3;
        }
      } else {
        // Fallback procedural smooth sinewave animation
        phase += 0.15;
        ctx.beginPath();
        ctx.lineWidth = 2.5;

        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, '#7c3aed');
        grad.addColorStop(0.5, '#22d3ee');
        grad.addColorStop(1, '#6366f1');
        ctx.strokeStyle = grad;

        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.05 + phase) * 12 * Math.sin(phase * 0.2);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Second overlay wave
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.25)';
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.cos(x * 0.04 - phase) * 8 * Math.sin(phase * 0.1);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [stream]);

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/60 border border-white/5 backdrop-blur-md">
      <canvas ref={canvasRef} width={280} height={40} className="w-[280px] h-[40px] block" />
      <div className="flex items-center gap-1.5 mt-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Listening... speak now</span>
      </div>
    </div>
  );
}
