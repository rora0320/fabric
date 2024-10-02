import React, {useEffect, useRef} from 'react';
import * as fabric from 'fabric';

const Rectangle = ({canvas}) => {
    const isDrawing = useRef(false);
    const startPoint = useRef(null);
    const currentShape = useRef(null);

    const onMouseDown = (event) => {

        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            // If an object is selected, do not allow drawing
            return;
        }

        isDrawing.current = true;
        const pointer = canvas.getPointer(event.e);
        startPoint.current = pointer;

        const rect = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 0,
            fill: 'green',
            originX: 'left',
            originY: 'top',
            selectable: false,
        });

        currentShape.current = rect;
        canvas.add(currentShape.current);
    };

    const onMouseMove = (event) => {
        if (!isDrawing.current || !currentShape.current) return;

        const pointer = canvas.getPointer(event.e);
        const xDiff = pointer.x - startPoint.current.x;
        const yDiff = pointer.y - startPoint.current.y;

        // Update rectangle dimensions
        currentShape.current.set({
            width: xDiff,
            height: yDiff,
        });

        canvas.renderAll();
    };

    const onMouseUp = () => {
        isDrawing.current = false;
        currentShape.current = null; // Reset after drawing is complete
    };

    useEffect(() => {
        if(!canvas) return;
        // Attach mouse events for drawing
        canvas.on('mouse:down', onMouseDown);
        canvas.on('mouse:move', onMouseMove);
        canvas.on('mouse:up', onMouseUp);

        return () => {
            // Cleanup: remove events when tool is switched or component unmounts
            canvas.off('mouse:down', onMouseDown);
            canvas.off('mouse:move', onMouseMove);
            canvas.off('mouse:up', onMouseUp);
        };
    }, [canvas]);

    return null; // This component does not render any UI, just adds behavior
};

export default Rectangle;