import { useState, useEffect } from "react"
import { BASE_URL } from "../../../Url"
import CustomFetch from "../../../hooks/useFetch"
import Popup from "../../../components/common/Popup"
import { set } from "mongoose"
const Subscription = () => {
    const [currentSubscriptionPlan, setCurrentSubscriptionPlan] = useState("")
    const [subscriptionExpiryDate, setSubscriptionExpiryDate] = useState("")
    const [subscriptionStartDate, setSubscriptionStartDate] = useState("")
    const [subscriber, setSubscriber] = useState(false)
    const [subscriptionStatus, setSubscriptionStatus] = useState("")
    const [user, setUser] = useState()
    const [loading, setLoading] = useState("")
    const [subscriptionPlan, setSubscriptionPlan] = useState([
        {
            plan : "basic",
            benefit : {
                "pictures per Product" : "",
                "variant option" : "",
                "product limit" :  "",
                "visibilty" : "",
                "extracted comission" : "",
            }
        },
        {
            plan : "standard",
            benefit : {
                "pictures per Product" : "",
                "variant option" : "",
                "product limit" :  "",
                "visibilty" : "",
                "extracted comission" : "",
            }
        },
        {
            plan : "premium",
            benefit : {
                "pictures per Product" : "",
                "variant option" : "",
                "product limit" :  "",
                "visibilty" : "",
                "extracted comission" : "",
            }
        }
    ])
    const userInfoUrl = `${BASE_URL}/users/info`


    useEffect(async()=> {
        try {
            const fetchUserInfo = await CustomFetch(userInfoUrl, {
                method : "GET"
            })
            const response = await fetchUserInfo.json()

            if(!response.success) throw new Error("unable to fetch your details")
            
            setCurrentSubscriptionPlan(response.user.subscriptionPlan)
            setSubscriber(response.subScriber)
            setSubscriptionExpiryDate(response.user.subscriptionExpiryDate)
            setSubscriptionStartDate(response.user.subscriptionStartDate)
            setSubscriptionStatus(response.user.subscriptionStatus)
            setUser(response.user)
        }catch(error){
            Popup({
                message : error.message || "unable to fetch data",
                type: "error"
            })
        }
    })

    if (loading) {
        return(
            <div>
                <h1>Loading</h1>
            </div>
        )
    }

    return(
        <>
            <div>
                {subscriptionPlan.map(plan => (
                    <div>
                        {(subscriber && (currentSubscriptionPlan === plan.plan)) && 
                        <h1>your current Plan</h1>
                        }
                        <h1>{plan.plan}</h1>
                        {plan.benefit.map(
                            benefit => (
                                <div>
                                
                                </div>
                            )
                        )}
                    </div>
                    )
                )}
            </div>
        </>
    )


}

export default Subscription