import React, { useState } from 'react';


type RoomCodeTextProps = {
	text: string
}


function RoomCodeText(props: RoomCodeTextProps) {
	
	return (<>
		<div>
			<p style={{
				position: "absolute",
				bottom: "10px",
				left: "20px",
				zIndex: 1
			}}>{props.text}</p>
		</div>
    </>)
}

export default RoomCodeText;
