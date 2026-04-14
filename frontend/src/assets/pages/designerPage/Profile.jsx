import { useState, useEffect } from "react"
const Profile = () => {
    const [editProfile, setEditProfile] = useState(false)


    // const fetchUser = async() => {
    //     try {
    //         let response = await fetch("http://localhost:3000/users")
    //         let userData = await response.json()

    //         if(!response.ok) {
    //             throw new Error("unable to fect user data")
    //         }
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

    // this userdata will be removed eventually
   let userData = [ {
      id: "1",
      fname: "Toochukwu",
      lname: "Umoke",
      userName: "Toochi",
      gender: "Male",
      profilePicture: "/src/assets/images/5.jpg",
      location: "Ebonyi State",
      isActive: "true",
      status: "seller",
      "Business Address" : "10c Nibo street",
      email: "umoketoochukwu@gmail.com",
      "phone number": "09031183272",
      dob: "22/05/1996",
      "means of identification": "nin",
      nin: "234455635785"
    }]

    return(
        <div>
            {
                !editProfile 
                ?
                <div>
                    {userData.map((profile) => {
                        return (
                            <div>
                                <img src={profile.profilePicture} alt="profile picture"/>
                                <div>
                                    <div>
                                        <h1>Name</h1>
                                        <h1>{`${profile.fname} ${profile.lname}`}</h1>
                                    </div>
                                    <div>
                                        <h1>date of Birth</h1>
                                        <h1>{profile.dob}</h1>
                                    </div>
                                    <div>
                                        <h1>Email Address</h1>
                                        <h1>{profile.email}</h1>
                                    </div>
                                    <div>
                                        <h1>date of Birth</h1>
                                        <h1>{profile.dob}</h1>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                : <h2>welcome</h2>
            }
        </div>
    )


    
}

export default Profile;