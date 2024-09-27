import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';

const CurvedArrow = () => {
    const canvasRef2 = useRef(null);

    // useEffect(() => {
    //     // Check if canvas element is available
    //     const canvas = new fabric.Canvas(canvasRef2.current);
    //     // if (!canvasRef2.current) {
    //     //     console.error("Canvas element not found");
    //     //     return;
    //     // }
    //
    //     function drawCurvedArrow(canvas, startX, startY, endX, endY, controlX, controlY, arrowSize = 10) {
    //         // Path for the curved line
    //         const path = new fabric.Path(`M ${startX} ${startY} Q ${controlX} ${controlY}, ${endX} ${endY}`, {
    //             stroke: 'black',
    //             fill: '',
    //             strokeWidth: 7,
    //         });
    //         const gradient = new fabric.Gradient({
    //                     type: 'linear',
    //                     coords: { x1: 0, y1: 0, x2: 0, y2: path.height },
    //                     colorStops: [
    //                         { offset: 0, color: 'rgba(0, 100, 200, 1)' },  // Light color at the top
    //                         { offset: 0.5, color: 'rgba(0, 150, 255, 0.9)' },  // Mid-tone
    //                         { offset: 1, color: 'rgba(0, 150, 255, 0.6)' }      // Darker at the bottom
    //                     ]
    //                 });
    //         path.set('stroke', gradient);
    //         canvas.add(path);
    //
    //         // Calculate the angle of the arrowhead
    //         const angle = Math.atan2(endY - controlY, endX - controlX);
    //
    //         // Arrowhead points
    //         const arrowHead = [
    //             { x: endX - arrowSize * Math.cos(angle - Math.PI / 6), y: endY - arrowSize * Math.sin(angle - Math.PI / 6) },
    //             { x: endX, y: endY },
    //             { x: endX - arrowSize * Math.cos(angle + Math.PI / 6), y: endY - arrowSize * Math.sin(angle + Math.PI / 6) },
    //         ];
    //
    //         const arrowHeadShape = new fabric.Polygon(arrowHead, {
    //             fill: 'black',
    //             stroke: 'black',
    //             strokeWidth: 7,
    //         });
    //
    //         // // path polygon 을 그룹으로 만들고 싶으면
    //         // const arrowGroup = new fabric.Group([path, arrowHeadShape], {
    //         //     left: startX,  // Position group based on starting point
    //         //     top: startY,
    //         //     selectable: true,  // Enable selection and transformations
    //         //     hasControls: true,  // Allow movement, rotation, and scaling
    //         //     originX: 'center',
    //         //     originY: 'center',
    //         // });
    //         // canvas.add(arrowGroup);
    //
    //         canvas.add(arrowHeadShape);
    //     }
    //
    //     // Draw a sample curved arrow (coordinates within canvas)
    //     drawCurvedArrow(canvas, 100, 100, 120, 150, 200, 150); // Adjusted controlY for a visible curve
    //     // Clean up the canvas when the component unmounts
    //     return () => canvas.dispose();
    // }, []);

    // const handleMouseDown = (canvas, obj) => (e) => {
    //     const pointer = canvas.getPointer(e.e);
    //     const points = obj.path; // Access the path points
    //     console.log('Path points before modification:', points);
    //
    //     // Modify the path data (example: moving the first point)
    //     points[0][1] = pointer.x; // Modify x-coordinate of the first point
    //     points[0][2] = pointer.y; // Modify y-coordinate of the first point
    //
    //     obj.set({ path: points }); // Update the path with new points
    //     canvas.renderAll(); // Re-render the canvas
    //     console.log('Path points after modification:', points);
    // };
    //
    // useEffect(() => {
    //     const canvas = new fabric.Canvas(canvasRef2.current);
    //
    //     fabric.loadSVGFromURL('right-arrow.svg').then(({objects,options})=> {
    //         console.log('objects', objects, 'options', options);
    //         // Check if objects are loaded
    //         if (objects && objects.length > 0) {
    //             // Group the SVG elements
    //             const svgGroup = fabric.util.groupSVGElements(objects);
    //             svgGroup.scaleToWidth(100);  // Scale the SVG
    //             svgGroup.scaleToHeight(100);
    //             svgGroup.set({left: 150, top: 150});  // Position the SVG
    //
    //             canvas.add(svgGroup);  // Add the SVG group to the canvas
    //             canvas.renderAll();    // Render the canvas with the SVG added
    //
    //
    //             svgGroup.getObjects().forEach((obj) => {
    //                 if (obj.type === 'path') {
    //                     obj.set({
    //                         editable: true, // Allows point-based editing
    //                         perPixelTargetFind: true, // Makes object selection more accurate
    //                     });
    //
    //                     // Show control points for each path
    //                     obj.on('mousedown', handleMouseDown(canvas, obj));
    //                 }
    //             });
    //         } else {
    //             console.error("No objects found in SVG");
    //         }
    //     })
    //
    //     return () => canvas.dispose();
    // }, []);

    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef2.current);

        // Create the rectangle (arrow shaft)
        const rect = new fabric.Rect({
            left: 100,
            top: 150,
            width: 100,
            height: 20,
            fill: 'blue',
            originX: 'left',
            originY: 'center',
            selectable: true
        });

        // Create the triangle (arrowhead)
        const triangle = new fabric.Triangle({
            left: rect.left + rect.width,
            top: rect.top - 40  ,
            width: 80,
            height: 80,
            fill: 'red',
            originX: 'left',
            originY: 'center',
            angle: 90,
            selectable: true
        });
        // path polygon 을 그룹으로 만들고 싶으면
        // const arrowGroup = new fabric.Group([rect, triangle], {
        //     left: 100,  // Position group based on starting point
        //     top: 100,
        //     selectable: true,  // Enable selection and transformations
        //     hasControls: true,  // Allow movement, rotation, and scaling
        //     originX: 'center',
        //     originY: 'center',
        // });
        // canvas.add(arrowGroup);

        canvas.add(rect,triangle)
        // Update the positions to always stick together
        canvas.on('object:moving', function (e) {
            const obj = e.target;
            if (obj === rect) {
                triangle.set({
                    left: obj.left + obj.width * obj.scaleX,
                    top: obj.top -(triangle.width /2),
                });
            } else if (obj === triangle) {
                rect.set({
                    left: obj.left - rect.width * rect.scaleX,
                    top: obj.top +(triangle.width/2)
                });
            }
            canvas.renderAll();
        });
        // Add both the rectangle and triangle to the canvas
        // canvas.add(rect);
        // canvas.add(triangle)
        //
        // // Custom control for adjusting the width of the triangle
        // triangle.controls.mtr  = new fabric.Control({
        //     x: 0.5, // Position the control at the right edge of the triangle
        //     y: 0,
        //     offsetX: 20,
        //     cursorStyle: 'ew-resize',
        //     actionHandler: function (eventData, transform, x, y) {
        //         const target = transform.target;
        //         // const newWidth = target.width * target.scaleX + eventData.movementX;
        //         // if (newWidth > 20) { // Minimum width
        //         //     target.set({ scaleX: newWidth / target.width });
        //         // }
        //         const newHeight = target.height * target.scaleY + eventData.movementX;
        //         if (newHeight > 20) { // Minimum height
        //             target.set({ scaleY: newHeight / target.height });
        //         }
        //         return true;
        //     },
        //     render: function (ctx, left, top, styleOverride, fabricObject) {
        //         const size = 10;
        //         ctx.save();
        //         ctx.fillStyle = 'black';
        //         ctx.fillRect(left - size / 2, top - size / 2, size, size); // Draw the control point
        //         ctx.restore();
        //     },
        // });
        //
        // // Keep the triangle's left side attached to the rectangle's right side
        // triangle.on('modified', () => {
        //     rect.set({
        //         width: triangle.left - rect.left, // Adjust the rectangle's width
        //         top: triangle.top + (triangle.width/2),
        //     });
        //     canvas.renderAll();
        // });
        //
        // // Event handler for moving the triangle and keeping the rectangle updated
        // rect.on('modified', () => {
        //     triangle.set({
        //         left: rect.left + rect.width,
        //         top: rect.top,
        //     });
        //     canvas.renderAll();
        // });

        return () => {
            canvas.dispose();
        };
    }, []);


    return (
        <div>
            <h1>arrow</h1>
            {/* Add some styling to make sure the canvas is visible */}
            <canvas ref={canvasRef2} width="900" height="900" style={{ border: '1px solid blue' }}></canvas>
        </div>
    );
};

export default CurvedArrow;