import { useEffect, useCallback, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector2 } from 'three';

interface MandelbrotControlsProps {
    onOffsetChange: (delta: Vector2) => void;
    onZoomChange: (factor: number, mouseX: number, mouseY: number) => void;
    currentZoom: number;
    currentOffset: Vector2;
}

interface TouchInfo {
    identifier: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
}

export function MandelbrotControls({ onOffsetChange, onZoomChange, currentZoom, currentOffset }: MandelbrotControlsProps) {
    const { gl, size } = useThree();
    const isDragging = useRef(false);
    const previousPosition = useRef<{ x: number; y: number } | null>(null);
    const touchRef = useRef<TouchInfo | null>(null);
    const baseTouchScale = 8.0;

    // Adjust movement scale based on zoom level with increased responsiveness
    const getMovementScale = useCallback((baseScale: number) => {
        // Add a progressive multiplier that increases with zoom
        // This makes movement more responsive at higher zoom levels
        const zoomMultiplier = Math.log10(currentZoom + 1) + 1;
        return (baseScale * zoomMultiplier) / currentZoom;
    }, [currentZoom]);

    const handleWheel = useCallback((event: WheelEvent) => {
        event.preventDefault();
        const zoomFactor = event.deltaY > 0 ? 0.95 : 1.05;
        onZoomChange(zoomFactor, event.clientX, event.clientY);
    }, [onZoomChange]);

    // Desktop mouse controls (traditional - inverse movement)
    const handleMouseMove = useCallback((event: MouseEvent) => {
        // Log normalized coordinates
        const x = (event.clientX / size.width) * 2 - 1;
        const y = -(event.clientY / size.height) * 2 + 1;
        
        // Calculate complex space coordinates
        const viewportSize = 4.0 / currentZoom;
        const complexX = currentOffset.x + (x * viewportSize / 2);
        const complexY = currentOffset.y + (y * viewportSize / 2);
        
        // console.log('Mouse Position:', {
        //     screen: { x: event.clientX, y: event.clientY },
        //     normalized: { x, y },
        //     complex: { x: complexX, y: complexY }
        // });
        console.log('Mouse Position:', complexX, complexY);

        if (!isDragging.current || !previousPosition.current) return;

        const deltaX = event.clientX - previousPosition.current.x;
        const deltaY = event.clientY - previousPosition.current.y;

        // Scale the movement based on the current zoom level
        const scale = 0.01 / currentZoom;
        
        // Use inverse movement for desktop (traditional panning behavior)
        // Negative for X, positive for Y to match expected panning behavior
        onOffsetChange(new Vector2(-deltaX * scale, deltaY * scale));

        previousPosition.current = { x: event.clientX, y: event.clientY };
    }, [onOffsetChange, currentZoom, size, currentOffset]);

    // Mobile touch controls (natural movement)
    const handleTouchStart = useCallback((event: TouchEvent) => {
        if (!touchRef.current && event.touches.length === 1) {
            const touch = event.touches[0];
            touchRef.current = {
                identifier: touch.identifier,
                startX: touch.clientX,
                startY: touch.clientY,
                lastX: touch.clientX,
                lastY: touch.clientY
            };
        }
    }, []);

    const handleTouchMove = useCallback((event: TouchEvent) => {
        event.preventDefault();
        const touch = touchRef.current;
        if (touch) {
            const currentTouch = Array.from(event.touches).find(
                t => t.identifier === touch.identifier
            );
            
            if (currentTouch) {
                const movementScale = getMovementScale(baseTouchScale);
                const deltaX = (currentTouch.clientX - touch.lastX) / size.width * movementScale;
                const deltaY = (currentTouch.clientY - touch.lastY) / size.height * movementScale;
                
                // Use inverse movement for touch controls (same as desktop)
                // Negative for X, positive for Y to match expected panning behavior
                onOffsetChange(new Vector2(-deltaX, deltaY));
                
                touch.lastX = currentTouch.clientX;
                touch.lastY = currentTouch.clientY;
            }
        }
    }, [onOffsetChange, getMovementScale, size]);

    const handleTouchEnd = useCallback((event: TouchEvent) => {
        if (touchRef.current && 
            Array.from(event.touches).every(
                touch => touch.identifier !== touchRef.current?.identifier
            )) {
            touchRef.current = null;
        }
    }, []);

    useEffect(() => {
        const handleMouseDown = (event: MouseEvent) => {
            isDragging.current = true;
            previousPosition.current = { x: event.clientX, y: event.clientY };
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            previousPosition.current = null;
        };

        const domElement = gl.domElement;
        domElement.addEventListener('mousedown', handleMouseDown);
        domElement.addEventListener('mousemove', handleMouseMove);
        domElement.addEventListener('mouseup', handleMouseUp);
        domElement.addEventListener('wheel', handleWheel, { passive: false });

        // Touch events
        domElement.addEventListener('touchstart', handleTouchStart);
        domElement.addEventListener('touchmove', handleTouchMove, { passive: false });
        domElement.addEventListener('touchend', handleTouchEnd);
        domElement.addEventListener('touchcancel', handleTouchEnd);

        return () => {
            // Cleanup mouse events
            domElement.removeEventListener('mousedown', handleMouseDown);
            domElement.removeEventListener('mousemove', handleMouseMove);
            domElement.removeEventListener('mouseup', handleMouseUp);
            domElement.removeEventListener('wheel', handleWheel);

            // Cleanup touch events
            domElement.removeEventListener('touchstart', handleTouchStart);
            domElement.removeEventListener('touchmove', handleTouchMove);
            domElement.removeEventListener('touchend', handleTouchEnd);
            domElement.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [gl, size, onOffsetChange, onZoomChange, currentZoom, handleWheel, handleMouseMove, handleTouchStart, handleTouchMove, handleTouchEnd]);

    return null;
} 