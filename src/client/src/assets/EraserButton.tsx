import React, { useState } from 'react';


type EraserButtonProps = {
	initialEraserState: boolean
	updateEraserStateFunction: (state: boolean) => void
	style: any
}


function EraserButton(props: EraserButtonProps) {
	const [state, setState] = useState(props.initialEraserState);
	
	const onStateChange = (value: boolean) => {
		setState(value);
		props.updateEraserStateFunction(value);
	}
	
	return (<>
		<input type="checkbox" value={state.toString()} id="backgroundColourInput"
			style={props.style}
			onChange={e => {
				if (e.target.value === 'true'){
					onStateChange(true)
				}else{
					onStateChange(false)
				}}}
		/>
    </>)
}

export default EraserButton;
