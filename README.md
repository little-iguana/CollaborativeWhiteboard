# Interactive Whiteboard project

by Braeden & Dan


This is more of a demo that a deployable project.



## How to run:
The server needs two processes to run to serve the frontend pages and the backend server
1. Start by changing the `server_ip` value in src/client/app.config.ts to be the address of the server
2. If you plan to use a persistent database, start that and set the address:port for it in src/server/app.config.ts
2. Run `node protoserver.ts` in /src/server to start the backend server
3. Run `npm run dev` in /src/client to start the frontend server
4. View the webpage in a browser by entering the value that you put in src/client/app.config.ts followed by ":5173".
