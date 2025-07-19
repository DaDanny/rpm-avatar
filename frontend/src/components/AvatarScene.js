import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Sphere } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

function AvatarScene({ avatarUrl, isAvatarSpeaking }) {
  const avatarRef = useRef();
  const groupRef = useRef();
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [mixer, setMixer] = useState(null);

  useEffect(() => {
    if (!avatarUrl) {
      setAvatar(null);
      setMixer(null);
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
        
        // Set up new avatar for conference call view
        const newAvatar = gltf.scene;
        
        // Scale and position for head/shoulders view
        newAvatar.scale.setScalar(1.2);
        
        // Center the avatar and position for upper body view
        const box = new THREE.Box3().setFromObject(newAvatar);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Position avatar so head/shoulders are centered
        newAvatar.position.x = -center.x;
        newAvatar.position.y = -center.y + size.y * 0.15; // Show from chest up
        newAvatar.position.z = -center.z;
        
        newAvatar.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Enhance materials for professional look
            if (child.material) {
              child.material.roughness = 0.7;
              child.material.metalness = 0.1;
              child.material.envMapIntensity = 0.8;
            }
          }
        });
        
        // Set up animations if available
        const newMixer = gltf.animations.length > 0 ? new THREE.AnimationMixer(newAvatar) : null;
        
        setAvatar(newAvatar);
        setMixer(newMixer);
        setIsLoading(false);
        
        console.log('Avatar loaded for conference call view');
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

  useFrame((state, delta) => {
    if (mixer) {
      mixer.update(delta);
    }

    if (avatarRef.current) {
      const time = state.clock.elapsedTime;
      
      if (isAvatarSpeaking) {
        // Subtle speaking animations focused on head/neck area
        const speakingIntensity = 0.6;
        const headNod = Math.sin(time * 6) * 0.008 * speakingIntensity;
        const headTurn = Math.sin(time * 4) * 0.012 * speakingIntensity;
        const shoulderShift = Math.sin(time * 3) * 0.005 * speakingIntensity;
        
        // Natural head movements during conversation
        avatarRef.current.rotation.x = headNod;
        avatarRef.current.rotation.y = headTurn;
        avatarRef.current.rotation.z = shoulderShift;
        
        // Subtle breathing motion
        const breathe = Math.sin(time * 2) * 0.003;
        avatarRef.current.position.y = breathe;
        
        // Animate facial expressions if morph targets available
        if (avatar) {
          avatar.traverse((child) => {
            if (child.isMesh && child.morphTargetInfluences) {
              const morphIntensity = Math.abs(Math.sin(time * 10)) * 0.4;
              // Animate mouth/jaw movements
              if (child.morphTargetInfluences.length > 0) {
                child.morphTargetInfluences[0] = morphIntensity;
              }
              if (child.morphTargetInfluences.length > 1) {
                child.morphTargetInfluences[1] = morphIntensity * 0.5;
              }
            }
          });
        }
      } else {
        // Idle breathing and micro-movements
        const idleBreathe = Math.sin(time * 1.5) * 0.002;
        const idleSway = Math.sin(time * 0.8) * 0.003;
        
        avatarRef.current.rotation.x = idleBreathe;
        avatarRef.current.rotation.y = idleSway;
        avatarRef.current.rotation.z = 0;
        avatarRef.current.position.y = idleBreathe;
        
        // Reset facial expressions
        if (avatar) {
          avatar.traverse((child) => {
            if (child.isMesh && child.morphTargetInfluences) {
              child.morphTargetInfluences.forEach((_, i) => {
                child.morphTargetInfluences[i] = 0;
              });
            }
          });
        }
      }
    }
  });

  return (
    <>
      {/* Professional conference lighting setup */}
      <ambientLight intensity={0.6} color="#ffffff" />
      
      {/* Key light - main illumination */}
      <directionalLight 
        position={[2, 3, 2]} 
        intensity={1.5} 
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      
      {/* Fill light - soften shadows */}
      <directionalLight 
        position={[-1, 2, 1]} 
        intensity={0.4} 
        color="#f0f8ff"
      />
      
      {/* Rim light - separation from background */}
      <directionalLight 
        position={[0, 1, -2]} 
        intensity={0.3} 
        color="#e6f3ff"
      />
      
      {/* Subtle background sphere for depth */}
      <Sphere args={[8, 32, 32]} position={[0, 0, -3]}>
        <meshBasicMaterial 
          color="#f8fafe" 
          transparent 
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {avatar && (
        <group ref={groupRef} position={[0, 0, 0]}>
          <group ref={avatarRef}>
            <primitive object={avatar} />
          </group>
          
          {/* Subtle ground reflection */}
          <ContactShadows 
            position={[0, -1.2, 0]}
            opacity={0.2}
            scale={3}
            blur={2}
            far={1}
            color="#1a1a1a"
          />
        </group>
      )}
      
      {/* Loading indicator with professional styling */}
      {isLoading && (
        <group position={[0, 0, 0]}>
          <Sphere args={[0.15, 16, 16]}>
            <meshStandardMaterial 
              color="#667eea" 
              emissive="#667eea"
              emissiveIntensity={0.3}
              transparent
              opacity={0.8}
            />
          </Sphere>
          <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.12, 0.03, 8, 16]} />
            <meshStandardMaterial 
              color="#764ba2"
              emissive="#764ba2"
              emissiveIntensity={0.4}
            />
          </mesh>
        </group>
      )}
      
      {/* Error indicator */}
      {loadError && (
        <group position={[0, 0, 0]}>
          <Sphere args={[0.3, 16, 16]}>
            <meshStandardMaterial 
              color="#ff6b6b" 
              emissive="#ff6b6b"
              emissiveIntensity={0.2}
            />
          </Sphere>
        </group>
      )}
      
      {/* Professional avatar placeholder when no avatar loaded */}
      {!avatarUrl && !isLoading && (
        <group position={[0, 0.2, 0]}>
          {/* Head */}
          <Sphere args={[0.25, 16, 16]} position={[0, 0.3, 0]}>
            <meshStandardMaterial 
              color="#e8eaf0"
              roughness={0.8}
              metalness={0.1}
            />
          </Sphere>
          
          {/* Shoulders/torso */}
          <mesh position={[0, -0.1, 0]} scale={[0.8, 0.6, 0.5]}>
            <cylinderGeometry args={[0.3, 0.35, 0.6, 16]} />
            <meshStandardMaterial 
              color="#d1d5db"
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
          
          {/* Professional suit collar suggestion */}
          <mesh position={[0, 0.05, 0.15]} scale={[0.6, 0.3, 0.1]}>
            <boxGeometry args={[0.5, 0.2, 0.1]} />
            <meshStandardMaterial 
              color="#374151"
              roughness={0.6}
              metalness={0.2}
            />
          </mesh>
        </group>
      )}
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={1.5}
        maxDistance={3}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
        target={[0, 0.2, 0]}
        autoRotate={false}
      />
      
      <Environment 
        preset="studio"
        background={false}
        environmentIntensity={0.3}
      />
    </>
  );
}

export default AvatarScene;