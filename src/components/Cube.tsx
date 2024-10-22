import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useRef } from "react";
import { Mesh } from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

export function Model() {
    const gltf = useGLTF('/models/Dinosaur.glb') as unknown as GLTF;
    const ref = useRef<Mesh>(null);

    useFrame(() => {
        if (ref.current) {
            ref.current.rotation.y += 0.01;
        }
    });

    return (
        <mesh ref={ref} scale={0.5}>
            <primitive object={gltf.scene} />
        </mesh>
    );
}