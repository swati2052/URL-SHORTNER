import express from 'express';
import dotenv from 'dotenv';

import connectDB from './src/config/mongo.config.js';
import shortUrl from './src/routes/shortUrl.route.js';
import { redirectFromShortUrl } from './src/controller/shortUrl.controller.js';
import errorMiddleware from './src/middleware/error.middleware.js';

dotenv.config();

console.log(process.env.MONGO_URL);

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/create', shortUrl);

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