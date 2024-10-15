import React, {useEffect, useRef, useState} from 'react';
import * as fabric from 'fabric';

const SelectedObject = ({canvas}) => {
    const isDrawing = useRef(false);
    const startPoint = useRef([]);
    const [line, setLine] = useState(null); // 현재 그려지고 있는 라인
    const [path, setPath] = useState(null);

    console.log('path???',path)
    // 마우스 다운 이벤트 핸들러 (드로잉 시작)
    const handleMouseDown = (opt) => {

        const pointer = canvas.getPointer(opt.e);
        const newPoint = { x: pointer.x, y: pointer.y };
        //
        if (!isDrawing.current) {
            // 첫 번째 점이면 그리기 시작
            // 더블 클릭일 경우, 마우스 다운 이벤트 무시
            const selectedObject = canvas.getActiveObject();
            if(selectedObject){
                isDrawing.current = false;
                return
            }else{
                isDrawing.current = true;
                startPoint.current = [newPoint]; // 새로운 시작점 설정
            }
        }
        // 라인 생성 또는 업데이트
        const newLine = new fabric.Line([newPoint.x, newPoint.y, newPoint.x, newPoint.y], {
            stroke: 'blue',
            strokeWidth: 2,
            selectable: true,
            hasControls: true, // 컨트롤러를 활성화하여 크기 조정 가능
            hasBorders: true,

        });
        setLine(newLine);
        canvas.add(newLine);
    };

    // 마우스 이동 이벤트 핸들러 (실시간 라인 업데이트)
    const handleMouseMove = (opt) => {
        if (!isDrawing.current || !line) return;

        const pointer = canvas.getPointer(opt.e);
        let { x, y } = pointer;

        // 첫 번째 점과의 거리가 10px 거리 이내인지 체크
        if (getDistance(pointer.x, pointer.y, startPoint.current[0].x, startPoint.current[0].y) < 10) {
            x = startPoint.current[0].x;
            y = startPoint.current[0].y;
        }
        line.set({ x2: x, y2: y });
        canvas.renderAll();
    };

    // 마우스 업 이벤트 핸들러 (드로잉 종료)
    const handleMouseUp = (opt) => {
        if (!isDrawing.current) return;

        const pointer = canvas.getPointer(opt.e);
        const newPoint = { x: pointer.x, y: pointer.y };

        const points = startPoint.current;
        points.push(newPoint);

        // 라인 그리기 종료
        const pathString = generatePathString(points);
        if (points.length > 2 && getDistance(newPoint.x, newPoint.y, points[0].x, points[0].y) < 10) {
            const newPath = new fabric.Path(pathString, {
                fill: 'transparent',
                stroke: 'blue',
                strokeWidth: 2,
                selectable: true, // 이동 가능하게 설정
                hasControls: true, // 컨트롤러를 활성화하여 크기 조정 가능
                hasBorders: true // 테두리 보이기
            });

            setPath('');
            canvas.add(newPath);
            isDrawing.current = false;
            startPoint.current = [];

            // 이전 경로 삭제
            const existingLine = canvas.getObjects('line');
            existingLine.forEach((path) => {
                canvas.remove(path);
            });
        }

        canvas.renderAll();
    };

    const handleDoubleClick = (opt) => {
        const target = canvas.getObjects();
        console.log('??????더블클릭?????????',target)
        if (target && target.type === 'path') {
            target.set('fill', 'red'); // 선택된 경로를 빨간색으로 설정 (예시)
            canvas.renderAll();
        }
    }

    // 점들을 기반으로 Path 문자열을 생성하는 함수
    const generatePathString = (points) => {
        let pathString = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            pathString += ` L ${points[i].x} ${points[i].y}`;
        }
        return pathString;
    };

    // 두 점 사이의 거리 계산
    const getDistance = (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };

    // ESC 키 이벤트 리스너
    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            isDrawing.current = false;
            startPoint.current = [];
            setLine(null);
            // if (path) {
            //     path.set({ selectable: true }); // 다시 선택 가능하게 설정
            // }
            canvas.renderAll(); // 캔버스 다시 렌더링
        }
    };


    // 캔버스를 초기화하고 이벤트 리스너 등록
    useEffect(() => {
        if(!canvas) return;

        // 마우스 이벤트 등록
        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:move', handleMouseMove);
        canvas.on('mouse:up', handleMouseUp);

        // 더블 클릭 이벤트 핸들러 등록
        canvas.on('mouse:dblclick', handleDoubleClick);
        window.addEventListener('keydown', handleKeyDown);
        // Cleanup
        return () => {
            canvas.off('mouse:down', handleMouseDown);
            canvas.off('mouse:move', handleMouseMove);
            canvas.off('mouse:up', handleMouseUp);
            canvas.off('mouse:dblclick',handleDoubleClick);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [canvas, isDrawing, path, line]);

// 객체별로 핸들을 추가하는 로직
    const addPointForPoly = (polygon) => {
        polygon.points.forEach((point, index) => {
            const handle = new fabric.Circle({
                left: point.x,
                top: point.y,
                radius: 5,
                fill: 'blue',
                originX: 'center',
                originY: 'center',
                selectable: true,
                hasControls: false,
            });

            // 핸들이 움직일 때마다 폴리곤 좌표 수정
            onHandleMove(handle, polygon);
            canvas.add(handle);
        });
    };


    return null;
};

export default SelectedObject;