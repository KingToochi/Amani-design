import {useState, useEffect} from 'react';

const flutterwavePaymentData = () => {

}

export default flutterwavePaymentData;


{paymentMethod === "card" && (
        <div className="border rounded-lg p-5 space-y-4 bg-gray-50">

            <h3 className="font-semibold">Card Details</h3>

            <input
                type="text"
                placeholder="Card Number"
                className="w-full border rounded-lg p-3"
            />

            <div className="grid grid-cols-3 gap-3">
                <input
                    type="text"
                    placeholder="MM"
                    className="border rounded-lg p-3"
                />

                <input
                    type="text"
                    placeholder="YY"
                    className="border rounded-lg p-3"
                />

                <input
                    type="password"
                    placeholder="CVV"
                    className="border rounded-lg p-3"
                />
            </div>

            <input
                type="text"
                placeholder="Card Holder Name"
                className="w-full border rounded-lg p-3"
            />
        </div>
    )}