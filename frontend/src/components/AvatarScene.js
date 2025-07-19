import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, Sphere } from '@react-three/drei';
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
        
        // Set up new avatar for girlfriend view
        const newAvatar = gltf.scene;
        
        // Scale appropriately for intimate conversation
        newAvatar.scale.setScalar(2.2);
        
        // Better positioning to show face and upper body
        const box = new THREE.Box3().setFromObject(newAvatar);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Position to show from stomach up
        newAvatar.position.x = -center.x;
        newAvatar.position.y = -center.y + size.y * 0.180; // Show from stomach up to include face and torso
        newAvatar.position.z = -center.z - 0.7; // Slightly forward
        
        newAvatar.traverse((child) => {
          if (child.isMesh && child.material) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Enhanced materials for girlfriend aesthetic - with proper null checks
            if (child.material.roughness !== undefined) {
              child.material.roughness = 0.6;
            }
            if (child.material.metalness !== undefined) {
              child.material.metalness = 0.05;
            }
            if (child.material.envMapIntensity !== undefined) {
              child.material.envMapIntensity = 1.2;
            }
            
            // Add subtle glow to skin materials - with proper checks
            if (child.material.name && child.material.name.includes('skin')) {
              if (child.material.emissive !== undefined) {
                child.material.emissive = new THREE.Color(0xffeee6);
              }
              if (child.material.emissiveIntensity !== undefined) {
                child.material.emissiveIntensity = 0.05;
              }
            }
          }
        });
        
        // Set up animations if available
        const newMixer = gltf.animations.length > 0 ? new THREE.AnimationMixer(newAvatar) : null;
        
        setAvatar(newAvatar);
        setMixer(newMixer);
        setIsLoading(false);
        
        console.log('Girlfriend avatar loaded for intimate chat');
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
        // Natural speaking animations for girlfriend
        const speakingIntensity = 0.8;
        const headNod = Math.sin(time * 5) * 0.012 * speakingIntensity;
        const headTilt = Math.sin(time * 3.5) * 0.008 * speakingIntensity;
        const eyeBlink = Math.sin(time * 8) * 0.004 * speakingIntensity;
        
        // Expressive head movements
        avatarRef.current.rotation.x = headNod + eyeBlink;
        avatarRef.current.rotation.y = headTilt;
        avatarRef.current.rotation.z = Math.sin(time * 2.5) * 0.006 * speakingIntensity;
        
        // Breathing and subtle body movement
        const breathe = Math.sin(time * 2.2) * 0.008;
        avatarRef.current.position.y = breathe;
        
        // Enhanced facial expressions with proper null checks
        if (avatar) {
          avatar.traverse((child) => {
            if (child.isMesh && child.morphTargetInfluences && child.morphTargetInfluences.length > 0) {
              const morphIntensity = Math.abs(Math.sin(time * 12)) * 0.6;
              const expressiveness = Math.abs(Math.sin(time * 4)) * 0.3;
              
              // Safely animate morph targets
              try {
                if (child.morphTargetInfluences[0] !== undefined) {
                  child.morphTargetInfluences[0] = morphIntensity;
                }
                if (child.morphTargetInfluences[1] !== undefined) {
                  child.morphTargetInfluences[1] = morphIntensity * 0.7;
                }
                if (child.morphTargetInfluences[2] !== undefined) {
                  child.morphTargetInfluences[2] = expressiveness;
                }
              } catch (error) {
                console.warn('Morph target animation error:', error);
              }
            }
          });
        }
      } else {
        // Natural idle animations - no floating, more realistic movements
        const subtleBreathe = Math.sin(time * 2.1) * 0.003; // Very subtle breathing
        const gentleGaze = Math.sin(time * 0.5) * 0.006; // Slow head turns
        const microTilt = Math.sin(time * 0.3) * 0.002; // Micro head tilts
        
        // Remove floating - keep position stable, only subtle rotations
        avatarRef.current.rotation.x = subtleBreathe;
        avatarRef.current.rotation.y = gentleGaze;
        avatarRef.current.rotation.z = microTilt;
        // No position.y changes = no floating!
        
        // Enhanced idle animations with hand/arm movements
        if (avatar) {
          avatar.traverse((child) => {
            // Hand and arm animations
            if (child.name && (child.name.includes('Arm') || child.name.includes('Hand') || child.name.includes('Finger'))) {
              const handTime = time * 0.8;
              const isRightSide = child.name.includes('Right') || child.name.includes('_R');
              const sideMultiplier = isRightSide ? 1 : -1;
              
              // Gentle hand gestures - like adjusting hair or resting position
              if (child.name.includes('Shoulder')) {
                child.rotation.z = Math.sin(handTime * 0.6) * 0.02 * sideMultiplier;
              }
              if (child.name.includes('UpperArm')) {
                child.rotation.x = Math.sin(handTime * 0.4) * 0.03;
                child.rotation.z = Math.sin(handTime * 0.5) * 0.015 * sideMultiplier;
              }
              if (child.name.includes('ForeArm')) {
                child.rotation.y = Math.sin(handTime * 0.7) * 0.02 * sideMultiplier;
              }
              if (child.name.includes('Hand')) {
                // Subtle hand movements - like fidgeting or gesturing
                child.rotation.x = Math.sin(handTime * 1.2) * 0.01;
                child.rotation.y = Math.sin(handTime * 0.9) * 0.015 * sideMultiplier;
              }
            }
            
            // Facial expressions and eye movements
            if (child.isMesh && child.morphTargetInfluences && child.morphTargetInfluences.length > 0) {
              try {
                // Natural blinking pattern
                const blinkCycle = Math.sin(time * 0.3) * 0.5 + 0.5; // Slower, more natural
                const blinkIntensity = blinkCycle > 0.95 ? Math.sin(time * 15) * 0.3 : 0; // Quick blinks
                
                // Subtle expressions - looking thoughtful, slight smiles
                const expressionCycle = Math.sin(time * 0.15) * 0.5 + 0.5;
                const smileIntensity = expressionCycle > 0.7 ? 0.1 : 0.02;
                
                for (let i = 0; i < child.morphTargetInfluences.length; i++) {
                  if (child.morphTargetInfluences[i] !== undefined) {
                    if (i === 0) {
                      child.morphTargetInfluences[i] = blinkIntensity; // Blink
                    } else if (i === 1) {
                      child.morphTargetInfluences[i] = smileIntensity; // Smile
                    } else {
                      child.morphTargetInfluences[i] = Math.sin(time * 0.2 + i) * 0.01; // Subtle expressions
                    }
                  }
                }
              } catch (error) {
                console.warn('Idle morph target animation error:', error);
              }
            }
          });
        }
      }
    }
  });

  return (
    <>
      {/* Home Office Lighting Setup */}
      <ambientLight intensity={0.6} color="#f8f9fa" />
      
      {/* Main office lighting - natural daylight */}
      <directionalLight 
        position={[3, 5, 2]} 
        intensity={1.2} 
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      
      {/* Soft fill light from window */}
      <directionalLight 
        position={[-2, 3, 1]} 
        intensity={0.4} 
        color="#e3f2fd"
      />
      
      {/* Warm desk lamp light */}
      <pointLight 
        position={[-1.5, 1, -1]} 
        intensity={0.3} 
        color="#fff3e0"
        distance={3}
      />
      
             {/* No background in 3D scene - using CSS background instead */}
      
      {avatar && (
        <group ref={groupRef} position={[0, -0.5, 0]}>
          <group ref={avatarRef}>
            <primitive object={avatar} />
          </group>
          
          {/* Soft ground reflection */}
          <ContactShadows 
            position={[0, -1.8, 0]}
            opacity={0.15}
            scale={4}
            blur={3}
            far={2}
            color="#ff69b4"
          />
        </group>
      )}
      
      {/* Loading indicator with romantic styling */}
      {isLoading && (
        <group position={[0, 0, 0]}>
          <Sphere args={[0.2, 16, 16]}>
            <meshStandardMaterial 
              color="#ff69b4" 
              transparent
              opacity={0.9}
            />
          </Sphere>
          <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.15, 0.04, 8, 16]} />
            <meshStandardMaterial 
              color="#e879f9"
            />
          </mesh>
        </group>
      )}
      
      {/* Error indicator */}
      {loadError && (
        <group position={[0, 0, 0]}>
          <Sphere args={[0.4, 16, 16]}>
            <meshStandardMaterial 
              color="#ff6b6b" 
            />
          </Sphere>
        </group>
      )}
      
      {/* Girlfriend placeholder when no avatar loaded */}
      {!avatarUrl && !isLoading && (
        <group position={[0, 0.4, 0]}>
          {/* Head with feminine features */}
          <Sphere args={[0.3, 16, 16]} position={[0, 0.4, 0]}>
            <meshStandardMaterial 
              color="#fce4ec"
              roughness={0.4}
              metalness={0.1}
            />
          </Sphere>
          
          {/* Body/shoulders */}
          <mesh position={[0, -0.05, 0]} scale={[0.9, 0.7, 0.6]}>
            <cylinderGeometry args={[0.35, 0.4, 0.7, 16]} />
            <meshStandardMaterial 
              color="#f8bbd9"
              roughness={0.6}
              metalness={0.1}
            />
          </mesh>
          
          {/* Hair suggestion */}
          <Sphere args={[0.35, 16, 16]} position={[0, 0.55, -0.1]}>
            <meshStandardMaterial 
              color="#8b4513"
              roughness={0.8}
              metalness={0.05}
            />
          </Sphere>
        </group>
      )}
      
      {/* No camera controls - fixed romantic view */}
      
      <Environment 
        preset="sunset"
        background={false}
        environmentIntensity={0.4}
      />
    </>
  );
}

export default AvatarScene;