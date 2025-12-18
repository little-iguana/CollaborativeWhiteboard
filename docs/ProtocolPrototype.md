# Interactive Whiteboard Protocol (IWP) Prototype

## Actions to Consider to Encode in the Protocol
- Requesting a room to be found
- Creating a room
- Transmitting room data
- Leaving a room (?)
  `--> Use `socket.on('close', ...);` and have that do nothing unless
       the chat is added (to send a "[player] has left" message)
- Updating canvas state (broadcasting changes to each participant)
- Transmitting a stroke (sending a stroke to the database to add to the history)
- (Extension) Chat messages / Chat history

## Suggested methods

### Create
- Request: Requests to open a room, basically asking for a new socket to be opened?
- Response: Server assign a room code, sets a socket which future updates will be run through

### Read
- Request: requests a room with a code (and password?)
- Response: Server sends back resource with room history 

### Update
- Request: User sends stroke data to update room history
- Response: Server adds stroke to history, then sends response to all connections with updated room history.

### Close
- Request: User sends a request to close the room
- Response: DB sends a redirect action to participants (to home page) and deletes room information
