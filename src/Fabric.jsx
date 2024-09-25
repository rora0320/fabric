import {useEffect, useRef} from 'react';
import * as fabric from 'fabric';

const Fabric = () => {
    const canvasRef = useRef(null);  // To reference the canvas element

    useEffect(() => {
        // Initialize FabricJS canvas
        const canvas = new fabric.Canvas(canvasRef.current);

        const options = {
            objectColors: {
                yellow: '#ffff00',
                red: '#ff0000',
                blue: '#0000ff'
            },
            objectStyles: {
                square: 'square'
            },
            transparentCorners: true
        };

        // Set Fabric object properties globally
        fabric.Object.prototype.transparentCorners = options.transparentCorners;
        fabric.Object.prototype.cornerColor = options.objectColors.blue;
        fabric.Object.prototype.cornerStyle = options.objectStyles.square;
        fabric.Object.prototype.padding = 20;

        // Create two rectangles and add them to the canvas
        let rect1 = new fabric.Rect({
            left: 100,
            top: 100,
            width: 100,
            height: 75,
            fill: options.objectColors.yellow,
        });
        canvas.add(rect1);

        let rect2 = new fabric.Rect({
            left: 250,
            top: 100,
            width: 100,
            height: 75,
            fill: options.objectColors.red,
        });
        canvas.add(rect2);

        return () => {
            // Clean up canvas when the component is unmounted
            canvas.dispose();
        };
    }, []);

    return (
        <div>
            <h1>FabricJS Canvas Example</h1>
            <canvas ref={canvasRef} width="600" height="600" style={{border:"1px solid red"}}></canvas>
        </div>
    );
};

export default Fabric;