import { useRef, useMemo, useEffect, useCallback, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector2, ShaderMaterial, PlaneGeometry, Mesh } from 'three';
import { fragmentShader, vertexShader } from '../shaders/mandelbrot';
import { MandelbrotControls } from './MandelbrotControls';

export function MandelbrotExplorer() {
    const meshRef = useRef<Mesh>(null);
    const materialRef = useRef<ShaderMaterial>(null);
    const { size } = useThree();
    
    const [offset, setOffset] = useState(new Vector2(0, 0));
    const [zoom, setZoom] = useState(1.0);
    
    const uniforms = useMemo(() => ({
        resolution: { value: new Vector2(size.width, size.height) },
        offset: { value: offset },
        zoom: { value: zoom },
        maxIterations: { value: 100 }
    }), [size, offset, zoom]);

    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.resolution.value.set(size.width, size.height);
        }
    }, [size]);

    const handleOffsetChange = useCallback((delta: Vector2) => {
        setOffset(prev => new Vector2(
            prev.x + delta.x / zoom,
            prev.y + delta.y / zoom
        ));
    }, [zoom]);

    const handleZoomChange = useCallback((factor: number) => {
        setZoom(prev => prev * factor);
    }, []);

    const geometry = useMemo(() => new PlaneGeometry(2, 2), []);
    const material = useMemo(() => new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms
    }), [uniforms]);

    useFrame(() => {
        if (materialRef.current) {
            // Add any animation or interaction updates here
        }
    });

    return (
        <>
            <mesh ref={meshRef} geometry={geometry}>
                <shaderMaterial ref={materialRef} attach="material" {...material} />
            </mesh>
            <MandelbrotControls 
                onOffsetChange={handleOffsetChange}
                onZoomChange={handleZoomChange}
            />
        </>
    );
} 