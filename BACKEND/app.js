import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectDB from './src/config/mongo.config.js';
import shortUrl from './src/routes/shortUrl.route.js';
import authRoutes from './src/routes/auth.routes.js';
import { redirectFromShortUrl } from './src/controller/shortUrl.controller.js';
import errorMiddleware from './src/middleware/error.middleware.js';

dotenv.config();

console.log(process.env.MONGO_URL);

const app = express();

// Middlewares
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/create', shortUrl);
app.use('/api/auth', authRoutes);

// Redirect Route
app.get('/:shortUrl', redirectFromShortUrl);

// Test Route
app.get('/', (req, res) => {
    res.send("Backend Running Successfully");
});

// Error Middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

// Database Connection
connectDB()
    .then(() => {

        console.log("MongoDB Connected");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error);
    });