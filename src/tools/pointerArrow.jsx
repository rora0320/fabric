import React, {useEffect, useRef, useState} from 'react';
import * as fabric from "fabric";

const PointerArrow = ({canvas}) => {
    const isDrawing = useRef(false);
    const startPoint = useRef(null);
    const currentArrow = useRef(null);
    const ArrowFromText = useRef(65);

    console.log('text',ArrowFromText)
    const onMouseDown = (event) => {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            // 그룹에 더블 클릭 이벤트 추가
            activeObject.on('mousedblclick', (event) => {
                // 더블 클릭된 객체를 가져옵니다
                const clickedObject = activeObject.getObjects();
                // 그룹 객체 제거
                canvas.remove(clickedObject);

                // 각 객체를 캔버스에 추가
                clickedObject.forEach((obj) => {
                    if(obj.type==='triangle'){
                        canvas.setActiveObject(obj)
                        canvas.add(obj);

                        obj.on('modified',(event)=>{

                            const pointer = obj.getCenterPoint(event.e);

                            // 삼각형이 이동할 때 연결된 rect와 circle도 함께 이동
                            const rect = clickedObject.find(o => o.type === 'rect');
                            const triangle = clickedObject.find(o => o.type === 'triangle');

                            if (rect) {
                                const xDiff = pointer.x - startPoint.current.x ;
                                const yDiff = pointer.y - startPoint.current.y;
                                const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
                                const angle = (Math.atan2(yDiff, xDiff) * 180) / Math.PI;

                                // rect 업데이트
                                rect.set({
                                    width: distance,
                                    angle: angle,
                                });

                                triangle.set({
                                    angle: angle+90,
                                    originX: 'center',
                                    originY: 'center',
                                    selectable: true,
                                    hasControls: true,
                                });
                            }

                            canvas.renderAll(); // 모든 객체를 다시 렌더링
                        })
                    }
                });
            });
            // If an object is selected, do not allow drawing
            return;
        }

        isDrawing.current = true;
        const pointer = canvas.getPointer(event.e);
        startPoint.current = pointer;

        // 선 옵션
        const rect = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 5,
            fill: 'blue',
            originX: 'left',
            originY: 'center',
            selectable: true,
        });

        // 화살표 끝 모양 옵션
        const triangle = new fabric.Triangle({
            left: pointer.x,
            top: pointer.y,
            width: 20,
            height: 20,
            fill: 'red',
            originX: 'center',
            originY: 'center',
            angle: 180,
            selectable: true,
        });

        // 원 옵션
        const circle  = new fabric.Circle({
            radius: 30,
            fill: "#ad040d",
            left: pointer.x,
            top: pointer.y,
            originX: "center",
            originY: "center",
            selectable: true,
        });

        // 텍스트 옵션 (원 안에 텍스트 박스)
        const textBox = new fabric.Textbox(String.fromCharCode(ArrowFromText.current),{
            left: pointer.x,
            top: pointer.y,
            fill: "#FFFFFF", // 흰색 텍스트
            originX: "center",
            originY: "center",
            selectable: true, // 텍스트 박스 수정 가능하게 함
        });

        // 동그라미와 텍스트를 그룹화
        const circleWithText = new fabric.Group([circle, textBox], {
            left: circle.left,
            top: circle.top,
            originX: 'center',
            originY: 'center',
            selectable: true,
            hasControls: true, // 크기 조정 가능하게 설정
            lockScalingY: true, // 원형 유지
        });

        // currentArrow에 저장
        currentArrow.current = { rect, triangle, circleWithText,  };

        canvas.add(rect, triangle, circleWithText,);
    };

    const onMouseMove = (event) => {
        // currentArrow가 초기화되었는지 확인
        if (!isDrawing.current || !startPoint.current) return;

        const pointer = canvas.getPointer(event.e);
        const xDiff = pointer.x - startPoint.current.x;
        const yDiff = pointer.y - startPoint.current.y;
        const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        const angle = (Math.atan2(yDiff, xDiff) * 180) / Math.PI; // 각도 계산

        const { rect,triangle} = currentArrow.current;

        // 선 업데이트
        rect.set({
            width: distance,
            angle: angle,
            selectable: true,
            hasControls: true,
        });

        // Move triangle (arrowhead) to the end of the shaft
        triangle.set({
            left: pointer.x,
            top: pointer.y,
            angle: angle+90,
            originX: 'center',
            originY: 'center',
            selectable: true,
            hasControls: true,
        });

        canvas.renderAll();
    };

    const onMouseUp = () => {
        if (!currentArrow.current) return;

        // 마우스 업 시 그룹핑
        const { rect,triangle, circleWithText  } = currentArrow.current;
        const group = new fabric.Group([rect,triangle, circleWithText], {
            selectable: true, // 그룹 선택 가능
            hasControls: true, // 그룹 크기 조절 및 회전 가능
            lockScalingY: false, // Y 축 크기 조절 제한
            lockScalingX: false
        });

        canvas.add(group);

        // 개별 객체는 캔버스에서 제거
        canvas.remove(rect);
        canvas.remove(triangle);
        canvas.remove(circleWithText);


        canvas.renderAll();

        ArrowFromText.current += 1;
        // 드래그 종료
        isDrawing.current = false;
        currentArrow.current = null; // Reset after drawing is complete
    };

    useEffect(() => {
        if (!canvas) return;

        // 마우스 이벤트 등록
        canvas.on('mouse:down', onMouseDown);
        canvas.on('mouse:move', onMouseMove);
        canvas.on('mouse:up', onMouseUp);

        return () => {
            // Cleanup: 마우스 이벤트 제거
            canvas.off('mouse:down', onMouseDown);
            canvas.off('mouse:move', onMouseMove);
            canvas.off('mouse:up', onMouseUp);
        };
    }, [canvas]);

    return <div />;
};

export default PointerArrow;