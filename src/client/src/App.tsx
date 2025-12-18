import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './style.css';
import Home from './Home.tsx';
import Host from './Host.tsx';
import Participant from './Participant.tsx';
import config from './app.config.ts';


var serverAddress = config.server_ip;

function App() {
	
	return (<>
		<Routes>
			<Route
				path="/"
				element={<Home
					address={serverAddress}
				/>}
			/>
			<Route
				path="/host"
				element={<Host
					address={serverAddress}
				/>}
			/>
			<Route
				path="/participate/:code"
				element={<Participant
					address={serverAddress}
				/>}
			/>
		</Routes>
	</>);
}

export default App;
