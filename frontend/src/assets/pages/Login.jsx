import { useForm } from "react-hook-form";
import logo from "../images/mainLogo.jpg";
import Registration from "./DesignersRegistration";
import { useState } from "react";
import { BASE_URL } from "../Url";
import { useNavigate } from "react-router-dom";
const Login = () => {
    // this component takes in data from the user, crosscheck with data in the database and return a progress or errors message
    const url = BASE_URL
    const navigate = useNavigate()
    const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm();
    const [showRegistrationModal, SetShowRegistrationModal] = useState(false);
    const handlRegistration = () => SetShowRegistrationModal(true);
    const onSubmit = async(data) => {
        try {
            let response = await fetch(`${url}/users`, {
                method: "POST",
                headers : {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            let result = await response.json()
            if (result.success) {
                localStorage.setItem("token", result.token); 
                navigate(result.redirect) 
            } else {
                throw new Error(result.error)
            }
        } catch(error) {
            console.log(error)
        }
    }

    const displayShowRegistrationModal = () => {
    return (
        showRegistrationModal && (
            <div 
            className="w-full  absolute top-0 left-0 right-0 pt-2 pb-[75px] py-4 flex flex-col items-center justify-center backdrop-blur
             mb-[1000px]
            "
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
                        onClick={() => SetShowRegistrationModal(false)}
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
                    <Registration />
                </div>
            </div>
    </div>
    )
    )
  };
   

    return ( 
        <div 
        className="flex flex-col items-center gap-10 text-lg font-[abril] mb-[75px]
        sm:text-xl
        md:text-2xl
        lg:gap-6
        ">
            <button 
            className="w-full border-1 rounded-lg py-2 border-gray-100 cursor-pointer"
            >
                <h2
                className="font-semibold"
                >
                    Continue With Google
                </h2>
            </button>

            <h2
            className="font-bold"
            >OR</h2>

            <form 
            className="w-[90%] mx-auto flex flex-col items-center gap-10
            lg:gap-6 "
            onSubmit={handleSubmit(onSubmit)}>
                <input 
                className="w-full rounded-lg border-gray-900 border-1 px-2 py-2 text-gray-900 font-semibold text-base font-[abril] "
                type="text" placeholder="Email" 
                {...register("email", { required: "The Email address is required",})}
                />
                {errors.email && (
                    <h2 
                    className="text-red-300 mb-2"
                    >{errors.email.message}</h2>
                )}

                <input 
                className="w-full rounded-lg border-gray-900 border-1 px-2 py-2 text-gray-900 font-semibold text-base font-[abril]"
                type="password" placeholder="password" 
                {...register("password", { required: "wrong password",})}
                />
                {errors.password && (
                    <h2
                     className="text-red-300 mb-2"
                    >{errors.password.message}</h2>
                )}

                <button to="" 
                className="w-full font-medium text-left"
                >Forgot your password?
                </button>

                <button
                type="submit"
                disabled= {isSubmitting}
                className="w-full border-2px border-gray-600 rounded-lg bg-gray-600 text-gray-400 font-semibold py-2"
                >
                    {isSubmitting ? "login in ..." : "Log in" } 
                </button>
            </form>

            <div 
            className="flex w-full justify-center  gap-2">
                <h2
                className="text-base text-gray-600 font-bold"
                >No Account?</h2>
                <button 
                className="w-auto px-2 text-center text-base  text-blue-600 font-bold cursor-pointer"
                to="">Sign up</button>
            </div>
            <div
            className="flex gap-1 justify-center  w-full"
            >
                <h2
                className="text-base text-gray-600 font-bold"
                >Are you a designer?
                </h2>
                <button 
                     className="w-auto px-2 text-center text-base  text-blue-600 font-bold cursor-pointer"
                     onClick={handlRegistration}
                     type="button">Get started here!
                </button>
            </div>
            {displayShowRegistrationModal()}
        </div>
     );
}
 
export default Login;