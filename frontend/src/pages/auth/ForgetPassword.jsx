import { useState } from "react"
import CustomFetch from "../../hooks/useFetch"
import { BASE_URL } from "../../Url"
import Popup from "../../components/common/Popup"


const url = `${BASE_URL}/users/forget_password`

export const UseEmailAddress = () => {
    const [email, setEmail] = useState("")

    const handleChange = (event) => {
        setEmail(event.target.value)
    }

    const handleSubmit = async(event) => {
        event.preventDefault()
       try{
            if (!email || email.trim() === "") {
                Popup({message: "can't submit empty field",type:"error"})
                return
            }

            const submitEmail = await fetch(url, {
                method : "POST",
                headers: {
                        "Content-Type": "application/json"
                    },
                body : JSON.stringify({email})
            })

            const response = await submitEmail.json()

            if (!response.ok) {
                 throw new Error(response.message || "Something went wrong")
            }

            Popup({message: "A verification link has been sent to your email address", type: "success"})
       }catch(error) {
        console.log(error)
        Popup({message: error.message, type:"error"})
       }
        
    }

    return(
        <div>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="enter your email address" value={email} name="email" onChange={handleChange}/>
                <button type="submit">submit</button>
            </form>
        </div>
    )
}

export const UseUsername = () => {
    const [username, setUsername] = useState("")

    const handleChange = (event) => {
        const {value} = event.target
        setUsername(value)
    }

    const handleSubmit = async(event) => {
        event.preventDefault()
        try {
            if (!username || username.trim() ===  "") {
                 Popup({message: "can't submit empty field",type:"error"})
                return
            }

            const submitUsername = await CustomFetch(url, {
                method : "POST",
                body : JSON.stringify({username})
            })

            const response = await submitUsername.json()

            if (!response.ok) {
                 throw new Error(response.message || "Something went wrong")
            }

            Popup({message: "A verification link has been sent to your email address", type: "success"})
        }catch(error){
            console.log(error)
            Popup({message: error.message, type:"error"})
        }
    }

    return(
        <div>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="enter your username" value={username} name="username" onChange={handleChange} />
                <button type="submit">submit</button>
            </form>
        </div>
    )
}

const ForgetPassword = () => {
    const [meanOfPasswordRovery,setMeanOfPasswordRecovery] = useState("email")


    return(
        <div>
            {meanOfPasswordRovery === "email" ? <UseEmailAddress/> : <UseUsername/> }
            <div>
                {meanOfPasswordRovery === "email" ? 
            <button onClick={() => setMeanOfPasswordRecovery("username")}>
                Use Username
            </button>   
            :
            <button onClick={() => setMeanOfPasswordRecovery("email")}>Use Email Address</button> 
            }
            </div>
        </div>
    )
}

export default ForgetPassword