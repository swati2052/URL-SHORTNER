import mongoose from 'mongoose';

const shortUrlSchema = new mongoose.Schema({
    full_url: {
        type: String,
        required: true
    },
    short_url: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    clicks: {
        type: Number,
        required: true,
        default: 0
    },
    user :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',

    },
    createdAt: {
        type: Date,
        expires: '48h', // The document will be automatically deleted after 48 hours
        default: Date.now
    }
});

const ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);

export default ShortUrl;