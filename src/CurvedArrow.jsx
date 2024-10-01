import {useEffect, useRef, useState} from 'react';
import * as fabric from 'fabric';

const CurvedArrow = () => {
    const canvasRef2 = useRef(null);
    const canvasInstance = useRef(null);
    const isDrawing = useRef(false);
    const startPoint = useRef(null);
    const currentArrow = useRef(null); // 현재 그리는 화살표를 저장
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


    const onMouseDown = (event) => {
        const canvas = canvasInstance.current;
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            // If an object is selected, do not allow drawing
            return;
        }

        isDrawing.current=true;
        // 클릭한 위치를 시작점으로 설정
        const pointer = canvas.getPointer(event.e);
        startPoint.current = pointer;
        // 임시로 그릴 화살표 객체 생성 (이동 중 업데이트)
        const rect = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            width: 0, // 드래그 중에는 크기가 0
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
            originX: 'left',
            originY: 'center',
            angle: 180,
            selectable: false,
        });

        // 캔버스에 추가하고 참조 저장
        canvas.add(rect, triangle);
        currentArrow.current = { rect, triangle };
    };

    const onMouseMove = (event) => {
        const canvas = canvasInstance.current;
        if (!isDrawing.current || !startPoint.current) return;

        const pointer = canvas.getPointer(event.e);
        const xDiff = pointer.x - startPoint.current.x;
        const yDiff = pointer.y - startPoint.current.y;
        const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        const angle = (Math.atan2(yDiff, xDiff) * 180) / Math.PI; // 각도 계산

        const { rect, triangle } = currentArrow.current;

        // 실시간으로 화살표의 크기와 각도 업데이트
        rect.set({
            width: distance,
            angle: angle,
            selectable: true,
        });

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
        const canvas = canvasInstance.current;
        if (!isDrawing.current) return;
        const { rect, triangle } = currentArrow.current;

        // Create a group with the rect and triangle
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

        // 드래그 종료
        isDrawing.current = false;
        currentArrow.current = null; // 현재 그리는 화살표 초기화
    };

    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef2.current);

        canvas.on('mouse:down', onMouseDown);
        canvas.on('mouse:move', onMouseMove);
        canvas.on('mouse:up', onMouseUp);

        canvasInstance.current = canvas;
        return () => {
            canvas.off('mouse:down', onMouseDown);
            canvas.off('mouse:move', onMouseMove);
            canvas.off('mouse:up', onMouseUp);
            canvasInstance.current.dispose();
        };
    }, []);


    return (
        <div>
            <h1>arrow</h1>
            {/*<button onClick={onClickDrawArray}>화살</button>*/}
            {/* Add some styling to make sure the canvas is visible */}
            <canvas ref={canvasRef2} width="900" height="900" style={{ border: '1px solid blue' }}></canvas>
        </div>
    );
};

export default CurvedArrow;