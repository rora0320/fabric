import React, {useEffect, useRef, useState} from 'react';
import * as fabric from 'fabric';

const SelectedObject = ({canvas}) => {
    const isDrawing = useRef(false);
    const startPoint = useRef([]);
    const [line, setLine] = useState([]); // 현재 그려지고 있는 라인
    const setPath = useRef(null);
    const [handles, setHandles] = useState([]); // 핸들을 관리할 상태

    // 마우스 다운 이벤트 핸들러 (드로잉 시작)
    const handleMouseDown = (opt) => {
        const pointer = canvas.getPointer(opt.e);
        const newPoint = {x: pointer.x, y: pointer.y};
        // if(opt.e.detail === 2){
        //     console.log('더블 클릭 테스트 test')
        //     return
        // }
        //
        if (!isDrawing.current) {
            // 첫 번째 점이면 그리기 시작
            // 더블 클릭일 경우, 마우스 다운 이벤트 무시
            const selectedObject = canvas.getActiveObject();
            if (selectedObject) {
                selectedObject.set({
                    selectable: true,
                    hasBorders: true,
                })
                isDrawing.current = false;
                return
            } else {
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
        setLine((prevLine) => [...prevLine, newLine]);
        canvas.add(newLine);
    };

    // 마우스 이동 이벤트 핸들러 (실시간 라인 업데이트)
    const handleMouseMove = (opt) => {
        if (!isDrawing.current || line.length === 0) return;

        const pointer = canvas.getPointer(opt.e);
        let {x, y} = pointer;

        // 첫 번째 점과의 거리가 10px 거리 이내인지 체크
        if (getDistance(pointer.x, pointer.y, startPoint.current[0].x, startPoint.current[0].y) < 10) {
            x = startPoint.current[0].x;
            y = startPoint.current[0].y;
        }
        const currentLine = line[line.length - 1];
        currentLine.set({x2: x, y2: y});
        canvas.renderAll();
    };

    // 마우스 업 이벤트 핸들러 (드로잉 종료)
    const handleMouseUp = (opt) => {
        if (!isDrawing.current) return;

        const pointer = canvas.getPointer(opt.e);
        const newPoint = {x: pointer.x, y: pointer.y};

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
                hasControls: false, // 컨트롤러를 활성화하여 크기 조정 가능
                hasBorders: true, // 테두리 보이기
            });
            newPath.set({
                kh_T: newPath.top,
                kh_L: newPath.left
            })
            // setPath('');
            canvas.add(newPath);
            isDrawing.current = false;
            startPoint.current = [];

            // 이전 경로 삭제
            const existingLine = canvas.getObjects('line');
            existingLine.forEach((path) => {
                canvas.remove(path);
            });
            console.log('newPath', newPath)
            setPath.current = newPath
        }
        // else{
        //     const newPath = new fabric.Path(pathString, {
        //         fill: 'transparent',
        //         stroke: 'blue',
        //         strokeWidth: 2,
        //         selectable: true, // 이동 가능하게 설정
        //         hasControls: false, // 컨트롤러를 활성화하여 크기 조정 가능
        //         hasBorders: true, // 테두리 보이기
        //     });
        //     canvas.add(newPath);
        // }

        canvas.renderAll();
    };

    // 마우스 더블클릭 이벤트
    const handleDoubleClick = (opt) => {

        const target = canvas.getActiveObject(opt.e);
        console.log('target', target)
        if (target && target.type === 'path') {
            target.set({
                selectable: false, // 선택 불가
                hasControls: false, // 크기 조절 핸들 숨기기
                hasBorders: true,
                evented: false,

            })

            // setPath(target)
            addHandlesToPath(target);
            // canvas.setActiveObject(target);
            canvas.renderAll();
        }
    }

    // 점들을 기반으로 Path 문자열을 생성하는 함수
    const generatePathString = (points) => {
        let pathString = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            pathString += `L ${points[i].x} ${points[i].y}`;
        }
        return pathString;
    };

    // 두 점 사이의 거리 계산
    const getDistance = (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };

    // esc 누르면 실행될 함수
    // 라인들로 path 구성함
    const pathForLines = () => {
        const pathCoords = [`M ${line[0].x1} ${line[0].y1}`];
        line.forEach((l) => {
            pathCoords.push(`L ${l.x2} ${l.y2}`);
            canvas.remove(l);  // 기존 라인 제거
        });
        const newPath = new fabric.Path(pathCoords.join(' '), {
            fill: '',
            stroke: 'black',
            strokeWidth: 2,

        });
        newPath.set({
            kh_T: newPath.top,
            kh_L: newPath.left
        })
        canvas.add(newPath);
        setPath.current = newPath;
        setLine([]); // 라인 배열 초기화
        canvas.renderAll();
    }
    // ESC 키 이벤트 리스너
    const handleKeyDown = (event) => {

        if (event.key === 'Escape') {
            if (line.length > 1) {
                pathForLines()
            }

            setPath.current.set({
                selectable: true,
                evented: true,
                hasBorders: true,
            });

            canvas.setActiveObject(setPath.current);
            isDrawing.current = false;
            startPoint.current = [];
            setLine([]);
            // 기존 핸들 제거
            handles.forEach((handle) => {
                canvas.remove(handle);
            });
            canvas.renderAll(); // 캔버스 다시 렌더링


        }
    };
    // const handleObjectMove=(event)=>{
    //     const obj = event.target;
    //     console.log('누구 오브젝트니',obj)
    //     const boundingBox = obj.getBoundingRect();
    //     // Adjust view transform if needed
    //     if (boundingBox.left < 0 || boundingBox.top < 0 ||
    //         boundingBox.left + boundingBox.width > canvas.width ||
    //         boundingBox.top + boundingBox.height > canvas.height) {
    //         canvas.viewportTransform[4] -= boundingBox.left < 0 ? boundingBox.left : 0;
    //         canvas.viewportTransform[5] -= boundingBox.top < 0 ? boundingBox.top : 0;
    //     }
    // }


    // 캔버스를 초기화하고 이벤트 리스너 등록
    useEffect(() => {
        if (!canvas) return;

        // 마우스 이벤트 등록
        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:move', handleMouseMove);
        canvas.on('mouse:up', handleMouseUp);
        // canvas.on('object:moving',handleObjectMove)

        // 더블 클릭 이벤트 핸들러 등록
        canvas.on('mouse:dblclick', handleDoubleClick);
        window.addEventListener('keydown', handleKeyDown);
        // Cleanup
        return () => {
            canvas.off('mouse:down', handleMouseDown);
            canvas.off('mouse:move', handleMouseMove);
            canvas.off('mouse:up', handleMouseUp);
            canvas.off('mouse:dblclick', handleDoubleClick);
            // canvas.off('object:moving',handleObjectMove)
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [canvas, isDrawing, setPath, line]);

    // 핸들을 추가하는 함수
    const addHandlesToPath = (targetPath) => {
        //이동 전 top위치에서 원래 path의 시작점 차이
        const littleTop = targetPath.kh_T - targetPath.path[0][2];
        const littleLeft = targetPath.kh_L - targetPath.path[0][1];
        //이동한 위치의 top위치로는 이동
        const initialOffsetLeft = targetPath.path[0][1] - targetPath.left + littleLeft
        const initialOffsetTop = targetPath.path[0][2] - targetPath.top + littleTop


        const pathPoints = targetPath.path.map((point) => ({
            x: point[1] - initialOffsetLeft,
            y: point[2] - initialOffsetTop
        })); // Path의 점들 가져오기

        // 기존 핸들 제거
        handles.forEach((handle) => {
            canvas.remove(handle);
        });

        const newHandles = pathPoints.map((point, index) => {

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

            // 핸들 이동 시 경로 업데이트
            handle.on('moving', () => {
                const newPoints = targetPath.path.map((p, i) => {
                    if (i === index) {
                        return [p[0], handle.left + initialOffsetLeft, handle.top + initialOffsetTop]; // 핸들 위치로 업데이트
                    }
                    return p;
                });
                setPath.current.set({path: newPoints});
                // canvas.renderAll();
            });
            canvas.add(handle);
            return handle;
        });

        // path 이동(path+handle 전체이동) 이벤트 핸들러 추가
        targetPath.on('moving', () => {
            const pathLeftOffset = targetPath.left - targetPath._originalLeft; // 원래 위치와의 차이 계산
            const pathTopOffset = targetPath.top - targetPath._originalTop;

            //path 이동시 핸들러도 같이 움직이는 곳
            newHandles.forEach((handle, index) => {
                const currentPathPoint = targetPath.path[index]; // 해당 인덱스의 경로 점
                if (currentPathPoint) {
                    handle.set({
                        left: currentPathPoint[1] + pathLeftOffset - initialOffsetLeft, // pathOffset을 보정하여 핸들 좌표 설정
                        top: currentPathPoint[2] + pathTopOffset - initialOffsetTop,
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