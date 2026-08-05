import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Box } from '@react-three/drei';
import { motion } from 'framer-motion';

const RotatingBox = () => {
  return (
    <Box args={[1, 1, 1]}> 
      <meshStandardMaterial color="#ff6b6b" />
    </Box>
  );
};

export const ThreeScene: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full h-full"
    >
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <RotatingBox />
          <OrbitControls enableZoom={true} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        </Suspense>
      </Canvas>
    </motion.div>
  );
};
