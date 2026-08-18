import Token  from '../../models/token.js';

const storeToken = async (userId, accessToken, refreshAccessToken, hashedRecoveryToken) => {

    const existingToken = await token.findOne({ userId });
    if (existingToken) {
        existingToken.accessToken = accessToken;
        existingToken.refreshAccessToken = refreshAccessToken;
        existingToken.hashedRecoveryToken = hashedRecoveryToken;
        await existingToken.save();
        return({message: "Token updated successfully"});
    }

    const newToken = new token({
        userId,
        accessToken,
        refreshAccessToken,
        hashedRecoveryToken : hashedRecoveryToken
    });
    await newToken.save();
    return({message: "Token stored successfully"});

}

export default storeToken;