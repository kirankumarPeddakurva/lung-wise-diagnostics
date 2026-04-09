import { useRef, useState, useEffect } from "react";
import type { Drug } from "@/lib/mockData";

interface MoleculeViewerProps {
  drug: Drug;
}

const MoleculeViewer = ({ drug }: MoleculeViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoom, setZoom] = useState(1);

  const project = (x: number, y: number, z: number) => {
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);

    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;
    const x1 = x * cosY + z1 * sinY;
    const z2 = -x * sinY + z1 * cosY;

    const scale = 80 * zoom;
    const perspective = 5;
    const factor = perspective / (perspective + z2);

    return { px: x1 * scale * factor, py: y1 * scale * factor, depth: z2 };
  };

  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRotationY((r) => r + 0.02);
    }, 30);
    return () => clearInterval(interval);
  }, [autoRotate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Draw bonds
    ctx.lineWidth = 2;
    drug.bonds.forEach(([a, b]) => {
      const atomA = drug.atoms[a];
      const atomB = drug.atoms[b];
      if (!atomA || !atomB) return;
      const pA = project(atomA.x, atomA.y, atomA.z);
      const pB = project(atomB.x, atomB.y, atomB.z);
      ctx.strokeStyle = `rgba(150, 180, 220, ${0.4 + Math.min(pA.depth, pB.depth) * 0.1})`;
      ctx.beginPath();
      ctx.moveTo(cx + pA.px, cy + pA.py);
      ctx.lineTo(cx + pB.px, cy + pB.py);
      ctx.stroke();
    });

    // Sort atoms by depth for proper rendering
    const projected = drug.atoms.map((atom, i) => ({
      ...atom,
      ...project(atom.x, atom.y, atom.z),
      index: i,
    }));
    projected.sort((a, b) => a.depth - b.depth);

    projected.forEach((atom) => {
      const size = (12 + atom.depth * 2) * zoom;
      const gradient = ctx.createRadialGradient(
        cx + atom.px - size * 0.2,
        cy + atom.py - size * 0.2,
        0,
        cx + atom.px,
        cy + atom.py,
        size
      );
      gradient.addColorStop(0, atom.color + "ff");
      gradient.addColorStop(0.7, atom.color + "cc");
      gradient.addColorStop(1, atom.color + "66");

      ctx.beginPath();
      ctx.arc(cx + atom.px, cy + atom.py, Math.max(size, 4), 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Label
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.max(9, 11 * zoom)}px Inter`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(atom.element, cx + atom.px, cy + atom.py);
    });
  }, [rotationX, rotationY, zoom, drug]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    setRotationY((r) => r + dx * 0.01);
    setRotationX((r) => r + dy * 0.01);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.5, Math.min(2.5, z - e.deltaY * 0.001)));
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={320}
        height={280}
        className="w-full rounded-lg bg-medical-dark cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      <div className="absolute bottom-2 left-2 flex gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className="px-2 py-1 text-xs rounded bg-primary/80 text-primary-foreground hover:bg-primary transition-colors"
        >
          {autoRotate ? "Pause" : "Rotate"}
        </button>
        <button
          onClick={() => { setZoom(1); setRotationX(0); setRotationY(0); setAutoRotate(true); }}
          className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground hover:bg-accent transition-colors"
        >
          Reset
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-1 text-center">Drag to rotate · Scroll to zoom</p>
    </div>
  );
};

export default MoleculeViewer;
