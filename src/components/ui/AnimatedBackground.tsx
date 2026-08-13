import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function AnimatedBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Disable heavy mouse tracking on mobile/touch devices
    const touchMedia = window.matchMedia('(hover: none) and (pointer: coarse)');
    if (touchMedia.matches) {
      setIsTouchDevice(true);
      return;
    }

    // Debounce/throttle mouse move slightly or use rAF, but framer-motion handles it well natively.
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const springConfig = { damping: 30, stiffness: 40 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const offsetX1 = useTransform(springX, [-1, 1], [40, -40]);
  const offsetY1 = useTransform(springY, [-1, 1], [40, -40]);

  const offsetX2 = useTransform(springX, [-1, 1], [-50, 50]);
  const offsetY2 = useTransform(springY, [-1, 1], [-50, 50]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#070B14]">
      {/* 
        PERFORMANCE FIX: 
        Removed `blur-[100px]` which tanks mobile GPU. 
        Instead we use a pure radial-gradient which achieves the same soft glow natively.
        Reduced animation frequency and ranges.
      */}
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full"
        style={{ 
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0) 60%)',
          x: isTouchDevice ? 0 : offsetX1,
          y: isTouchDevice ? 0 : offsetY1
        }}
      />
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-15%] right-[-15%] w-[700px] h-[700px] sm:w-[1000px] sm:h-[1000px] rounded-full"
        style={{ 
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0) 60%)',
          x: isTouchDevice ? 0 : offsetX2,
          y: isTouchDevice ? 0 : offsetY2
        }}
      />
    </div>
  );
}
