import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

function AvatarScene({ avatarUrl, isAvatarSpeaking }) {
  const avatarRef = useRef();
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!avatarUrl) {
      setAvatar(null);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    
    const loader = new GLTFLoader();
    
    loader.load(
      avatarUrl,
      (gltf) => {
        // Clean up previous avatar
        if (avatar) {
          avatar.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(material => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
        }
        
        // Set up new avatar
        const newAvatar = gltf.scene;
        newAvatar.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        setAvatar(newAvatar);
        setIsLoading(false);
        console.log('Avatar loaded successfully');
      },
      (progress) => {
        const percent = (progress.loaded / progress.total * 100);
        console.log('Loading progress:', percent + '%');
      },
      (error) => {
        console.error('Error loading avatar:', error);
        setLoadError(error.message);
        setIsLoading(false);
      }
    );
  }, [avatarUrl]);

  useFrame((state) => {
    if (avatarRef.current) {
      // Base idle animation - gentle swaying
      const idleMovement = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      
      if (isAvatarSpeaking) {
        // More animated movement when speaking
        const speakingMovement = Math.sin(state.clock.elapsedTime * 8) * 0.02;
        avatarRef.current.rotation.y = idleMovement + speakingMovement;
        avatarRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 6) * 0.01;
        
        // Slight head bobbing when speaking
        avatarRef.current.position.y = -1 + Math.sin(state.clock.elapsedTime * 4) * 0.01;
      } else {
        // Gentle idle animation
        avatarRef.current.rotation.y = idleMovement;
        avatarRef.current.rotation.x = 0;
        avatarRef.current.position.y = -1;
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.3} />
      <spotLight position={[0, 10, 0]} intensity={0.5} />
      
      {avatar && (
        <group ref={avatarRef} position={[0, -1, 0]}>
          <primitive object={avatar} />
        </group>
      )}
      
      {isLoading && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#61dafb" />
        </mesh>
      )}
      
      {loadError && (
        <group position={[0, 0, 0]}>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#ff4444" />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <planeGeometry args={[2, 0.5]} />
            <meshBasicMaterial color="#ff4444" />
          </mesh>
        </group>
      )}
      
      {!avatarUrl && !isLoading && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#444" />
        </mesh>
      )}
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={10}
        target={[0, 0, 0]}
      />
      
      <Environment preset="studio" />
    </>
  );
}

export default AvatarScene;