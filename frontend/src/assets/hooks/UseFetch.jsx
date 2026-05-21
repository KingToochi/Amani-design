import {BASE_URL} from "../Url";

const CustomFetch = async(url, options = {}) => {
    try {
        let response = await fetch(url, {
            ...options,
            credentials: "include"
        })

        if (response.status === 401 && !url.includes("/refresh")) {
            let refreshTokenResponse = await fetch(`${BASE_URL}/refresh`, {
                method: "POST",
                credentials: "include"
            })

            if (refreshTokenResponse.ok) {
                response =  await fetch(url, {
                    ...options,
                    credentials: "include"
                })
            } else {
                localStorage.clear()
                window.location.href = "/login"
                return 
            }
        }

        return response
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }

}

export default CustomFetch;