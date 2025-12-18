# MongoDB Database Design Draft

## Data storage requirements
The database will be responsible for storing all room information. It is a resource which the backend server will connect to when needing to transmit room information.

## What specific data will be tracked by the database?

Absolutely necessary:
- Roomcode
- Associated websocket
- Stroke History
- Participant IDs / People currently in room (To track who makes strokes for undo/redo functionality)

Optional for additional features
- Active participants (To display a user count to users within a room)
- Host (If host privileges are implemented and we wish to transfer host ownership if the host leaves a room)

## Table composition

We only really require one table for this purpose: a Rooms table. It can store the room code and websocket, active participants, stroke history, and host information, as these will all be specific to a single room.



