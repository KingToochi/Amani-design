export const generateNonce = () => {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let nonce = "";

    const bytes = crypto.randomBytes(12);

    for (let i = 0; i < 12; i++) {
        nonce += chars[bytes[i] % chars.length];
    }

    return nonce;
}