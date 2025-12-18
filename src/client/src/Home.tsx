import React, { useState } from 'react';
import { Link } from 'react-router-dom';


export type HomeProps = {
    address: string
};

export default function Home(props: HomeProps) {
	
	const [formdata, setFormData] = useState({ code: "" });
	
	const handleChangeCode = (e) => {
		const { code, value } = e.target;
		setFormData({
			...formdata,
			code: value
		});
	};
	
	const handleChangeIp = (e) => {
		
		const { ip, value } = e.target;
		setFormData({
			...formdata,
			ip: value
		});
	};
	
	async function handleSubmitParticipant() {
		const roomFormcode = formdata.code;
		console.log(JSON.stringify(formdata));
		
		const response = await fetch("http://" + props.address + ":2211/findroom",{
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({roomcode: `${roomFormcode}`})
		});
		const roomExists = await response.json();

		if (roomExists) {
			window.location.href = `/participate/${encodeURIComponent(formdata.code)}`;
		}
	}
	
	async function handleSubmitHost() {
		const roomFormcode = formdata.code;
		const response = await fetch("http://" + props.address + ":2211/create");
		window.location.href = "/host";
	}
	
	return (<>
		<nav style={{
			justifyContent: "center"
		}}>
			<Link to="/host">Host a room</Link>
			<form action={handleSubmitParticipant}>
				<input
					type="text"
					name="code"
					value={formdata.code}
					onChange={handleChangeCode}
				/>
				<input type="submit" value="Join" />
			</form>
		</nav>
	</>)
}






