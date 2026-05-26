import { createShortUrlWithoutUser, createShortUrlWithUser } from "../services/shortUrl.service.js";
import { getShortUrl, getUserShortUrls } from '../dao/shortUrl.js';
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const createShortUrl = asyncHandler(async (req, res) => {
    const { url } = req.body;
    
    console.log("Received URL:", url, "Type:", typeof url);

    const shortUrl = await createShortUrlWithoutUser(url);

    res.status(201).send(
        process.env.APP_URL + shortUrl.short_url
    );
});

export const createCustomShortUrl = asyncHandler(async (req, res) => {
    const { url, slug } = req.body;
    const userId = req.user._id;

    const shortUrl = await createShortUrlWithUser(url, userId, slug);

    res.status(201).send(
        process.env.APP_URL + shortUrl.short_url
    );
});

export const redirectFromShortUrl = asyncHandler(async (req, res) => {
    const { shortUrl } = req.params;

    const url = await getShortUrl(shortUrl);

    if (!url) {
        throw new ApiError(404, "Short URL not found");
    }

    return res.redirect(url.full_url);
});

export const getUserUrls = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const urls = await getUserShortUrls(userId);

    res.status(200).json({
        success: true,
        data: urls
    });
});