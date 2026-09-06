import { BASE_URL } from "../../Url";


export const verifyEmail = async(event) => {
    const url = `${url}/users/email`
    const {value} = event.target
    if (!value) return
    try {
        let response = await fetch(url, {
            method: "POST",
            headers : {"Content-Type" : "application/json"},
            body: JSON.stringify({email: value})
        })
        let data = await response.json()
        if(data.status === "exists") {
                 // Set error for the username field
                setError("email", {
                    type: "manual",
                    message: "This email is already used"
                });
            }else {
                // Clear username error if it exists
                clearErrors("email");
            }
        
    } catch(error) {
        console.log(error)
    }
}