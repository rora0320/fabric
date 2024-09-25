import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import Person from '../public/person_Icon.svg'

const CurvedArrow = () => {
    const canvasRef2 = useRef(null);

    useEffect(() => {
        // Check if canvas element is available
        const canvas = new fabric.Canvas(canvasRef2.current);
        // if (!canvasRef2.current) {
        //     console.error("Canvas element not found");
        //     return;
        // }

        function drawCurvedArrow(canvas, startX, startY, endX, endY, controlX, controlY, arrowSize = 10) {
            // Path for the curved line
            const path = new fabric.Path(`M ${startX} ${startY} Q ${controlX} ${controlY}, ${endX} ${endY}`, {
                stroke: 'black',
                fill: '',
                strokeWidth: 7,
            });
            const gradient = new fabric.Gradient({
                        type: 'linear',
                        coords: { x1: 0, y1: 0, x2: 0, y2: path.height },
                        colorStops: [
                            { offset: 0, color: 'rgba(0, 100, 200, 1)' },  // Light color at the top
                            { offset: 0.5, color: 'rgba(0, 150, 255, 0.9)' },  // Mid-tone
                            { offset: 1, color: 'rgba(0, 150, 255, 0.6)' }      // Darker at the bottom
                        ]
                    });
            path.set('stroke', gradient);
            canvas.add(path);

            // Calculate the angle of the arrowhead
            const angle = Math.atan2(endY - controlY, endX - controlX);

            // Arrowhead points
            const arrowHead = [
                { x: endX - arrowSize * Math.cos(angle - Math.PI / 6), y: endY - arrowSize * Math.sin(angle - Math.PI / 6) },
                { x: endX, y: endY },
                { x: endX - arrowSize * Math.cos(angle + Math.PI / 6), y: endY - arrowSize * Math.sin(angle + Math.PI / 6) },
            ];

            const arrowHeadShape = new fabric.Polygon(arrowHead, {
                fill: 'black',
                stroke: 'black',
                strokeWidth: 7,
            });

            // // path polygon 을 그룹으로 만들고 싶으면
            // const arrowGroup = new fabric.Group([path, arrowHeadShape], {
            //     left: startX,  // Position group based on starting point
            //     top: startY,
            //     selectable: true,  // Enable selection and transformations
            //     hasControls: true,  // Allow movement, rotation, and scaling
            //     originX: 'center',
            //     originY: 'center',
            // });
            // canvas.add(arrowGroup);

            canvas.add(arrowHeadShape);
        }
        // function drawBentArrow() {
        //     // Define the path for a bent arrow
        //     // const arrowPath =new fabric.Path(`M 100 100 L 200 120 L 300 150 L 400 180 L 400 210 L 400 240 L 300 200 L 100 180 z M 400 240 L 400 180 L 320 250 L 200 400 z`,{
        //     const arrowPath = new fabric.Path('M 100 100 L 200 100 L 200 150 L 300 150 L 300 175 L 200 175 L 200 250 L 100 250 z', {
        //         fill: 'white', // Placeholder color before gradient
        //         stroke: 'black',
        //         strokeWidth: 2,
        //     });
        //
        //     // Apply a gradient to simulate 3D shading
        //     const gradient = new fabric.Gradient({
        //         type: 'linear',
        //         coords: { x1: 0, y1: 0, x2: 0, y2: arrowPath.height },
        //         colorStops: [
        //             { offset: 0, color: 'rgba(255, 255, 255, 0.9)' },  // Light color at the top
        //             { offset: 0.5, color: 'rgba(0, 150, 255, 0.7)' },  // Mid-tone
        //             { offset: 1, color: 'rgba(0, 100, 200, 1)' }      // Darker at the bottom
        //         ]
        //     });
        //     arrowPath.set('fill', gradient);

            // canvas.add(arrowPath);
        // }
        // Draw a sample curved arrow (coordinates within canvas)
        drawCurvedArrow(canvas, 100, 100, 120, 150, 200, 150); // Adjusted controlY for a visible curve
        // drawBentArrow();
        // fabric.loadSVGFromURL('right-arrow.svg').then(({objects,options})=>{
        //     console.log('objects',objects,'options',options);
        //     // Check if objects are loaded
        //     if (objects && objects.length > 0) {
        //         // Group the SVG elements
        //         const svgGroup = fabric.util.groupSVGElements(objects);
        //         svgGroup.scaleToWidth(100);  // Scale the SVG
        //         svgGroup.scaleToHeight(100);
        //         svgGroup.set({ left: 150, top: 150 });  // Position the SVG
        //
        //         canvas.add(svgGroup);  // Add the SVG group to the canvas
        //         canvas.renderAll();    // Render the canvas with the SVG added
        //     } else {
        //         console.error("No objects found in SVG");
        //     }
        // })
        // Clean up the canvas when the component unmounts
        return () => canvas.dispose();
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