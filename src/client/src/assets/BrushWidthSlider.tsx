import React, { useState } from 'react';

export type BrushWidthButtonProps = {
	initialWidth: string
	updateBrushWidthFunction: (width: number) => void
	style
}

export function BrushWidthSlider(props: BrushWidthButtonProps) {
	const [width, setWidth] = useState(props.initialWidth);
	
	const onWidthChange = (value: number) => {
		setWidth(value.toString());
		props.updateBrushWidthFunction(value);
	}
	
    return (
    <>
		<input type="range" min="1" max="50" value={width} id="brushWidthInput"
			style={props.style}
			onChange={e => onWidthChange(parseFloat(e.target.value))}
		/>
    </>
    )
}

export default BrushWidthSlider;
