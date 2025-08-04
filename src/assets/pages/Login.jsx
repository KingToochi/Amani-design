import { useForm } from "react-hook-form";
const Login = () => {
    // this component takes in data from the user, crosscheck with data in the database and return a progress or errors message
    const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm();
    const onSubmit = (data) => {
    console.log(data);
    }
   

    return ( 
        <div 
        className="flex flex-col items-center gap-10
        lg:gap-6
        ">
            <button 
            className="w-full border-1 rounded-lg py-2 border-gray-100"
            >
                <h2
                className="text-base font-semibold"
                >
                    Continue With Google
                </h2>
            </button>

            <h2
            className="text-xl font-bold"
            >OR</h2>

            <form 
            className="w-full flex flex-col items-center gap-10
            lg:gap-6 "
            onSubmit={handleSubmit(onSubmit)}>
                <input 
                className="w-full rounded-lg border-gray-900 border-1 px-2 py-2 text-gray-900 font-semibold text-base "
                type="text" placeholder="Email" 
                {...register("email", { required: "The Email address is required",})}
                />
                {errors.email && (
                    <h2 
                    className="text-red-300 mb-2"
                    >{errors.email.message}</h2>
                )}

                <input 
                className="w-full rounded-lg border-gray-900 border-1 px-2 py-2 text-gray-900 font-semibold text-base "
                type="password" placeholder="password" 
                {...register("password", { required: "wrong password",})}
                />
                {errors.password && (
                    <h2
                     className="text-red-300 mb-2"
                    >{errors.password.message}</h2>
                )}

                <button to="" 
                className="w-full text-sm font-medium text-left"
                >Forgot your password?
                </button>

                <button
                type="submit"
                disabled= {isSubmitting}
                className="w-full border-2px border-gray-600 rounded-lg bg-gray-600 text-gray-400 text-base font-semibold py-2"
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
                     type="button">Get started here!
                </button>
            </div>

        </div>
     );
}
 
export default Login;