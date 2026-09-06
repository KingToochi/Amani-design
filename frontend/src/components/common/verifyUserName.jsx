import { BASE_URL } from "../../Url";


export const verifyUsername = async(event) => {
        const {value} = event.target
        try {
            let response = await fetch(`${url}/users/username`, {
                method: "POST",
                headers : {"Content-Type" : "application/json"},
                body: JSON.stringify({username: value})
            })
            let data = await response.json()

            if(data.status === "exists") {
                 // Set error for the username field
                setError("username", {
                    type: "manual",
                    message: "This username is already used"
                });
            }else {
                // Clear username error if it exists
                clearErrors("username");
            }
            
        } catch(error) {
            console.log(error)
        }
    }