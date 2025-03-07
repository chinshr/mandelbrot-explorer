import { useEffect, useCallback } from 'react';
import { Vector2 } from 'three';

interface MandelbrotControlsProps {
    onOffsetChange: (offset: Vector2) => void;
    onZoomChange: (zoom: number) => void;
}

export function MandelbrotControls({ onOffsetChange, onZoomChange }: MandelbrotControlsProps) {
    const handleWheel = useCallback((event: WheelEvent) => {
        event.preventDefault();
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        onZoomChange(zoomFactor);
    }, [onZoomChange]);

    const handleMouseMove = useCallback((event: MouseEvent) => {
        if (event.buttons === 1) { // Left mouse button
            const movementX = event.movementX / window.innerWidth;
            const movementY = event.movementY / window.innerHeight;
            onOffsetChange(new Vector2(-movementX, movementY));
        }
    }, [onOffsetChange]);

    useEffect(() => {
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [handleWheel, handleMouseMove]);

    return null;
} 