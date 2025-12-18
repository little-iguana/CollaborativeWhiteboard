import { Db, MongoClient } from 'mongodb';
import type { Stroke } from '../client/src/assets/Canvas.tsx'
import config from './app.config.ts';


const MongoDbServerUrl = 'mongodb://' + config.mongod_server_ip + ':' + config.mongod_server_port;
export { MongoDbServerUrl };

const client = new MongoClient(MongoDbServerUrl);


//Interface helps provide typing information for table and handling socket connections
export interface Room {
    _id: string;
    socketNumber: number;
    strokeHistory: Array<Stroke>
    participants: Array<String>
}

/**
 * Recieves the Db, a roomcode, and a socket number and asynchronously creates a new record
 * for the room.
 * 
 * @param db - the database object to operate on
 * @param roomcode - the room code for this room
 * @param socket - port number for the socket of the new room
 * @returns A room object or null if the operation was unsuccessful
 * 
 * @author BCampbell
 */
export async function CreateRoomEntry(db: Db, roomcode: string, socket: number) : Promise<Room | null> {
    const collection = db.collection<Room>('Rooms');
    const room: Room = {
        _id: `${roomcode}`,
        socketNumber: socket,
        strokeHistory: [],
        participants: []
    };
    try {
        const result = await collection.insertOne(room);
    if (result === null) {
        throw new Error("Error creating room");
    }
		return room;
    } catch(error) {
        console.log(error);
        return null;
    }
}

export async function UpdateHistory(db: Db, roomCode:string, incomingStroke: Stroke) : Promise<Stroke[] | null> {
    const collection = db.collection<Room>('Rooms');
    const room = await RoomSearch(db, roomCode);
    if (room === null) {
        return null
    }
    
    room.strokeHistory.push(incomingStroke);
    console.log(room);
    collection.updateOne({_id: `${roomCode}`}, {
        $set: {
            strokeHistory: room.strokeHistory
        }
    });
    return room.strokeHistory;
}

export async function CloseRoom(db: Db, roomCode:string) : Promise<Room | null> {
    const collection = db.collection<Room>('Rooms');
    try{
        const room = await collection.findOneAndDelete(
            {_id: `${roomCode}`}
		);
        if (room === null) {
            throw new Error("Room not found.");
        }
        return room;
    } catch(error) {
        console.log(error);
        return null;
    }
}

export async function RoomSearch(db: Db, roomCode: string): Promise<Room | null> {
    const collection = db.collection<Room>('Rooms');
    try {
        const room = await collection.findOne<Room>(
            {_id: `${roomCode}`}
        );
        console.log("here's the room search: "+room);
        if (room === null) {
            return null;
        }
        return room;
    } catch (error) {
        console.log(error);
        return null;
    }
}




//note to self: employ response codes for calls to express api

/*
Design of database code

First, start database instance
Then, initialise a rooms schema
Next, implement handling of requests (CRUD)
- Create request: A new entry is written to database. Assign websocket etc.
- Join request: Run a search on DB with the associated code provided. 
    - If found, return stroke history and add to participants
    - If not found, return error
- Update request: Writing to existing entry at specified room code
    - If room not found, error
    - If room found, add stroke to stroke history (better) OR send client's updated stroke history (worse for concurrency) 
- Close request: If no participants, room is deleted. Websocket is closed
- Undo will have its own fun issues to address :)
- Might need to record participant IDs to associate with stroke
When server is closed, truncate the table

*/

