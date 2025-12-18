import {describe, it, expect, test} from 'vitest'
import supertest from 'supertest'
import {app} from '../source/server/protoserver.ts'
import { Db, MongoClient } from 'mongodb';
import { JoinRequest, CreateRoomEntry, UpdateHistory, type Room  } from '../source/server/IWDB.ts';
import { type Stroke } from '../source/client/src/assets/Canvas.tsx';

describe("HTTP server on 2211", () => {
	it("get /create", async () => {
		const response = await supertest(app).get("/create");
		
		expect(response.status).toBe(200);
		expect(response.body).toBeDefined();
	});
	
	it("post /join", async () => {
		const response = await supertest(app).post("/join").send({roomcode: 1});
		
		expect(response.status).toBe(200);
	});
	
	it("post /findroom", async () => {
		const response = await supertest(app).post("/findroom").send({roomcode: 2});
		
		expect(response.status).toBe(404);
	});
});

//For these to work you need to have mongod process running.
describe("Database integration test", async () => {
	const client = new MongoClient('mongodb://localhost:27017');
	let IWDB: Db;
	try {
		IWDB = client.db("Rooms");
		console.log("Connection to IWDB database successful");
		const collection = IWDB.collection<Room>('Rooms');
		collection.drop();
		console.log("Rooms table reset.");
	} catch (error) {
		console.log(error);
	}
	test('Creates room entry on IWDB', async () => {
		let room = await CreateRoomEntry(IWDB, 3, 7003);
		expect(room).toBeDefined();
		if (room === null){
			return;
		}
		let dummyRoom = {
			_id: room._id,
			//roomcode: '1',
			socketNumber: 7003,
			strokeHistory: [],
			participants: []
		}
		expect(room).toEqual(dummyRoom);		
	})
	test('Retrieves room entry on IWDB', async () => {
		let room = await JoinRequest(IWDB, '3');
		expect(room).toBeDefined;
		if (room === null){
			return;
		}
		let dummyRoom = {
			_id: '3',
			socketNumber: 7003,
			strokeHistory: [],
			participants: []
		}
		expect(room).toEqual(dummyRoom);	
	})
	test('Successfully updates room stroke history', async () => {
		let room = await JoinRequest(IWDB, '3');
		let strokeToAdd: Stroke = {
			strokeDisplacement: [0,0],
			strokeColour: "000000",
			strokeWidth: 5,
			segments: [{
				start: [0,0],
				finish: [10,10]
			}]
		}
		let history: Stroke[] | null = await UpdateHistory(IWDB, '3', strokeToAdd);
		expect(history).toBeDefined();
		if (history !== null)
		expect(history[0]).toEqual(strokeToAdd);

	})

})