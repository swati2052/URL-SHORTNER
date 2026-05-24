import { createShortUrlWithoutUser } from "../services/shortUrl.service.js";
import { getShortUrl } from '../dao/shortUrl.js';
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const createShortUrl = asyncHandler(async (req, res) => {
    const { url } = req.body;

    const shortUrl = await createShortUrlWithoutUser(url);

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