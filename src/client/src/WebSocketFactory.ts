
export default function WebSocketFactory(
		incRoom: any,
		serverAddress: string,
		setSocketFunction: (value: any) => void,
		setRecievedStrokeFunction: (value: any) => void
	) {
	let newWebsocket = new WebSocket(
		'ws://' + serverAddress + `:${incRoom.socketNumber}`,
		'echo-protocol'
	);
	newWebsocket.onopen = () => {
		console.log('WebSocket connection established');
	};

	newWebsocket.onmessage = function(event: any) {
		const message = JSON.parse(event.data);
		const messageHeader = message.action;
		if (messageHeader === "Update") {
			setRecievedStrokeFunction([message.strokeToDraw]);
		}
	};

	newWebsocket.onclose = () => {
		console.log('WebSocket connection closed');
	};

	newWebsocket.onerror = (error) => {
		console.error('WebSocket error:', error);
	};
	setSocketFunction(newWebsocket);
	return () => {
		newWebsocket.close();
	};
	
	return newWebsocket;
}
