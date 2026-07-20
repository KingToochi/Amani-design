import { useLocation } from "react-router-dom";
import { useState } from "react";
import {
    CreditCard,
    Landmark,
    Smartphone,
    Wallet,
    User,
    Mail,
    Phone,
    CheckCircle
} from "lucide-react";
import {BASE_URL} from "../Url"
import CustomFetch from "../hooks/useFetch";

const FlutterwavePaymentData = () => {
    const { state } = useLocation();
    const url = `${BASE_URL}/payment-method`;
    const [paymentDetails, setPaymentDetails] = useState({
        card : {
            cardNumber : null,
            expiryMonth : null,
            expiryYear: null,
            cvv : null,
            cardHolder : null,
        },
        ussd : {
            bank: null
        },
        mobile_money : {
            phoneNumber : null
        },

    });
    const [errors, setErrors] = useState({});

    const {
        customer,
        amount,
        currency,
        paymentMethod,
    } = state || {};

    if (!state) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <h2 className="text-2xl font-bold text-red-500">
                        Payment information not found
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Please restart your checkout.
                    </p>
                </div>
            </div>
        );
    }

    const validatePayment = () => {
        const newErrors = {};

        switch (paymentMethod) {
            case "card":
                if (!paymentDetails.card.cardNumber.trim()) {
                    newErrors.cardNumber = "Card number is required.";
                }

                if (!paymentDetails.card.expiryMonth.trim()) {
                    newErrors.expiryMonth = "Expiry month is required.";
                }

                if (!paymentDetails.card.expiryYear.trim()) {
                    newErrors.expiryYear = "Expiry year is required.";
                }

                if (!paymentDetails.card.cvv.trim()) {
                    newErrors.cvv = "CVV is required.";
                }

                if (!paymentDetails.card.cardHolder.trim()) {
                    newErrors.cardHolder = "Card holder name is required.";
                }

                break;

            case "ussd":
                if (!paymentDetails.ussd.bank.trim()) {
                    newErrors.bank = "Please select a bank.";
                }
                break;

            case "mobile_money":
                if (!paymentDetails.mobile_money.phoneNumber.trim()) {
                    newErrors.phoneNumber = "Phone number is required.";
                }
                break;

            case "bank_transfer":
                // Flutterwave generates the account details.
                // No validation required here.
                break;

            default:
                newErrors.payment = "Please select a payment method.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleContinue = () => {

        if (!validatePayment()) {
            return;
        }

        let payload = {};

        switch (paymentMethod) {
            case "card":
                payload = paymentDetails.card;
                break;

            case "ussd":
                payload = paymentDetails.ussd;
                break;

            case "mobile_money":
                payload = paymentDetails.mobile_money;
                break;

            case "bank_transfer":
                payload = paymentDetails.bank_transfer;
                break;
        }

        console.log({
            customer,
            amount,
            currency,
            paymentMethod,
            paymentDetails: payload,
        });
    };

    const handleSubmit = async() => {
        handleContinue()
        try {
            let response = await fetch(url , {
                method: "POST",
                headers : {"Content-Type" : "application/json"},
                body: JSON.stringify({
                    paymentMethod : paymentMethod,
                    paymentDetails : paymentDetails,
                })
            })
            let data = await response.json()
            
        } catch(error) {
            console.log(error)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">

            <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">

                {/* Payment Form */}

                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8">

                    <h2 className="text-3xl font-bold mb-6">
                        Complete Payment
                    </h2>

                    {/* CARD */}

                    {paymentMethod === "card" && (

                        <div className="space-y-5">

                            <h3 className="flex items-center gap-2 text-xl font-semibold">
                                <CreditCard />
                                Card Payment
                            </h3>

                            <input
                                type="number"
                                placeholder="Card Number"
                                className="w-full border rounded-xl p-4"
                                value = {paymentDetails?.card?.cardNumber || ""}
                                onChange={(e) => setPaymentDetails({...paymentDetails, card: {...paymentDetails.card, cardNumber: e.target.value}})}
                            />

                            <div className="grid grid-cols-3 gap-4">

                                <input
                                    placeholder="MM"
                                    type="number"
                                    className="border rounded-xl p-4"
                                    value = {paymentDetails?.card?.expiryMonth || ""}
                                    onChange={(e) => setPaymentDetails({...paymentDetails, card: {...paymentDetails.card, expiryMonth: e.target.value}})}
                                />

                                <input
                                    placeholder="YY"
                                    type = "number"
                                    className="border rounded-xl p-4"
                                    value = {paymentDetails?.card?.expiryYear || ""}
                                    onChange={(e) => setPaymentDetails({...paymentDetails, card: {...paymentDetails.card, expiryYear: e.target.value}})}
                                />

                                <input
                                    placeholder="CVV"
                                    type="password"
                                    className="border rounded-xl p-4"
                                    value = {paymentDetails?.card?.cvv || ""}
                                    onChange={(e) => setPaymentDetails({...paymentDetails, card: {...paymentDetails.card, cvv: e.target.value}})}
                                />

                            </div>

                            <input
                                type="text"
                                value = {paymentDetails?.card?.cardHolder || ""}
                                onChange={(e) => setPaymentDetails({...paymentDetails, card: {...paymentDetails.card, cardHolder: e.target.value}})}
                                placeholder="Card Holder Name"
                                className="w-full border rounded-xl p-4"
                            />

                        </div>

                    )}

                    {/* USSD */}

                    {paymentMethod === "ussd" && (

                        <div className="space-y-6">

                            <h3 className="flex items-center gap-2 text-xl font-semibold">
                                <Smartphone />
                                USSD Payment
                            </h3>

                            <p className="text-gray-500">
                                Select your bank. After clicking Continue,
                                Flutterwave will generate your USSD code.
                            </p>

                            <select className="w-full border rounded-xl p-4"
                            value = {paymentDetails?.ussd?.bank || ""}
                            onChange={(e) => setPaymentDetails({...paymentDetails, ussd: {...paymentDetails.ussd, bank: e.target.value}})}
                            >

                                <option>Select Bank</option>

                                <option>Access Bank</option>

                                <option>First Bank</option>

                                <option>GTBank</option>

                                <option>UBA</option>

                                <option>Zenith Bank</option>

                                <option>Fidelity Bank</option>

                                <option>Union Bank</option>

                                <option>FCMB</option>

                                <option>Sterling Bank</option>

                            </select>

                        </div>

                    )}

                    {/* BANK TRANSFER */}

                    {paymentMethod === "bank_transfer" && (

                        <div className="space-y-5">

                            <h3 className="flex items-center gap-2 text-xl font-semibold">
                                <Landmark />
                                Bank Transfer
                            </h3>

                            <div className="rounded-xl bg-blue-50 border border-blue-200 p-5">

                                <p className="text-gray-700">
                                    Click Continue below.
                                </p>

                                <p className="text-gray-600 mt-2">
                                    Flutterwave will generate a temporary
                                    bank account for this transaction.
                                </p>

                                <p className="text-sm text-blue-700 mt-3">
                                    Transfer exactly the amount shown to the
                                    generated account to complete payment.
                                </p>

                            </div>

                        </div>

                    )}

                    {/* MOBILE MONEY */}

                    {paymentMethod === "mobile_money" && (

                        <div className="space-y-5">

                            <h3 className="flex items-center gap-2 text-xl font-semibold">
                                <Wallet />
                                Mobile Money
                            </h3>

                            <p className="text-gray-500">
                                Enter your Mobile Money phone number.
                            </p>

                            <input
                                type="tel"
                                placeholder="08012345678"
                                className="w-full border rounded-xl p-4"
                            />

                        </div>

                    )}

                    <button
                        className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 font-semibold transition"
                    >
                        Continue Payment
                    </button>

                </div>

                {/* Payment Summary */}

                <div className="bg-white rounded-2xl shadow-lg p-6 h-fit">

                    <h3 className="text-xl font-bold mb-6">
                        Payment Summary
                    </h3>

                    <div className="space-y-5">

                        <div className="flex items-center gap-3">

                            <User size={20} />

                            <div>

                                <p className="font-semibold">
                                    {customer?.name?.first}{" "}
                                    {customer?.name?.last}
                                </p>

                            </div>

                        </div>

                        <div className="flex items-center gap-3">

                            <Mail size={20} />

                            <span>{customer?.email}</span>

                        </div>

                        <div className="flex items-center gap-3">

                            <Phone size={20} />

                            <span>
                                +{customer?.phone?.country_code}
                                {customer?.phone?.number}
                            </span>

                        </div>

                        <hr />

                        <div className="flex justify-between">

                            <span>Amount</span>

                            <span className="font-bold">
                                {currency} {amount?.toLocaleString()}
                            </span>

                        </div>

                        <div className="flex justify-between">

                            <span>Payment Method</span>

                            <span className="capitalize">
                                {paymentMethod.replace("_", " ")}
                            </span>

                        </div>

                        <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-start gap-3">

                            <CheckCircle className="text-green-600 mt-1" />

                            <div>

                                <p className="font-semibold text-green-700">
                                    Secure Payment
                                </p>

                                <p className="text-sm text-green-600">
                                    Your payment is securely processed by
                                    Flutterwave using encrypted channels.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default FlutterwavePaymentData;