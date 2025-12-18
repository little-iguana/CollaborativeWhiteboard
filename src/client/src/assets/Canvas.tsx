import React, { useState, useLayoutEffect, useRef, type PointerEvent } from 'react';
import MoveCanvasToggle from './MoveCanvasToggle.tsx';
import PaintColourButton from './PaintColourButton.tsx';
import BrushWidthSliderHider from './BrushWidthSliderHider.tsx';
import BackgroundColourButton from './BackgroundColourButton.tsx';
//import EraserButton from './EraserButton.tsx';
import SaveButton from './SaveButton.tsx';
import CircularBuffer from './CircularBuffer.ts';

export type CanvasProps = {
	sendStroke: (stroke: Stroke) => void
	recievedStroke: Array<Stroke> // Receives an array of strokes to redraw the canvas.
}

const strokeBufferSize = 500;
const startingBrushColour = "#111111";
const startingBrushWidth = 5;
const startingBackgroundColour = "#F6F6F6";
//const startingEraserState = false;
const startingMovingCanvasState = false;
const startingSliderVisibility = false;
let startPosition: [number, number] = [0,0];


export type Stroke = {
	strokeDisplacement: [number, number]
    strokeColour: string,
    strokeWidth: number,
    segments: Array<LineSegment | null>
    //Add extra fields for other information the stroke needs to keep track of as necessary
    //Add stroke type to differentiate between line, eraser, etc.
}

//This will compose a stroke. 
export type LineSegment = {
    start: Point | null,
    finish: Point | null
}

//Defines a 2D point on the canvas.
export type Point = [number, number];

export default function Canvas(props: CanvasProps) {
	
	const [absoluteCanvasLocation, updateAbsoluteCanvasLocation] = useState(startPosition);
	const [previousX, setPreviousX] = useState(0);
	const [previousY, setPreviousY] = useState(0);
	const [diffX, setDiffX] = useState(0);
	const [diffY, setDiffY] = useState(0);
	
	const [globalBrushColour, updateBrushColour] = useState(startingBrushColour);
	const [globalBrushWidth, updateBrushWidth] = useState(startingBrushWidth);
	const [globalBackgroundColour, updateBackgroundColour] = useState(startingBackgroundColour);
	//const [globalEraserState, updateEraserState] = useState(startingEraserState);
	const [movingCanvasState, updateMovingCanvasState] = useState(startingMovingCanvasState);
	const [, setSliderVisibility] = useState(startingSliderVisibility);
	
	
    const [isPointerDown, setIsPointerDown] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D>(null);
    const [lineSegment, setLineSegment] = useState<LineSegment | null>(null);
    const [stroke, setStroke] = useState<Stroke | null>(null);
    const [buffer, setBuffer] = useState<CircularBuffer<Stroke>>(new CircularBuffer<Stroke>(strokeBufferSize));
    
    
	function drawStroke(stroke: Stroke) {
		// Check if context has been rendered
		if (contextRef.current) {
			//Loop through segments of the stroke being drawn, and draw each segment.
			for (let segment of stroke.segments) {
				// segment is [X, Y]
				let screenBounds = canvasRef.current.getBoundingClientRect();
				if (segment.start[0] - absoluteCanvasLocation[0] < screenBounds.left &&
					segment.start[0] - absoluteCanvasLocation[0] > screenBounds.right &&
					segment.start[1] - absoluteCanvasLocation[1] < screenBounds.top &&
					segment.start[1] - absoluteCanvasLocation[1] > screenBounds.bottom &&
					segment.finish[0] - absoluteCanvasLocation[0] < screenBounds.left &&
					segment.finish[0] - absoluteCanvasLocation[0] > screenBounds.right &&
					segment.finish[1] - absoluteCanvasLocation[1] < screenBounds.top &&
					segment.finish[1] - absoluteCanvasLocation[1] > screenBounds.bottom
				) {
					continue;
				}
				contextRef.current.strokeStyle = stroke.strokeColour;
				contextRef.current.lineWidth = stroke.strokeWidth;
				contextRef.current.beginPath();
				contextRef.current.moveTo(segment.start[0] - absoluteCanvasLocation[0], segment.start[1] - absoluteCanvasLocation[1]);
				contextRef.current.lineTo(segment.finish[0] - absoluteCanvasLocation[0], segment.finish[1] - absoluteCanvasLocation[1]);
				contextRef.current.stroke();
				contextRef.current.closePath();
				contextRef.current.strokeStyle = stroke.strokeColour;
				contextRef.current.lineWidth = stroke.strokeWidth;
			}
		}
	}
	
	
	useLayoutEffect(() => {
		const canvas = canvasRef.current as HTMLCanvasElement;
        const context = canvas.getContext("2d");
        contextRef.current = context;
		// console.log("uLE: " + props.recievedStroke);
		
		// Check if there is something to draw
		if (!props.recievedStroke) {
			// console.log("none p.S");
			return;
		}
		
        // Updates canvas whenevr a stroke is received
		let updatedBuffer: CircularBuffer<Stroke> = buffer;

		// If a new stroke has been received, update the stroke history
		if(props.recievedStroke && props.recievedStroke.length > 0) {
			// console.log("p.rS &&: " + props.recievedStroke);
			for (const item of props.recievedStroke) {
				buffer.write(item);
			}
		}
		// Update the stroke history, then redraw the canvas.
		setBuffer(updatedBuffer);
		buffer.readAll().map(e => drawStroke(e));

        // Need to include the props here in dependency array
	}, [props.recievedStroke]);
	
	
	
    //Primary thing this does is begin recording a new stroke.
    //No segment should be created. Just a stroke initiated.
    const handlePointerDown = (e: PointerEvent) => {
		setIsPointerDown(true);
		if (movingCanvasState == false) {
			// Check if canvas has loaded. If it has, we can begin drawing.
			// Then load in all the current canvas settings for the stroke to be created and initiate stroke,
			// as well as initialising the first line segment.
			if (contextRef.current) {
				contextRef.current.strokeStyle = globalBrushColour;
				contextRef.current.lineWidth = globalBrushWidth;
				contextRef.current.beginPath();
				contextRef.current.moveTo(e.clientX, e.clientY);
				let newLineSegment: LineSegment = {
					start: [absoluteCanvasLocation[0] + e.clientX, absoluteCanvasLocation[1] + e.clientY],
					finish: null
				}
				setLineSegment(newLineSegment);
				let newStroke: Stroke = {
					strokeDisplacement: absoluteCanvasLocation,
					strokeColour: contextRef.current.strokeStyle,
					strokeWidth: contextRef.current.lineWidth,
					segments: new Array<LineSegment>
				}
				setStroke(newStroke);
			}
		} else {
			setPreviousX(e.clientX);
			setPreviousY(e.clientY);
		}
    }

    //Needs to create a new LineSegment each time mouse is moved.
    const handlePointerMove = (e: PointerEvent) => {
		if (!isPointerDown) {
			return;
		}
		if (movingCanvasState == false) {
			if (contextRef.current){
				if (lineSegment && lineSegment.start){
					contextRef.current.moveTo(lineSegment.start[0] - absoluteCanvasLocation[0], lineSegment.start[1] - absoluteCanvasLocation[1]);
				}
				
				contextRef.current.lineTo(e.clientX, e.clientY);
				contextRef.current.stroke();
				//Close line segment
				let oldLineSegment = lineSegment;
				if (!oldLineSegment){
					return;
				}
				oldLineSegment.finish = [absoluteCanvasLocation[0] + e.clientX, absoluteCanvasLocation[1] + e.clientY];
				contextRef.current.closePath();
				stroke?.segments.push(oldLineSegment);

				//Begin new line segment
				contextRef.current.beginPath();
				contextRef.current.moveTo(e.clientX,e.clientY);
				let newLineSegment: LineSegment = {
					start: [absoluteCanvasLocation[0] + e.clientX, absoluteCanvasLocation[1] + e.clientY],
					finish: null
				}
				setLineSegment(newLineSegment);
			}
		} else {
			setDiffX(previousX - e.clientX);
			setDiffY(previousY - e.clientY);
			updateAbsoluteCanvasLocation([absoluteCanvasLocation[0] + diffX, absoluteCanvasLocation[1] + diffY]);
			setPreviousX(e.clientX);
			setPreviousY(e.clientY);
			
			contextRef.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
			for (const stroke of buffer.readAll()) {
				drawStroke(stroke);
			}
		}
    }
    
    //Need to close current line segment, add it, then update stroke history.
    const handlePointerUp = (e: PointerEvent) => {
		setIsPointerDown(false);
		if (movingCanvasState == false) {
			if (contextRef.current){
				contextRef.current.closePath();
				if (!lineSegment){
					return;
				}
				let oldLineSegment = lineSegment;
				
				oldLineSegment.finish = [absoluteCanvasLocation[0] + e.clientX, absoluteCanvasLocation[1] + e.clientY];
				setLineSegment(oldLineSegment);
				stroke?.segments.push(lineSegment);
			}
			let updatedBuffer: CircularBuffer<Stroke> = buffer;
			if (!stroke){
				return;
			}
			// updatedBuffer.write(stroke);
			setBuffer(updatedBuffer);
			// console.log(buffer);
			props.sendStroke(stroke);
		}
    }
	
	function saveCanvas() {
		if (canvasRef.current) {
			// console.log("saveCanvas inner called");
			const link = document.createElement('a');
			link.href = canvasRef.current.toDataURL();
			link.download = 'my-drawing.png';
			link.click();
		}
	}
	
	/* Unfinished
	const updateErasing = () => {
		updateEraserState();
	};
	*/
	
	const sidebarDistanceFromLeft = 5;
	const sidebarDistanceFromTop = 5;
	
	const checkboxWidth = 32;
	const checkboxHeight = 32;
	
	const colourSelectorOffset = 4;
    
    return (
    <>
		<MoveCanvasToggle
			updateMovingCanvasFunction={updateMovingCanvasState}
			style={{
				position: "absolute",
				top: sidebarDistanceFromTop + "px",
				left: sidebarDistanceFromLeft + "px",
				zIndex: 5,
				width: checkboxWidth,
				height: checkboxHeight
			}}
		/>
		
		<BrushWidthSliderHider
			updateSliderVisibleFunction={setSliderVisibility}
			
			initialWidth={globalBrushWidth.toString()}
			updateBrushWidthFunction={updateBrushWidth}
			
			sidebarDistanceFromTop={sidebarDistanceFromTop}
			sidebarDistanceFromLeft={sidebarDistanceFromLeft}
			checkboxHeight={checkboxHeight}
			checkboxWidth={checkboxWidth}
			
			style={{
				position: "absolute",
				top: (sidebarDistanceFromTop + checkboxHeight) + "px",
				left: sidebarDistanceFromLeft + "px",
				zIndex: 4,
				width: checkboxWidth,
				height: checkboxHeight,
				background: "url('unchecked.png') no-repeat left center"
			}}
		/>
		
		<PaintColourButton
			initialBrushColour={globalBrushColour}
			updateBrushColourFunction={updateBrushColour}
			style={{
				position: "absolute",
				top: (sidebarDistanceFromTop + checkboxHeight * 2 + colourSelectorOffset) + "px",
				left: (sidebarDistanceFromLeft + colourSelectorOffset) + "px",
				zIndex: 3,
				width: checkboxWidth,
				height: checkboxHeight,
			}}
		/>
		
		<BackgroundColourButton
			initialBackgroundColour={globalBackgroundColour}
			updateBackgroundColourFunction={updateBackgroundColour}
			style={{
				position: "absolute",
				top: (sidebarDistanceFromTop + checkboxHeight * 3 + colourSelectorOffset) + "px",
				left: (sidebarDistanceFromLeft + colourSelectorOffset) + "px",
				zIndex: 3,
				width: checkboxWidth,
				height: checkboxHeight,
			}}
		/>
		{/*
		<EraserButton
			initialEraserState={globalEraserState}
			updateEraserStateFunction={updateErasing}
			style={{
				position: "absolute",
				top: (sidebarDistanceFromTop + checkboxHeight * 4) + "px",
				left: sidebarDistanceFromLeft + "px",
				zIndex: 2,
				width: checkboxWidth,
				height: checkboxHeight
			}}
		/>
		*/}
		
		<SaveButton
			saveCanvasFunction={saveCanvas}
			style={{
				position: "absolute",
				top: (sidebarDistanceFromTop + checkboxHeight * 5) + "px",
				left: sidebarDistanceFromLeft + "px",
				zIndex: 1,
				width: checkboxWidth,
				height: checkboxHeight
			}}
		/>
		
        <canvas id="canvas" 
			width={window.innerWidth} 
			height={window.innerHeight}
			style={{
				width: "100%",
				height: "100%",
				background: globalBackgroundColour,
				zIndex: 0
			}}
			onPointerDown={handlePointerDown}
			onPointerUp={handlePointerUp}
			onPointerMove={handlePointerMove}
			ref={canvasRef}
		/>
    </>
    )
}




