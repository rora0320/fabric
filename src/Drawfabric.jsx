import React, {useEffect, useRef, useState} from 'react';
import * as fabric from 'fabric';
import Arrow from "./tools/Arrow.jsx";
import Rectangle from "./tools/Rectangle.jsx";
import CurvedArrow from "./tools/CurvedArrow.jsx";
import PointerArrow from "./tools/pointerArrow.jsx";

const Drawfabric = () => {
    const canvasRef = useRef(null);
    const canvasInstance = useRef(null);
    const [selectedTool, setSelectedTool] = useState(''); // Default tool is 'arrow'


    useEffect(() => {
        // Initialize Fabric.js canvas
        const canvas = new fabric.Canvas(canvasRef.current);
        canvasInstance.current = canvas;

        return () => {
            canvasInstance.current.dispose();
            canvas.dispose(); // Clean up the canvas on unmount
        };
    }, []);

    const ComponentFromTool=()=>{
        switch (selectedTool) {
            case 'arrow':
                return <Arrow canvas={canvasInstance.current}/>
            case 'rectangle':
                return <Rectangle canvas={canvasInstance.current} />
            case 'curvedArrow':
                return <CurvedArrow canvas={canvasInstance.current}/>
            case 'pointerArrow':
                return <PointerArrow canvas={canvasInstance.current}/>
            default:
                return null;
        }
    }
    return (
        <div>
            {ComponentFromTool()}
            <div>
                <button onClick={() => setSelectedTool('arrow')}>Arrow Tool</button>
                <button onClick={() => setSelectedTool('rectangle')}>Rectangle Tool</button>
                <button onClick={() => setSelectedTool('curvedArrow')}>curvedArrow Tool</button>
                <button onClick={() => setSelectedTool('pointerArrow')}>pointerArrow Tool</button>
            </div>
            <h1>arrow</h1>
            {/*<button onClick={onClickDrawArray}>화살</button>*/}
            {/* Add some styling to make sure the canvas is visible */}
            <canvas ref={canvasRef} width="900" height="900" style={{border: '1px solid blue'}}></canvas>
        </div>
    );
};

export default Drawfabric;