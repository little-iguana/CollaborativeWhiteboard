import express, { raw } from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import { MongoDbServerUrl, type Room } from './IWDB.ts'
import { CreateRoomEntry, RoomSearch, UpdateHistory, CloseRoom } from './IWDB.ts'
import { Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import config from './app.config.ts';
import cors from 'cors';


const app = express();
app.use(cors());
app.use(express.json());

var IWDB: Db;
async function startMongo() {
	let mongodUrl = MongoDbServerUrl;
	if (!config.use_persistent_db) {
		const mongoServer = await MongoMemoryServer.create();
		mongodUrl = mongoServer.getUri();
	}
	
	const client = new MongoClient(mongodUrl)
	client.connect();
	console.log("Db client connected");
	try {
		IWDB = client.db("Rooms");
		console.log("Connection to IWDB database successful");
		const collection = IWDB.collection<Room>('Rooms');
		collection.drop();
		console.log("Rooms table reset.");
	} catch (error) {
		console.log(error);
	}
}
startMongo();

//Seed socket generator
let socketGen: number = 7000;


async function createNewCode(): Promise<String> {
    let output = "";
    let characters = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890";
    let charlen = characters.length;
    //Do while loop initialises a code to search against the database.
    //It will keep generating codes until it finds one that isn't in the database
    //(I.e a null result on RoomSearch)
    do {
        output = "";
        for (let i = 0; i < 6; i++) {
            output += characters[Math.floor(Math.random() * charlen)];
        }
        console.log("generated code: " + output);
    } while (await RoomSearch(IWDB, output) !== null);
	
    return output;
}


/**
 * Endpoint called to create a new room
 * 
 * @remarks
 * Handles setting up a room in the database, and setting up the websocket server.
 * Returns status 200 and a room object in the response body.
 * 
 * @author BCampbell
 */
app.get("/create", async (req, res) => {
    console.log("Incoming request on /create!");
    let roomCode = await createNewCode();
    socketGen++;
    let room = await CreateRoomEntry(IWDB, roomCode, socketGen);
    res.send(room).status(200);
    const wss = new WebSocketServer({ port: socketGen });
    wss.on('connection', (ws) => {
        console.log("New client connected to server");

        ws.on('message', async (message) => {
            let parsedMsg = JSON.parse(message);
            let stroke = await UpdateHistory(IWDB, parsedMsg.room._id, parsedMsg.strokeToDraw);
            //Broadcast message to all connected clients
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message.toString());
                }
            });
        });

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });
});

/**
 * FindRoom endpoint verifies a room exists and returns a room JSON object containing the info about the room.
 * 
 * @remarks
 * Since endpoints don't strictly take parameters or return values, this endpoint receives a request and
 * returns status 200 with a room object in the response body, or status 404 with null as the request body
 * 
 * @author BCampbell
 */
app.post("/findroom", async (req, res) => {
    console.log("Incoming find request on /findroom! ");
    let roomcode = req.body.roomcode;
    console.log("code: " + req.body.roomcode);
    let room = await RoomSearch(IWDB, roomcode);
    if (room) {
        res.status(200).send(room);
    }
    else {
		// should send null   vvv
        res.status(404).send(room);
    }
});

const HTTPPORT = 2211;
app.listen(HTTPPORT, () => {
    console.log(`HTTP server is listening on port ${HTTPPORT}`);
});


export { app };




