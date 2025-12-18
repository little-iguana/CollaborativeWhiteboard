import React, { useState, useEffect } from 'react';
import Canvas, { type Stroke } from './assets/Canvas.tsx';
import RoomCodeText from './assets/RoomCodeText.tsx';
import type { Room } from '../../server/IWDB.ts';
import WebSocketFactory from './WebSocketFactory.ts';


export type HostProps = {
    address: string
};

export default function Host(props: HostProps) {

	const [room, setRoom] = useState<Room>();
	const [contextRef, setContextRef] = useState();
	const [socket, setSocket] = useState<WebSocket>();
	const [recievedStroke, setRecievedStroke] = useState([]);


	const sendStroke = (stroke: Stroke) => {
		if (stroke && socket && socket.readyState === WebSocket.OPEN) {
			let packet = {
				action: "Update",
				room: room,
				strokeToDraw: stroke
			}
			socket.send(JSON.stringify(packet));
		}
	}

	useEffect(() => {
		console.log("Host address: " + JSON.stringify(props.address));
		fetch("http://" + props.address + ":2211/create")
			.then(response => response.json())
			.then(incRoom => {
				setRoom(incRoom);
				let newWebsocket = WebSocketFactory(incRoom, props.address, setSocket, setRecievedStroke);
			});
	}, []);



	return (<>
		<Canvas
			sendStroke={sendStroke}
			recievedStroke={recievedStroke}
		/>
		{room && <RoomCodeText text={`roomcode: ${room._id} port: ${room.socketNumber} `} />}
	</>)
}






