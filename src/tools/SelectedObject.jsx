import React, {useEffect, useRef, useState} from 'react';
import * as fabric from 'fabric';

const SelectedObject = ({canvas}) => {
    const isDrawing = useRef(false);
    const startPoint = useRef([]);
    const [line, setLine] = useState(null); // 현재 그려지고 있는 라인
    const [path, setPath] = useState(null);
    const [handles, setHandles] = useState([]); // 핸들을 관리할 상태


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
                selectedObject.set({
                    selectable:true,
                    hasBorders: true,
                })
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

            // setPath('');
            canvas.add(newPath);
            isDrawing.current = false;
            startPoint.current = [];

            // 이전 경로 삭제
            const existingLine = canvas.getObjects('line');
            existingLine.forEach((path) => {
                canvas.remove(path);
            });
            console.log('newPath',newPath)
            setPath(newPath)
        }

        canvas.renderAll();
    };

    // 마우스 더블클릭 이벤트
    const handleDoubleClick = (opt) => {

        const target = canvas.getObjects();
        if (target[0] && target[0].type === 'path') {
            target[0].set({
                selectable: false, // 선택 불가
                evented: false,    // 이벤트 발생 안 함
                hasControls: false, // 크기 조절 핸들 숨기기
                hasBorders: true
            })
            addHandlesToPath(target[0]);
            setPath(target[0])
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
        const target = canvas.getObjects()
        console.log('esc 이벤트 target',target)
        if (event.key === 'Escape') {
            isDrawing.current = false;
            startPoint.current = [];
            setLine(null);
            // 기존 핸들 제거
            handles.forEach((handle) => {
                canvas.remove(handle);
            });
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

    // 핸들을 추가하는 함수
    const addHandlesToPath = (targetPath) => {
        const pathPoints = targetPath.path.map((point) => ({ x: point[1], y: point[2] })); // Path의 점들 가져오기
        // 기존 핸들 제거
        handles.forEach((handle) => {
            canvas.remove(handle);
        });

        const newHandles = pathPoints.map((point,index) => {
            const handle = new fabric.Circle({
                left: point.x ,
                top: point.y ,
                radius: 5,
                fill: 'blue',
                originX: 'center',
                originY: 'center',
                selectable: true,
                hasControls: false,
            });

            // 핸들 이동 시 경로 업데이트
            handle.on('moving', () => {
                const newPoints = targetPath.path.map((p, i) => {
                    if (i === index) {
                        return [p[0], handle.left, handle.top]; // 핸들 위치로 업데이트
                    }
                    return p;
                });

                path.set({ path: newPoints });
                canvas.renderAll();
            });

            canvas.add(handle);
            return handle;
        });

        // path 이동 이벤트 핸들러 추가
        targetPath.on('moving', () => {
            const pathLeftOffset = targetPath.left - targetPath._originalLeft; // 원래 위치와의 차이 계산
            const pathTopOffset = targetPath.top - targetPath._originalTop;

            newHandles.forEach((handle, index) => {
                const currentPathPoint = targetPath.path[index]; // 해당 인덱스의 경로 점
                if (currentPathPoint) {
                    handle.set({
                        left: currentPathPoint[1]  + pathLeftOffset  , // pathOffset을 보정하여 핸들 좌표 설정
                        top: currentPathPoint[2] + pathTopOffset
                    });
                }
            });
            canvas.renderAll();
        });

        // 초기 위치 저장 (경로 이동에 대비)
        targetPath._originalLeft = targetPath.left;
        targetPath._originalTop = targetPath.top;

        setHandles(newHandles); // 상태 업데이트
    };


    return null;
};

export default SelectedObject;