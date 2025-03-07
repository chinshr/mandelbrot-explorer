import { useEffect, useCallback, useRef } from 'react';
import { Vector2 } from 'three';

interface MandelbrotControlsProps {
    onOffsetChange: (offset: Vector2) => void;
    onZoomChange: (zoom: number) => void;
    currentZoom: number;
}

interface TouchInfo {
    identifier: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
}

export function MandelbrotControls({ onOffsetChange, onZoomChange, currentZoom }: MandelbrotControlsProps) {
    const touchRef = useRef<TouchInfo | null>(null);
    const baseDesktopScale = 8.0;
    const baseTouchScale = 4.0;

    // Adjust movement scale based on zoom level with increased responsiveness
    const getMovementScale = useCallback((baseScale: number) => {
        // Add a progressive multiplier that increases with zoom
        // This makes movement more responsive at higher zoom levels
        const zoomMultiplier = Math.log10(currentZoom + 1) + 1;
        return (baseScale * zoomMultiplier) / currentZoom;
    }, [currentZoom]);

    const handleWheel = useCallback((event: WheelEvent) => {
        event.preventDefault();
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        onZoomChange(zoomFactor);
    }, [onZoomChange]);

    // Desktop mouse controls (traditional - inverse movement)
    const handleMouseMove = useCallback((event: MouseEvent) => {
        if (event.buttons === 1) { // Left mouse button
            const movementScale = getMovementScale(baseDesktopScale);
            const deltaX = (event.movementX / window.innerWidth) * movementScale;
            const deltaY = (event.movementY / window.innerHeight) * movementScale;
            // Both axes inverted for traditional desktop behavior
            onOffsetChange(new Vector2(-deltaX, deltaY));
        }
    }, [onOffsetChange, getMovementScale]);

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
                const deltaX = (currentTouch.clientX - touch.lastX) / window.innerWidth * movementScale;
                const deltaY = (currentTouch.clientY - touch.lastY) / window.innerHeight * movementScale;
                
                onOffsetChange(new Vector2(deltaX, -deltaY));
                
                touch.lastX = currentTouch.clientX;
                touch.lastY = currentTouch.clientY;
            }
        }
    }, [onOffsetChange, getMovementScale]);

    const handleTouchEnd = useCallback((event: TouchEvent) => {
        if (touchRef.current && 
            Array.from(event.touches).every(
                touch => touch.identifier !== touchRef.current?.identifier
            )) {
            touchRef.current = null;
        }
    }, []);

    useEffect(() => {
        // Mouse events
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('mousemove', handleMouseMove);

        // Touch events
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('touchcancel', handleTouchEnd);

        return () => {
            // Cleanup mouse events
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('mousemove', handleMouseMove);

            // Cleanup touch events
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [handleWheel, handleMouseMove, handleTouchStart, handleTouchMove, handleTouchEnd]);

    return null;
} 