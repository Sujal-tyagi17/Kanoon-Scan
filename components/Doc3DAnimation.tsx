"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface Doc3DAnimationProps {
  className?: string;
}

export default function Doc3DAnimation({ className = "w-full h-full" }: Doc3DAnimationProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    
    // Add subtle fog to the scene for depth
    // Add subtle fog to the scene for depth matching new gold background
    scene.fog = new THREE.FogExp2(0x080600, 0.12);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Primary Gold Light
    const goldLight = new THREE.PointLight(0xf5a623, 3, 20);
    goldLight.position.set(5, 5, 5);
    scene.add(goldLight);

    // Secondary Warm Amber Light
    const amberLight = new THREE.PointLight(0xffc880, 2, 20);
    amberLight.position.set(-5, -3, 3);
    scene.add(amberLight);

    // Group to hold the document and scanner assembly
    const group = new THREE.Group();
    scene.add(group);

    // 1. Perspective Grid at the bottom (colored gold)
    const grid = new THREE.GridHelper(12, 24, 0xf5a623, 0x23200f);
    grid.position.y = -2.8;
    grid.rotation.x = 0.1;
    scene.add(grid);

    // 2. Holographic Document body
    const docGeo = new THREE.BoxGeometry(2.2, 3.2, 0.08);
    const docMat = new THREE.MeshPhongMaterial({
      color: 0x110e02,
      shininess: 90,
      transparent: true,
      opacity: 0.85,
      specular: new THREE.Color(0xf5a623),
    });
    const docMesh = new THREE.Mesh(docGeo, docMat);
    group.add(docMesh);

    // Wireframe overlay for the holographic gold edge look
    const wireGeo = new THREE.EdgesGeometry(docGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0xffc880, linewidth: 2 });
    const wireframe = new THREE.LineSegments(wireGeo, wireMat);
    docMesh.add(wireframe);

    // 3. Document text lines
    const textGroup = new THREE.Group();
    docMesh.add(textGroup);
    
    const linesCount = 10;
    const lineMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < linesCount; i++) {
      const isHighlighted = i === 2 || i === 6;
      const lineWidth = isHighlighted ? 1.0 : Math.random() * 0.4 + 1.1;
      const lineGeo = new THREE.BoxGeometry(lineWidth, 0.06, 0.02);
      const lineMat = new THREE.MeshBasicMaterial({
        color: isHighlighted ? 0xffc880 : 0xffffff,
        transparent: true,
        opacity: isHighlighted ? 0.95 : 0.35,
      });
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.position.y = 1.1 - i * 0.24;
      lineMesh.position.x = (2.2 - lineWidth) / 2 - 0.45; // left align
      lineMesh.position.z = 0.05;
      textGroup.add(lineMesh);
      lineMeshes.push(lineMesh);
    }

    // 4. Oscillating Laser Scan Line (Gold)
    const laserGeo = new THREE.BoxGeometry(2.4, 0.06, 0.12);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0xf5a623,
      transparent: true,
      opacity: 0.8,
    });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.position.z = 0.06;
    group.add(laser);

    // Laser glow aura
    const laserGlowGeo = new THREE.BoxGeometry(2.5, 0.3, 0.15);
    const laserGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffc880,
      transparent: true,
      opacity: 0.25,
    });
    const laserGlow = new THREE.Mesh(laserGlowGeo, laserGlowMat);
    laser.add(laserGlow);

    // 5. Orbiting Extraction Nodes (Spheres)
    const nodeCount = 3;
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const nodeColors = [0xffc880, 0xf5a623, 0xffe16d];
    const nodes: THREE.Mesh[] = [];
    const connectionLines: THREE.Line[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const sGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const sMat = new THREE.MeshPhongMaterial({
        color: nodeColors[i],
        emissive: nodeColors[i],
        emissiveIntensity: 0.6,
        shininess: 100,
      });
      const sphere = new THREE.Mesh(sGeo, sMat);
      nodeGroup.add(sphere);
      nodes.push(sphere);

      // Connecting line geometry
      const linePoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: nodeColors[i],
        transparent: true,
        opacity: 0.5,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
      connectionLines.push(line);
    }

    // 6. Floating Background Particle Cloud
    const particleCount = 100;
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      // Random coordinates in a shell around the center
      particlePositions[i] = (Math.random() - 0.5) * 10;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8 - 2;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMat = new THREE.PointsMaterial({
      color: 0xffddb4,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });
    
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    camera.position.z = 5.2;

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      // 1. Ambient hovering of the document
      group.position.y = Math.sin(time * 1.2) * 0.12;
      group.position.x = Math.cos(time * 0.8) * 0.05;

      // 2. Mouse tracking rotation (interpolated)
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, mouseX * 0.4, 0.05);
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, -mouseY * 0.3 + 0.1, 0.05);

      // 3. Oscillating scanning bar
      laser.position.y = Math.sin(time * 2.0) * 1.4;

      // Pulse highlight lines when laser passes them
      lineMeshes.forEach((line) => {
        const dist = Math.abs(line.position.y - laser.position.y);
        if (dist < 0.25) {
          (line.material as THREE.MeshBasicMaterial).opacity = 1.0;
        } else {
          // fade back
          const isHigh = lineMeshes.indexOf(line) === 2 || lineMeshes.indexOf(line) === 6;
          (line.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
            (line.material as THREE.MeshBasicMaterial).opacity,
            isHigh ? 0.95 : 0.35,
            0.1
          );
        }
      });

      // 4. Orbiting nodes & connecting lines
      nodes.forEach((node, idx) => {
        const angle = time * 0.7 + (idx * Math.PI * 2) / nodeCount;
        const radius = 2.2 + Math.sin(time * 1.5 + idx) * 0.3;
        
        // Position relative to hovering document
        node.position.x = group.position.x + Math.cos(angle) * radius;
        node.position.y = group.position.y + Math.sin(angle * 1.5) * 1.2;
        node.position.z = Math.sin(angle) * 1.5 + 0.5;

        // Animate node size pulsing
        const scale = 1.0 + Math.sin(time * 3 + idx) * 0.15;
        node.scale.set(scale, scale, scale);

        // Update connection line coordinates
        const line = connectionLines[idx];
        const positions = new Float32Array([
          group.position.x, group.position.y + (idx - 1) * 0.5, 0, // connection anchor point on document
          node.position.x, node.position.y, node.position.z
        ]);
        line.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        line.geometry.attributes.position.needsUpdate = true;
      });

      // 5. Slowly rotate background particles
      particles.rotation.y = time * 0.02;
      particles.rotation.x = time * 0.01;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      
      // Clean up geometries and materials
      docGeo.dispose();
      docMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      laserGeo.dispose();
      laserMat.dispose();
      laserGlowGeo.dispose();
      laserGlowMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      
      nodes.forEach((n) => {
        n.geometry.dispose();
        (n.material as THREE.Material).dispose();
      });
      connectionLines.forEach((l) => {
        l.geometry.dispose();
        (l.material as THREE.Material).dispose();
      });
      
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className={className} />;
}
