import { BasicInformation, DetailsVerification, CreateUser } from "../components/Registration";
import { useState } from "react";
import logo from "../images/mainLogo.jpg";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../Url";


const Registration = () => {
    const url = BASE_URL
    const navigate = useNavigate()
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

    // Async function that handles the final form submission
const handleFinalSubmit = async (data) => {
    
    // Merge existing userData state with the latest form data submitted
    const formData = { ...userData, ...data };
    const imageData = new FormData()
   
    if (formData.profilePicture?.[0]) {
        imageData.append("profilePicture", formData.profilePicture[0]);
    }

    if (formData.proofOfAddress?.[0]) {
        imageData.append("proofOfAddress", formData.proofOfAddress[0]);
    }


    try {
        const upLoadImage = await fetch(`${url}/users`, {
            method: "POST",
            body: imageData
        })

        if (!upLoadImage.ok) throw new Error("unable to upload data")
        const uploadResult = await upLoadImage.json();
        const { ProofOfAddressUrl, profilePictureUrl } = uploadResult;
        const finalUserData = {
            ...formData,
            proofOfAddressUrl: ProofOfAddressUrl,
            profilePictureUrl: profilePictureUrl,
            };
        try {
        const uploadFormData = await fetch(`${url}/users`, {
            method: "POST",
            body: JSON.stringify(finalUserData)
        })
        if (!uploadFormData.ok) throw new Error("User save failed");

        const savedUser = await uploadFormData.json();
        console.log("User saved:", savedUser);

        navigate("/products");
    }
        catch(error) {
        console.log(error)}
    } catch(error) {
        console.log(error)}

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