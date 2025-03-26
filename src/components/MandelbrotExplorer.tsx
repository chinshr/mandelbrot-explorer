import { useRef, useMemo, useEffect, useCallback, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector2, ShaderMaterial, PlaneGeometry, Mesh } from 'three';
import { fragmentShader, vertexShader } from '../shaders/mandelbrot';
import { MandelbrotControls } from './MandelbrotControls';

interface ViewportState {
    offset: Vector2;
    zoom: number;
}

export function MandelbrotExplorer() {
    const meshRef = useRef<Mesh>(null);
    const materialRef = useRef<ShaderMaterial>(null);
    const { size } = useThree();
    
    // Initial view centered on (-1.5, -1) with a viewport that includes (-2,0) and (-2,-2)
    const [offset, setOffset] = useState(new Vector2(-1.5, -1));
    const [zoom, setZoom] = useState(0.8);
    const [mousePos, setMousePos] = useState(new Vector2(0, 0));
    const [viewportStack, setViewportStack] = useState<ViewportState[]>([]);
    
    const uniforms = useMemo(() => ({
        resolution: { value: new Vector2(size.width, size.height) },
        offset: { value: new Vector2(-1.5, -1) },
        zoom: { value: 0.8 },
        maxIterations: { value: 100 },
        mousePos: { value: new Vector2(0, 0) }
    }), [size]);

    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.resolution.value.set(size.width, size.height);
        }
    }, [size]);

    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.offset.value.copy(offset);
            materialRef.current.uniforms.zoom.value = zoom;
            materialRef.current.uniforms.mousePos.value.copy(mousePos);
        }
    }, [offset, zoom, mousePos]);

    const handleOffsetChange = useCallback((delta: Vector2) => {
        setOffset(prev => new Vector2(
            prev.x + delta.x,
            prev.y + delta.y
        ));
    }, []);

    const handleZoomChange = useCallback((factor: number, mouseX: number, mouseY: number) => {
        // Convert mouse coordinates to normalized device coordinates (-1 to 1)
        const x = (mouseX / size.width) * 2 - 1;
        const y = -(mouseY / size.height) * 2 + 1;
        
        // Update mouse position
        setMousePos(new Vector2(x, y));
        
        // Calculate current viewport size
        const viewportSize = 4.0 / zoom;
        
        // Calculate the complex space point under the mouse
        const mouseComplex = new Vector2(
            offset.x + (x * viewportSize / 2),
            offset.y + (y * viewportSize / 2)
        );
        
        console.log('Zoom:', {
            factor,
            from: { zoom, offset: { x: offset.x, y: offset.y } },
            mouse: { x, y },
            complex: { x: mouseComplex.x, y: mouseComplex.y }
        });
        
        if (factor > 1) {
            // Zooming in - save current state to stack
            setViewportStack(prev => [...prev, { 
                offset: offset.clone(), 
                zoom: zoom 
            }]);
            
            // Update zoom
            const newZoom = zoom * factor;
            setZoom(newZoom);
            
            // Calculate new offset based on the percentage from center
            // This maintains the relative position of the mouse point
            const newViewportSize = 4.0 / newZoom;
            const percentFromCenter = new Vector2(x, y); // Already in range -1 to 1
            
            // Calculate how much the offset should shift to maintain the relative position
            const offsetShift = new Vector2(
                percentFromCenter.x * (viewportSize - newViewportSize) / 2,
                percentFromCenter.y * (viewportSize - newViewportSize) / 2
            );
            
            // Apply the shift to the current offset
            setOffset(prev => new Vector2(
                prev.x + offsetShift.x,
                prev.y + offsetShift.y
            ));
            
        } else if (factor < 1 && viewportStack.length > 0) {
            // Zooming out - restore previous state from stack
            setViewportStack(prev => {
                const newStack = [...prev];
                const previousState = newStack.pop();
                if (previousState) {
                    setOffset(previousState.offset);
                    setZoom(previousState.zoom);
                }
                return newStack;
            });
        }
    }, [size, zoom, offset, viewportStack]);

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
                currentZoom={zoom}
                currentOffset={offset}
            />
        </>
    );
} 