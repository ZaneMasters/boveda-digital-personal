import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function AnimatedBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 -> 1
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Use springs for smooth, delayed following
  const springConfig = { damping: 25, stiffness: 50 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Parallax offsets (moving inversely to mouse position)
  const offsetX1 = useTransform(springX, [-1, 1], [60, -60]);
  const offsetY1 = useTransform(springY, [-1, 1], [60, -60]);

  const offsetX2 = useTransform(springX, [-1, 1], [-80, 80]);
  const offsetY2 = useTransform(springY, [-1, 1], [-80, 80]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden" style={{ background: 'linear-gradient(135deg, #070B14 0%, #0F172A 100%)' }}>
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-100px] left-[-100px] w-[700px] h-[700px] rounded-full blur-[100px]"
        style={{ 
          background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(139,92,246,0) 70%)',
          x: offsetX1,
          y: offsetY1
        }}
      />
      <motion.div
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-200px] right-[-200px] w-[900px] h-[900px] rounded-full blur-[100px]"
        style={{ 
          background: 'radial-gradient(circle, rgba(59,130,246,0.20) 0%, rgba(59,130,246,0) 70%)',
          x: offsetX2,
          y: offsetY2
        }}
      />
    </div>
  );
}
