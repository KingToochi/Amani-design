import { useLocation } from "react-router-dom";
import { useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { BASE_URL } from "../Url";
import CustomFetch from "../hooks/useFetch";

const InitiatePayment = () => {
    const location = useLocation();
    const url = `${BASE_URL}/verifyPin`;
    const otpUrl = `${BASE_URL}/verifyOtp`;
    const {
        details, chargeId, customer, cart
    } = location.state || {};
    const [step, setStep] = useState("pin");
    const [pin, setPin] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    console.log(chargeId)
    console.log(details)
    console.log(customer)

    const customerDetails = {
        city : customer?.address?.city,
        country : customer?.address?.country,
        line1 : customer?.address?.line1,
        state : customer?.address?.state,
        postal_code : customer?.address?.postal_code,
    }

    console.log(customerDetails)

    const verifyPin = async () => {
        if (pin.length !== 4) {
            return alert("PIN must be 4 digits.");
        }

        console.log(pin, chargeId)

        try {
            const response = await CustomFetch(url, {
            method : "POST",
            credentials: "include", 
            headers : {"Content-Type" : "application/json"},
            body : JSON.stringify({
                        pin,
                        chargeId
                    })
        })

        let verifyPinResponse = await response.json()
        console.log(verifyPinResponse)

        if (!verifyPinResponse.success) {
            return alert("pin verification failed. Please try again.");
        } else {
            if (verifyPinResponse?.data?.data?.next_action.type === "requires_otp") {
                setStep("otp");
            }
        }



        
        }catch(error) {

        }
    };

    const verifyOtp = async () => {
        if (otp.length < 4) {
            return alert("OTP must be 4 digits or more than.");
        }
        try {
            const verifyOtp = await CustomFetch(otpUrl, {
                method : "POST",
                credentials: "include",
                headers : {"Content-Type" : "application/json"},
                body : JSON.stringify({
                    otp,
                    chargeId,
                    customerDetails,
                    cart
                })
                
            })
            let verifyOtpResponse = await verifyOtp.json()
        console.log(verifyOtpResponse)

        if (!verifyOtpResponse.success) {
            return alert("pin verification failed. Please try again.");
        }
        }catch(error) { 
            
        }

        
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

            <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-8">

                {step === "pin" && (
                    <>
                        <div className="flex justify-center mb-5">
                            <LockKeyhole className="w-12 h-12 text-blue-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-center">
                            Card PIN
                        </h2>

                        <p className="text-center text-gray-500 mt-2">
                            Enter your 4-digit card PIN
                        </p>

                        <input
                            type="password"
                            maxLength={4}
                            value={pin}
                            onChange={(e) =>
                                setPin(e.target.value.replace(/\D/g, ""))
                            }
                            className="mt-6 w-full border rounded-lg py-3 text-center text-2xl tracking-[12px] outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                            onClick={verifyPin}
                            disabled={loading}
                            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                        >
                            {loading ? "Verifying..." : "Continue"}
                        </button>
                    </>
                )}

                {step === "otp" && (
                    <>
                        <div className="flex justify-center mb-5">
                            <ShieldCheck className="w-12 h-12 text-green-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-center">
                            OTP Verification
                        </h2>

                        <p className="text-center text-gray-500 mt-2">
                            Enter the 4-digit OTP sent to your phone
                        </p>

                        <input
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) =>
                                setOtp(e.target.value.replace(/\D/g, ""))
                            }
                            className="mt-6 w-full border rounded-lg py-3 text-center text-2xl tracking-[12px] outline-none focus:ring-2 focus:ring-green-500"
                        />

                        <button
                            onClick={verifyOtp}
                            disabled={loading}
                            className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </>
                )}

            </div>

        </div>
    );
};

export default InitiatePayment;