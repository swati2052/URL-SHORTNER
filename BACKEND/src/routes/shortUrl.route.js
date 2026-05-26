import express from 'express';
import { createShortUrl, createCustomShortUrl, getUserUrls } from '../controller/shortUrl.controller.js';
import { protect } from '../middleware/auth.middleware.js';
const router = express.Router();


router.post('/', createShortUrl);
router.post('/custom', protect, createCustomShortUrl);
router.get('/my-urls', protect, getUserUrls);

export default router;