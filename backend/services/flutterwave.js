import axios from "axios";

let accessToken = null;
let expiresAt = 0;

export async function getAccessToken() {

    if (accessToken && Date.now() < expiresAt) {
        return accessToken;
    }

    const body = new URLSearchParams();

    body.append("client_id", process.env.FLW_CLIENT_ID);
    body.append("client_secret", process.env.FLW_CLIENT_SECRET);
    body.append("grant_type", "client_credentials");

    const response = await axios.post(
        "https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token",
        body,
        {
            headers: {
                "Content-Type":
                "application/x-www-form-urlencoded"
            }
        }
    );

    accessToken = response.data.access_token;

    expiresAt =
        Date.now() +
        (response.data.expires_in * 1000) -
        60000;

    return accessToken;
}