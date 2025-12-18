import React, { useState } from 'react';


export type MoveCanvasToggleProps = {
	updateMovingCanvasFunction: (value: boolean) => void
	style
}


function MoveCanvasToggle(props: MoveCanvasToggleProps) {
	
	const [inMotion, setInMotion] = useState(true);
	
	const onStateChange = () => {
		setInMotion(!inMotion);
		// console.log(inMotion);
		props.updateMovingCanvasFunction(inMotion);
	}
	
	
	return (<>
		<input type="checkbox"
			id="movecanvastogglebutton"
			value={inMotion.toString()}
			onChange={onStateChange}
			style={props.style}
		/>
    </>)
}

export default MoveCanvasToggle;
