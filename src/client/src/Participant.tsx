import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import Canvas from './assets/Canvas.tsx';
import type { Stroke } from './assets/Canvas.tsx';
import type { Room } from '../../server/IWDB.ts';
import RoomCodeText from './assets/RoomCodeText.tsx';
import WebSocketFactory from './WebSocketFactory.ts';


export type ParticipantProps = {
    address: string
};

export default function Participant(props: ParticipantProps) {

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

    function socketOnMessage(event: any) {
        const message = JSON.parse(event.data);
        const messageHeader = message.action;
        if (messageHeader === "Update") {
            setRecievedStroke([message.strokeToDraw]);
        }
    }

    useEffect(() => {
        let roomcode = window.location.pathname.split('/')[2];
        fetch("http://" + props.address + ":2211/findroom", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomcode: roomcode })
        })
		.then(response => response.json())
		.then(incRoom => {
			let i = 0;
			
			const newStrokes = recievedStroke.concat([]);
			for(let stroke of incRoom.strokeHistory){
				newStrokes.push(stroke);
				i++;
			}
			setRecievedStroke(newStrokes);
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






