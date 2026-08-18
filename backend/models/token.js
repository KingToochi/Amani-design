import mongoose from "mongoose";

const token = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
        required: [true, 'User ID is required']
    },
    accessToken : {
        type: String,
        required: [true, 'accessToken is required']
    },
    refreshAccessToken : {
        type: String,
        required: [true, 'refreshToken is required']
    },
    hashedRecoveryToken : {
        type: String,
        required: [true, 'recoveryToken is required']
    }
})

export default token = mongoose.model('Token', token);