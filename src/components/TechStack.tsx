import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import {
  BallCollider,
  Physics,
  RigidBody,
  RapierRigidBody,
} from "@react-three/rapier";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const textureLoader = new THREE.TextureLoader();
const imageUrls = [
  "/images/python.webp",
  "/images/tensorflow.webp",
  "/images/react2.webp",
  "/images/node2.webp",
  "/images/mysql.webp",
  "/images/javascript.webp",
  "/images/typescript.webp",
  "/images/cpp.webp",
];
const textures = imageUrls.map((url) => textureLoader.load(url));

const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

// 30 spheres starting close together in a cluster
const spheres = [...Array(30)].map((_, i) => ({
  scale: [0.8, 1.0, 0.85, 1.05, 0.9][i % 5],
  materialIndex: i % textures.length,
  initialPos: [
    Math.sin(i * 1.3) * 2.5,
    Math.cos(i * 0.9) * 2.2 + 0.2,
    ((i % 5) - 2) * 1.0,
  ] as [number, number, number],
  phase: (i * Math.PI) / 15,
}));

type SphereProps = {
  scale: number;
  material: THREE.MeshPhysicalMaterial;
  isActive: boolean;
  initialPos: [number, number, number];
  phase: number;
  targetCenter: React.MutableRefObject<THREE.Vector3>;
};

function SphereGeo({
  scale,
  material,
  isActive,
  initialPos,
  phase,
  targetCenter,
}: SphereProps) {
  const api = useRef<RapierRigidBody | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  useFrame(({ clock }, delta) => {
    if (!isActive || !api.current) return;
    delta = Math.min(0.04, delta);

    // Subtle individual breathing offset so the cluster feels alive
    const t = clock.getElapsedTime() * 0.9 + phase;
    const center = targetCenter.current;

    const targetX = center.x + Math.sin(t) * 0.35;
    const targetY = center.y + Math.cos(t * 0.85) * 0.35;
    const targetZ = center.z + Math.sin(t * 0.6) * 0.25;

    const curr = api.current.translation();
    const dx = targetX - curr.x;
    const dy = targetY - curr.y;
    const dz = targetZ - curr.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Fluid attraction force pulling all spheres close together in a cohesive cluster
    const pullSpeed = Math.min(dist * 35 + 20, 80);
    const normX = dist > 0.001 ? (dx / dist) * pullSpeed : 0;
    const normY = dist > 0.001 ? (dy / dist) * pullSpeed : 0;
    const normZ = dist > 0.001 ? (dz / dist) * pullSpeed : 0;

    api.current.applyImpulse(
      new THREE.Vector3(
        normX * delta * scale,
        normY * delta * scale,
        normZ * delta * scale
      ),
      true
    );

    // Continuous rotation to display the technology logos
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.007;
      meshRef.current.rotation.x += 0.003;
    }
  });

  return (
    <RigidBody
      linearDamping={1.1}
      angularDamping={0.4}
      friction={0.15}
      restitution={0.65}
      position={initialPos}
      ref={api}
      colliders={false}
    >
      <BallCollider args={[scale * 1.02]} />
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        scale={scale}
        geometry={sphereGeometry}
        material={material}
        rotation={[0.3, 1, 1]}
      />
    </RigidBody>
  );
}

type PointerProps = {
  vec?: THREE.Vector3;
  isActive: boolean;
};

function Pointer({ vec = new THREE.Vector3(), isActive }: PointerProps) {
  const ref = useRef<RapierRigidBody>(null);

  useFrame(({ pointer, viewport }) => {
    if (!isActive) {
      ref.current?.setNextKinematicTranslation(new THREE.Vector3(100, 100, 100));
      return;
    }
    const targetVec = vec.lerp(
      new THREE.Vector3(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0
      ),
      0.3
    );
    ref.current?.setNextKinematicTranslation(targetVec);
  });

  return (
    <RigidBody
      position={[100, 100, 100]}
      type="kinematicPosition"
      colliders={false}
      ref={ref}
    >
      <BallCollider args={[2.3]} />
    </RigidBody>
  );
}

function TechCluster({
  isActive,
  materials,
}: {
  isActive: boolean;
  materials: THREE.MeshPhysicalMaterial[];
}) {
  const targetCenter = useRef(new THREE.Vector3(0, 0.2, 0));

  useFrame(({ pointer, viewport }) => {
    if (!isActive) {
      targetCenter.current.lerp(new THREE.Vector3(0, 0.2, 0), 0.05);
      return;
    }
    // Fluidly drift the entire cluster to follow mouse movement
    const destX = pointer.x * (viewport.width * 0.2);
    const destY = pointer.y * (viewport.height * 0.18) + 0.2;
    targetCenter.current.lerp(new THREE.Vector3(destX, destY, 0), 0.08);
  });

  return (
    <>
      <Pointer isActive={isActive} />
      {spheres.map((props, i) => (
        <SphereGeo
          key={i}
          {...props}
          material={materials[props.materialIndex]}
          isActive={isActive}
          targetCenter={targetCenter}
        />
      ))}
    </>
  );
}

const TechStack = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const techElem = document.querySelector(".techstack");
    if (!techElem) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(techElem);
    ScrollTrigger.refresh();

    return () => {
      observer.disconnect();
    };
  }, []);

  const materials = useMemo(() => {
    return textures.map(
      (texture) =>
        new THREE.MeshPhysicalMaterial({
          map: texture,
          emissive: "#150028",
          emissiveMap: texture,
          emissiveIntensity: 0.4,
          metalness: 0.35,
          roughness: 0.25,
          clearcoat: 0.6,
          clearcoatRoughness: 0.1,
        })
    );
  }, []);

  return (
    <div className="techstack">
      <h2>
        My <span>Techstack</span>
      </h2>

      <Canvas
        shadows
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 21], fov: 35, near: 1, far: 100 }}
        onCreated={(state) => (state.gl.toneMappingExposure = 1.3)}
        className="tech-canvas"
      >
        <ambientLight intensity={1.2} />
        <spotLight
          position={[20, 20, 25]}
          penumbra={1}
          angle={0.25}
          color="#ffffff"
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <directionalLight position={[0, 8, -4]} intensity={2.5} color="#c2a4ff" />
        <directionalLight position={[-10, -5, 5]} intensity={1.5} color="#4f46e5" />
        <Physics gravity={[0, 0, 0]}>
          <TechCluster isActive={isActive} materials={materials} />
        </Physics>
        <Environment
          files="/models/char_enviorment.hdr"
          environmentIntensity={0.65}
          environmentRotation={[0, 4, 2]}
        />
        <EffectComposer enableNormalPass={false}>
          <N8AO color="#0f002c" aoRadius={2} intensity={1.15} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default TechStack;
