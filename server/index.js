import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import http from "http";
import { Server } from "socket.io"; // ✅ import Socket.IO server

import connectDB from './config/connectDB.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import subCategoryRoutes from './routes/subCategoryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app); // ✅ wrap app in HTTP server

// ✅ initialize socket.io server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
  },
});

// ✅ SOCKET.IO event handling
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("send-location", (data) => {
    console.log("Location received:", data);
    io.emit("receive-location", data); // Broadcast location to all clients
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 8080;

connectDB().then(() => {
  // ✅ start the HTTP server, not app.listen
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
