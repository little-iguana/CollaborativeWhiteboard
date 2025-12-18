import React, { useState } from 'react';
import BrushWidthSlider from './BrushWidthSlider.tsx';
//import {Move} from './MoveCanvasToggle.tsx';


type BrushWidthSliderHiderProps = {
	updateSliderVisibleFunction: (value: boolean) => void
	initialWidth: string
	updateBrushWidthFunction: (width: number) => void
	style
	sidebarDistanceFromTop: number
	sidebarDistanceFromLeft: number
	checkboxHeight: number
	checkboxWidth: number
}


function BrushWidthSliderHider(props: BrushWidthSliderHiderProps) {
	
	const [visible, setVisibility] = useState(false);
	
	const onStateChange = () => {
		setVisibility(!visible);
		// console.log(visible);
		props.updateSliderVisibleFunction(visible);
	}
	
	
		// <span onClick={onStateChange}>
        // <input type="checkbox" onChange={onStateChange} checked={visible} style={props.style} />
        // <span></span>
		// </span>
	return (<>
		<input type="checkbox"
			id="brushWidthSliderHider"
			value={visible.toString()}
			onChange={onStateChange}
			style={props.style}
		/>
		{
			visible &&
			<BrushWidthSlider
				initialWidth={props.initialWidth}
				updateBrushWidthFunction={props.updateBrushWidthFunction}
				style={{
					position: "absolute",
					top: (props.sidebarDistanceFromTop + (props.checkboxHeight / 3) + props.checkboxHeight) + "px",
					left: (props.sidebarDistanceFromLeft + props.checkboxWidth + 10) + "px",
					zIndex: 1,
					display: "block"
				}}
			/>
		}
    </>)
}

export default BrushWidthSliderHider;
