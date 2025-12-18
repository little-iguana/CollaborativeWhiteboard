import React, { useState } from 'react';


type BackgroundColourButtonProps = {
	initialBackgroundColour: string
	updateBackgroundColourFunction: (colour: string) => void
	style
}

function BackgroundColourButton(props: BackgroundColourButtonProps) {
	const [colour, setColour] = useState(props.initialBackgroundColour);
	
	const onColourChange = (value: string) => {
		setColour(value);
		props.updateBackgroundColourFunction(value);
	}
	
	return (<>
		<input type="color" value={colour} id="backgroundColourInput"
			style={props.style}
			onChange={e => onColourChange(e.target.value)}
		/>
    </>)
}

export default BackgroundColourButton;
