import User from '../Models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, "Please provide name, email, and password");
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        throw new ApiError(409, "User already exists");
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password
    });

    if (user) {
        const token = generateToken(user._id);
        const options = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };
        res.status(201).cookie('token', token, options).json({
            success: true,
            message: "User registered successfully",
            token
        });
    } else {
        throw new ApiError(400, "Invalid user data");
    }
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Please provide email and password");
    }

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
        const token = generateToken(user._id);
        const options = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };
        res.status(200).cookie('token', token, options).json({
            success: true,
            message: "Login successful",
            token
        });
    } else {
        throw new ApiError(401, "Invalid email or password");
    }
});
