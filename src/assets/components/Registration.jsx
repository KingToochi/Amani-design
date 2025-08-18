import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm } from "react-hook-form";
import { useState } from "react";

// this component contains all the required form components for the registration page

export const BasicInformation = ({setMeansOfIdentification, onClick}) => {
    const {register, handleSubmit, formState : { errors }} = useForm()
    
    const onSubmit = (data) => {
        setMeansOfIdentification(data.meansOfIdentification);
        onClick(data);
    }
    return (
        <form
        className="w-full flex flex-col  gap-6
        lg:grid lg:grid-cols-2 lg:gap-3
        "
        onSubmit={handleSubmit(onSubmit)}
        >
            <h1 className="text-2xl font-bold font-[abril] text-gray-900 col-span-2">Basic Information</h1>
            <div
            className="w-full flex flex-col items-start gap-2 "
            >
                <input type="text" placeholder="First Name" 
                className="w-full border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 font-semibold text-base font-[abril]"
                {...register("firstName", {required: "First name is required"})} />
                {errors.firstName && <p className="text-red-300 text-sm font-[abril] ">{errors.firstName.message}</p>}
            </div>

            <div
            className="w-full flex flex-col items-start gap-2 "
            >
                <input type="text" placeholder="last Name" 
                className="w-full border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 font-semibold text-base font-[abril]"
                {...register("lastName", {required: "Last name is required"})} />
                {errors.lastName && <p className="text-red-300 text-sm font-[abril] ">{errors.lastName.message}</p>}
            </div>

            <div
            className="w-full flex flex-col items-start gap-2 "
            >
                <input type="email" placeholder="Email Address" 
                className="w-full border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 font-semibold text-base font-[abril]"
                {...register("email", {required: "Email Address is required"})} />
                {errors.email && <p className="text-red-300 text-sm font-[abril] ">{errors.email.message}</p>}
            </div>

            <div
            className="w-full flex flex-col items-start gap-2 "
            >
                <input type="text" placeholder="Phone Number" 
                className="w-full border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 font-semibold text-base font-[abril]"
                {...register("phoneNumber", {required: "Phone Number is required"})} />
                {errors.phoneNumber && <p className="text-red-300 text-sm font-[abril] ">{errors.phoneNumber.message}</p>}
            </div>

            <div
            className="w-full flex flex-col items-start gap-2 "
            >
                <input type="date" placeholder="Date of Birth" 
                className="w-full border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 font-semibold text-base font-[abril]"
                {...register("dob", {required: "Date of Birth is required"})} />
                {errors.dob && <p className="text-red-300 text-sm font-[abril] ">{errors.dob.message}</p>}
            </div>

            <div
            className="w-full flex flex-col items-start gap-2 "
            >
                <input type="text" placeholder="Home Address" 
                className="w-full border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 font-semibold text-base font-[abril]"
                {...register("homeaddress", {required: "Home address is required"})} />
                {errors.homeaddress && <p className="text-red-300 text-sm font-[abril] ">{errors.homeaddress.message}</p>}
            </div>

            <div
            className="w-full flex flex-col items-start gap-2 "
            >
                <input type="text" placeholder="Office Address" 
                className="w-full border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 font-semibold text-base font-[abril]"
                {...register("officeaddress", {required: "Office address is required"})} />
                {errors.officeaddress && <p className="text-red-300 text-sm font-[abril] ">{errors.officeaddress.message}</p>}
            </div>

            <div
            className="w-full flex flex-col items-start gap-2 "
            >
                <select 
                className="w-full border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 font-semibold text-base font-[abril]"
                {...register("meansOfIdentification", {required: "Means of Identification is required"})}>
                    <option value="" hidden>Select Means of Identification</option>
                    <option value="nin">National Identification Number</option>
                    <option value="vin">Voter's Card</option>
                    <option value="passport">International Passport</option>
                    <option value="driversLicense">Driver's License</option>
                </select>
                {errors.meansOfIdentification && <p className="text-red-300 text-sm font-[abril] ">{errors.meansOfIdentification.message}</p>}
            </div>

            <button
            className="w-auto px-3 py-1 flex-col items center gap-2 border-2 border-gray-900 rounded-lg
            lg:col-span-2
            "
            type="submit"
            >
                <FontAwesomeIcon icon="fa-solid fa-arrow-right" />
                Next
            </button>
        </form>
    )

}

export const DetailsVerification = ({meansOfIdentification, onClickNext, onClickPrev}) => {
    const {register, handleSubmit, formState : { errors }} = useForm()
    const onSubmit = (data) => {
        onClickNext(data)
    }

    return (
        <form
        className="w-full flex flex-col items-center gap-6"
        onSubmit={handleSubmit(onSubmit)}
        >
            {/* <div
            className="w-full flex flex-col items-start gap-2 "
            >
                <label className="text-gray-900 font-semibold text-base font-[abril]">
                    Upload Proof of Address
                </label>
                <input type="file" accept="image/*" capture="environment"  
                className="cursor-pointer w-full border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 font-semibold text-base font-[abril]"
                {...register("proofOfAddress", {required: "proof of address required!"})}
                />
                {errors.proofOfAddress && <p className="text-red-300 text-sm font-[abril] ">{errors.proofOfAddress.message}</p>}
            </div> */}

            {meansOfIdentification === "nin" && (
                <div
                className="w-full flex flex-col items-start gap-2 "
                >
                    <input type="text" placeholder="NIN Number" 
                    className="w-full border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 font-semibold text-base font-[abril]"
                    {...register("ninNumber", {required: "NIN Number is required"})} />
                    {errors.ninNumber && <p className="text-red-300 text-sm font-[abril] ">{errors.ninNumber.message}</p>}
                </div>
            )} 
            {meansOfIdentification === "vin" && (
                <div
                className="w-full flex flex-col items-start gap-2 "
                >
                    <input type="text" placeholder="Voter's Card Number" 
                    className="w-full border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 font-semibold text-base font-[abril]"
                    {...register("vinNumber", {required: "Voter's Card Number is required"})} />
                    {errors.vinNumber && <p className="text-red-300 text-sm font-[abril] ">{errors.vinNumber.message}</p>}
                </div>
            )}
            {meansOfIdentification === "passport" && (
                <div
                className="w-full flex flex-col items-start gap-2 "
                >
                    <input type="text" placeholder="Passport Number" 
                    className="w-full border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 font-semibold text-base font-[abril]"
                    {...register("passportNumber", {required: "Passport Number is required"})} />
                    {errors.passportNumber && <p className="text-red-300 text-sm font-[abril] ">{errors.passportNumber.message}</p>}
                </div>
            )}
            {meansOfIdentification === "driversLicense" && (
                <div
                className="w-full flex flex-col items-start gap-2 "
                >
                    <input type="text" placeholder="Driver's License Number" 
                    className="w-full border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 font-semibold text-base font-[abril]"
                    {...register("driversLicenseNumber", {required: "Driver's License Number is required"})} />
                    {errors.driversLicenseNumber && <p className="text-red-300 text-sm font-[abril] ">{errors.driversLicenseNumber.message}</p>}
                </div>
            )}

            <div
            className="w-full flex justify-between items-center gap-4"
            >
                <button
                className="w-auto px-3 py-1 flex-col items-center gap-2 border-2 border-gray-900 rounded-lg cursor-pointer"
                type="button"
                onClick={onClickPrev}
                >
                    <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
                    Prev
                </button>

                <button
                className="w-auto px-3 py-1 flex-col items center gap-2 border-2 border-gray-900 rounded-lg cursor-pointer"
                type="submit"
                >
                    Next
                    <FontAwesomeIcon icon="fa-solid fa-arrow-right" />
                </button>
            </div>
        </form>
    )
}

export const CreateUser = ({onClickBack, handleFinalSubmit}) => {
    const {register, handleSubmit, watch, formState : { errors, isSubmitting }} = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState("");
    const password = watch("createPassword");
    // const togglePassword = () => setShowPassword((prev) => !prev);

    // Helper: Evaluate password strength
    const checkPasswordStrength = (value) => {
        let strength = 0;
        if (value.length >= 8) strength++; /* check if password is upto 8*/
        if (/[A-Z]/.test(value)) strength++;  /* if it contains uppercase*/
        if (/[a-z]/.test(value)) strength++;  /* if it contains lowercase*/
        if (/\d/.test(value)) strength++;  /* if it contains digit*/
        if (/[^A-Za-z0-9]/.test(value)) strength++;  /* if it contains special character*/

        if (strength <= 2) return "Weak";
        if (strength === 3 || strength === 4) return "Moderate";
        if (strength === 5) return "Strong";
        return ""; 
    }

    const handlePasswordChange = (e) => {
        const strength = checkPasswordStrength(e.target.value);
        setPasswordStrength(strength);
    };

    const onSubmit = (data) => {
        console.log(data)
        handleFinalSubmit(data); // Pass final data to Firebase
    } 


    return (
        <form 
        className="w-full flex flex-col items-center gap-6"
        onSubmit={handleSubmit(onSubmit)}>
            {/* <div
            className="w-full flex flex-col items-start gap-2 "
            >
                <label  className="text-gray-900 font-semibold text-base font-[abril]">Add Profile Picture</label>
                <input type="file" capture="user" accept="image/*"
                className="w-full border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 cursor-pointer font-semibold text-base font-[abril]"
                {...register("dp")}
                />
            </div> */}
            <div
            className="w-full flex flex-col items-start gap-2 "
            >
                <input type="text" placeholder="Create Username" 
                className="w-full border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 font-semibold text-base font-[abril]"
                {...register("createUsername", {required: "This field is required"})} />
                {errors.createUsername && <p className="text-red-300 text-sm font-[abril] ">{errors.createUsername.message}</p>}
            </div>

            <div
             className="w-full flex flex-col items-start gap-2 "
            >
                <input 
                className="w-full relative border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 font-semibold text-base font-[abril]"
                type={showPassword ? "text" : "password"}
                placeholder="Create Password" 
                {...register("createPassword", {
                            required: "Password is required",
                            minLength: {
                                value: 8,
                                message: "Minimum 8 characters required",
                            },
                            validate: {
                                hasUpperCase: (value) =>
                                    /[A-Z]/.test(value) || "At least one uppercase letter required",
                                hasLowerCase: (value) =>
                                    /[a-z]/.test(value) || "At least one lowercase letter required",
                                hasNumber: (value) =>
                                    /\d/.test(value) || "At least one digit required",
                                hasSpecialChar: (value) =>
                                    /[^A-Za-z0-9]/.test(value) || "At least one special character required",
                            },
                            onChange: handlePasswordChange,})} />
                        {errors.createPassword && <p className="text-red-300 text-sm font-[abril] ">{errors.createPassword.message}</p>}
            </div>
            {password && (
                <div className="text-sm">
                    <span>Password Strength: </span>
                    <span
                        className={
                            passwordStrength === "Strong"
                                ? "text-green-600"
                                : passwordStrength === "Moderate"
                                ? "text-yellow-600"
                                : "text-red-600"
                        }
                    >
                        {passwordStrength}
                    </span>
                </div>)}

            <div
            className="w-full flex flex-col items-start gap-2 "
            >
                <input type="password" placeholder="Confirm Password" 
                className="w-full border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 cursor-pointer font-semibold text-base font-[abril]"             
                {...register("confirmPassword", {required: "This field is required",
                    validate: (value) => value === password || "Passwords do not match",
                })} />
                {errors.confirmPassword && <p className="text-red-300 text-sm font-[abril] ">{errors.confirmPassword.message}</p>}
            </div>
            <div
              className="w-full flex flex-col items-start gap-2"
            >
                <div
                className="w-full flex justify-start items-center gap-2"
                >
                    <input type="checkbox" 
                    className="cursor-pointer"
                    {...register("termsAndConditions", {required: "You must accept the terms and conditions"})} />
                    <label
                     className="text-gray-900 font-semibold text-base font-[abril]"
                    >I accept the terms and conditions</label>
                </div>
                {errors.termsAndConditions && <p className="text-red-300 text-sm font-[abril] ">{errors.termsAndConditions.message}</p>}
            </div>

            <div
            className="flex justify-between items-center gap-4 w-full"
            >
                <button 
                onClick={onClickBack}
                className="w-auto px-3 py-1 flex-col items-center gap-2 border-2 border-gray-900 rounded-lg cursor-pointer"
                 type="button">
                    <FontAwesomeIcon icon="fa fa-arrow-left" />
                    prev
                </button>

                <button
                className="w-auto px-3 py-1 flex-col items-center gap-2 border-2 border-gray-900 rounded-lg cursor-pointer"
                disabled = {isSubmitting}
                type="submit">
                    {isSubmitting ? "submitting" : "submit"}
                </button>
            </div>
        </form>
    )
}