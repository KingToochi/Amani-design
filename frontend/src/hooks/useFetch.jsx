import {BASE_URL} from "../Url";

const CustomFetch = async(url, options = {}) => {
    try {
        let response = await fetch(url, {
            ...options,
            credentials: "include"
        })

        if (response.status === 401 && !url.includes("/refresh")) {
            const refreshTokenResponse = await fetch(`${BASE_URL}/refresh`, {
                method: "POST",
                credentials: "include"
            })

            if (refreshTokenResponse.ok) {
                const userInfoResponse = await fetch(`${BASE_URL}/userInfo`, {
                    method: "GET",
                    credentials: "include"
                })

                if (userInfoResponse.ok) {
                    const userInfo = await userInfoResponse.json();
                    if (userInfo?.user) {
                        localStorage.setItem("user", JSON.stringify(userInfo.user));
                    }
                }

                response =  await fetch(url, {
                    ...options,
                    credentials: "include"
                })
            }
        }

        if (response.status === 401) {
            localStorage.removeItem("user")
            window.location.href = "/login"
            return
        }

        return response
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

export default CustomFetch;