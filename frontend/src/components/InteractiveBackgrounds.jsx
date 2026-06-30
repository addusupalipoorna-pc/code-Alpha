import { useEffect, useRef } from 'react';

// 1. Neural Mesh Canvas
export function NeuralMeshBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 1,
      });
    }

    let mouse = { x: null, y: null, radius: 120 };
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            p.x -= (dx / dist) * force * 0.5;
            p.y -= (dy / dist) * force * 0.5;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34, 211, 238, 0.45)';
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-auto z-0 opacity-80" />;
}

// 2. Fluid Gradient Orbs CSS
export function FluidOrbsBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-60">
      <div className="absolute top-1/4 left-1/4 w-[380px] h-[380px] rounded-full bg-indigo-600/15 blur-[80px] animate-orb-drift-1" />
      <div className="absolute top-1/3 right-1/4 w-[420px] h-[420px] rounded-full bg-cyan-600/15 blur-[90px] animate-orb-drift-2" />
      <div className="absolute bottom-1/4 left-1/3 w-[360px] h-[360px] rounded-full bg-purple-600/15 blur-[80px] animate-orb-drift-3" />
    </div>
  );
}

// 3. Cybernetic Data Globe Canvas
export function CyberneticGlobeBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let rotation = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.32;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      rotation += 0.0018;

      ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
      ctx.lineWidth = 0.8;
      for (let i = -4; i <= 4; i++) {
        const r = Math.sqrt(radius * radius - (i * radius / 5) * (i * radius / 5));
        ctx.beginPath();
        ctx.ellipse(0, i * radius / 5, r, r * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * Math.abs(Math.sin(i * Math.PI / 5)), 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(34, 211, 238, 0.16)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(236, 72, 153, 0.28)';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(236, 72, 153, 0.4)';

      for (let j = 0; j < 3; j++) {
        const offset = j * 40;
        ctx.beginPath();
        ctx.arc(-radius * 0.4, -radius * 0.2, radius * 0.5 + Math.sin(rotation + offset) * 5, 1.2, 4.8);
        ctx.stroke();
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80" />;
}

// 4. Prismatic Light Leaks Canvas
export function PrismaticLightBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      time += 0.0025;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const grad = ctx.createLinearGradient(
        canvas.width * (0.2 + Math.sin(time) * 0.1),
        0,
        canvas.width * (0.8 + Math.cos(time * 0.8) * 0.1),
        canvas.height
      );

      const alpha1 = 0.03 + Math.sin(time * 1.2) * 0.015;
      const alpha2 = 0.04 + Math.cos(time) * 0.02;
      const alpha3 = 0.03 + Math.sin(time * 0.7) * 0.015;

      grad.addColorStop(0, `rgba(99, 102, 241, ${alpha1})`);     // Indigo
      grad.addColorStop(0.3, `rgba(34, 211, 238, ${alpha2})`);   // Cyan
      grad.addColorStop(0.7, `rgba(236, 72, 153, ${alpha3})`);   // Pink
      grad.addColorStop(1, `rgba(168, 85, 247, ${alpha1})`);     // Purple

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}
