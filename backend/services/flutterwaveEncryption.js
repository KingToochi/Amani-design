export async function encryptAES(data, encryptionKey, nonce) {
    const cryptoSubtle =
        globalThis.crypto?.subtle ||
        require("crypto").webcrypto.subtle;

    const decodedKey = Uint8Array.from(
        atob(encryptionKey),
        c => c.charCodeAt(0)
    );

    const key = await cryptoSubtle.importKey(
        "raw",
        decodedKey,
        { name: "AES-GCM" },
        false,
        ["encrypt"]
    );

    const encrypted = await cryptoSubtle.encrypt(
        {
            name: "AES-GCM",
            iv: new TextEncoder().encode(nonce)
        },
        key,
        new TextEncoder().encode(data)
    );

    return Buffer.from(encrypted).toString("base64");
}