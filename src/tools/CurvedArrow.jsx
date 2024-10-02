import React, {useEffect, useRef} from 'react';
import * as fabric from 'fabric';

const CurvedArrow = ({canvas}) => {
    const isDrawing = useRef(false);
    const startPoint = useRef(null);
    const currentArrow = useRef(null);

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
            height: 5,
            fill: 'blue',
            originX: 'left',
            originY: 'center',
            selectable: false,
        });

        const triangle = new fabric.Triangle({
            left: pointer.x,
            top: pointer.y,
            width: 20,
            height: 20,
            fill: 'red',
            originX: 'center',
            originY: 'center',
            angle: 180,
            selectable: false,
        });


        canvas.add(rect, triangle);
        currentArrow.current = {rect,triangle};

    };

    const onMouseMove = (event) => {
        if (!isDrawing.current || !startPoint.current) return;

        const pointer = canvas.getPointer(event.e);
        const xDiff = pointer.x - startPoint.current.x;
        const yDiff = pointer.y - startPoint.current.y;
        const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        const angle = (Math.atan2(yDiff, xDiff) * 180) / Math.PI; // 각도 계산

        const {rect,triangle} = currentArrow.current ;
        
        // Update rectangle width (arrow shaft)
        rect.set({
            width: distance,
            angle: angle,
            selectable: true,
        });

        // Move triangle (arrowhead) to the end of the shaft
        triangle.set({
            left: pointer.x,
            top: pointer.y,
            angle: angle+90,
            originX: 'center',
            originY: 'center',
            selectable: true,
        });

        canvas.renderAll();
    };

    const onMouseUp = () => {
        //마우스 뗄때 그룹피
        const { rect, triangle } = currentArrow.current;
        const group = new fabric.Group([rect, triangle], {
            selectable: true, // Allow the group to be selected
            hasControls: true, // Show controls for resizing/rotating the group
            lockScalingY: true, // Restrict scaling to only the x-axis if necessary
        });

        // Add the group to the canvas
        canvas.add(group);

        // Remove individual objects from the canvas (as they are now part of the group)
        canvas.remove(rect);
        canvas.remove(triangle);

        // Render the canvas to reflect the changes
        canvas.renderAll();
        
        //드래그 종료
        isDrawing.current = false;
        canvas.current = null; // Reset after drawing is complete
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

export default CurvedArrow;