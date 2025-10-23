import { BasicInformation, DetailsVerification, CreateUser } from "../components/Registration";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import logo from "../images/mainLogo.jpg";

const Registration = () => {
    const [meansOfIdentification, setMeansOfIdentification] = useState("");
    const [showDetailsVerification, setShowDetailsVerification] = useState(false);
    const [showCreateUser, setShowCreateUser] = useState(false);
     // Store all form data in one object
    const [userData, setUserData] = useState({});
    const onClick = (data) => {
        setUserData(prev => ({ ...prev, ...data }));
        setShowDetailsVerification(true);
    }

    const onClickNext = (data) => {
        setShowCreateUser(true);
        setShowDetailsVerification(false)
        setUserData(prev => ({ ...prev, ...data }));
    }
    const onClickPrev = () => {
        setShowDetailsVerification(false);
    }

    const onClickBack = () => {
        setShowCreateUser(false);
        setShowDetailsVerification(true);
    }

    
  // Final submit to Firebase
    // Async function that handles the final form submission
const handleFinalSubmit = async (data) => {
    
    // Merge existing userData state with the latest form data submitted
    const finalData = { ...userData, ...data };

    try {
        // 1️⃣ Create a new Firebase Auth account using email + password
        // `createPassword` comes from your form's password input field
        const userCredential = await createUserWithEmailAndPassword(
            auth, 
            finalData.email, 
            finalData.createPassword
        );

        // 2️⃣ Extract the actual Firebase user object from the returned credentials
        const user = userCredential.user;

        // 3️⃣ Update the user's display name in Firebase Authentication
        await updateProfile(user, {
            displayName: `${finalData.fullName} ${finalData.lastName}`,
        });

        // 4️⃣ Remove `createPassword` before saving to Firestore for security reasons
        //    - This uses object destructuring to separate password from other data
        const { createPassword, ...safeData } = finalData;

        // 5️⃣ Save the rest of the user's data in Firestore under `users/{uid}`
        await setDoc(
            doc(db, "users", user.uid), // path: collection "users" → document with UID
            {
                ...safeData,              // spread all safe fields
                uid: user.uid,            // store the Firebase Auth UID
                createdAt: new Date().toISOString(), // store creation date/time
            }
        );

        // 6️⃣ Notify success and log the saved data
        alert("User registered successfully!");
        console.log("Saved Data:", finalData);

    } catch (error) {
        // 7️⃣ Catch and log any errors during signup or Firestore save
        console.error("Error saving data:", error);
    }
};


    const displayDetailsVerification = () => {
        return (
            showDetailsVerification && (
                <div 
                className="w-full  fixed inset-0 px-2 py-4 flex flex-col items-center justify-center backdrop-blur"
                >
                    <div
                    className="w-[90%] bg-white px-2 py-4 relative flex flex-col items-center justify-start gap-10 min-h-screen  
                    sd:w-[80%]
                    lg:w-[60%]
                    "
                    >
                        <div className="flex flex-col items-center ">
                            <img className="w-[50px]  h-[50px] rounded-[50%]" src={logo} alt="" />
                                <h1 className="text-center text-2xl font-bold text-gray-900">
                                    AmaniSky Design
                                </h1>
                        </div>
                        <h1
                        className="text-center font-[abril] text-2xl text-gray-600"
                        >Registration Form</h1>
                        <div className="absolute right-4 top-1">
                            <button
                            type="button"
                            onClick={() => setShowDetailsVerification(false)}
                            className="text-2xl font-bold"
                        >
                            x
                            </button>
                        </div>
                
                        <div
                       className="w-[90%]
                       sd:w-[80%]
                        md:w-[80%]
                        lg:w-[60%]
                        "
                        > 
                            <DetailsVerification meansOfIdentification={meansOfIdentification} onClickPrev={onClickPrev} onClickNext={onClickNext}/>
                        </div>
                    </div>
                </div>
            )
        )
    }

    const displayCreateUser = ( ) => {
        return (
            showCreateUser && (
                <div 
                className="w-full  fixed right-0 left-0 top-0 h-auto px-2 py-4 flex flex-col items-center justify-center backdrop-blur"
                >
                    <div
                    className="w-[90%] bg-white px-2 py-4 relative flex flex-col items-center justify-start gap-10 min-h-screen  
                    sd:w-[80%]
                    lg:w-[60%]
                    "
                    >
                        <div className="flex flex-col items-center ">
                            <img className="w-[50px]  h-[50px] rounded-[50%]" src={logo} alt="" />
                                <h1 className="text-center text-2xl font-bold text-gray-900">
                                    AmaniSky Design
                                </h1>
                        </div>
                        <h1
                        className="text-center font-[abril] text-2xl text-gray-600"
                        >Registration Form</h1>
                        <div className="absolute right-4 top-1">
                            <button
                            type="button"
                            onClick={() => setShowCreateUser(false)}
                            className="text-2xl font-bold"
                        >
                            x
                            </button>
                        </div>
                
                        <div
                       className="w-[90%]
                       sd:w-[80%]
                        md:w-[80%]
                        lg:w-[60%]
                        "
                        > 
                            <CreateUser onClickBack={onClickBack} handleFinalSubmit={handleFinalSubmit} />
                        </div>
                    </div>
                </div>
            )
        )
    }

    return (
        <div>
            <BasicInformation
            setMeansOfIdentification={setMeansOfIdentification} onClick={onClick}
            />
            {displayDetailsVerification()}
            {displayCreateUser()}
        </div>
      );
}
 
export default Registration;