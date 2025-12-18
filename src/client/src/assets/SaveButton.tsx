import React, { useState } from 'react';


type SaveButtonProps = {
	saveCanvasFunction: () => void
	style
}


function SaveButton(props: SaveButtonProps) {
	
	// const [] = useState();
	
	return (<>
		<button
			onClick={() => { props.saveCanvasFunction(); }}
			style={props.style}
		/>
    </>)
}

export default SaveButton;
