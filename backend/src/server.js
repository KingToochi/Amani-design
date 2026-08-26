import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";

dotenv.config();
await connectDB();

const server = http.createServer(app);
new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`Server running on port ${port}`));