import trending from "../images/image2.jpg";
import trending1 from "../images/image3.jpg";
import trending2 from "../images/image4.jpg";
import trending3 from "../images/image5.jpg";
import trending11 from "../images/image6.jpg";
import trending4 from "../images/women.png";
import trending5 from "../images/image2.jpg";
import trending6 from "../images/image3.jpg";
import trending7 from "../images/image4.jpg";
import trending8 from "../images/image5.jpg";
import trending9 from "../images/image6.jpg";
import trending0 from "../images/women.png";
import logo from "../images/mainLogo.jpg";
import { Link } from "react-router-dom";
import { useState } from "react";
import Login from "./Login";
import  Registration from "./DesignersRegistration";

const LandingImages = [
  trending,
  trending1,
  trending2,
  trending3,
  trending4,
  trending5,
  trending6,
  trending7,
  trending8,
  trending9,
  trending0,
  trending11,
];

const LandingPage = () => {
  // this component maps through array of images and return grids of images that are mobile responsive, it also has interactive buttons where
  // users can decide whether to sign up or login and when the buttons are clicked it returns a sign up or login container as a modal

  const [showLoginModal, SetShowLoginModal] = useState(false);
  const [showRegistrationModal, SetShowRegistrationModal] = useState(false);
  const handleLogin = () => SetShowLoginModal(true);
  const handlRegistration = () => SetShowRegistrationModal(true);

  const displayShowLoginModal = () => {
    return (
      showLoginModal && (
        <div className="w-full  fixed inset-0 px-2 py-4 flex flex-col items-center justify-center backdrop-blur">
          <div
            className="w-[90%] bg-white px-2 py-4 relative flex flex-col items-center justify-start gap-10 min-h-screen  
                sd:w-[80%]
                lg:w-[60%]
                "
          >
            <div className="flex flex-col items-center ">
              <img
                className="w-[50px]  h-[50px] rounded-[50%]"
                src={logo}
                alt=""
              />
              <h1 className="text-center text-2xl font-bold text-gray-900">
                AmaniSky Design
              </h1>
            </div>
            <div className="absolute right-4 top-1">
              <button
                type="button"
                onClick={() => SetShowLoginModal(false)}
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
              <Login />
            </div>
          </div>
        </div>
      )
    );
  };

  const displayShowRegistrationModal = () => {
    return (
        showRegistrationModal && (
            <div 
            className="w-full min-h-screen  absolute top-0 left-0 right-0 px-2 py-4 flex flex-col items-center justify-center backdrop-blur
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
    <div>
      <div
        className="w-full grid grid-flow-row grid-cols-3 gap-2 bg-gray-900 relative 
            lg:grid-cols-4 min-h-screen
            "
      >
        {LandingImages.map((image, index) => (
          <div className="w-full " key={index}>
            <img
              className="w-full h-full object-cover rounded-lg"
              src={image}
            />
          </div>
        ))}
      </div>

      <div
        className="absolute flex flex-col items-center w-full top-1/3 gap-10
            "
      >
        <div className="flex flex-col items-center">
          <img
            className="w-[50px]  h-[50px] rounded-[50%]"
            src={logo}
            alt="SITE LOGO"
          />
          <h1 className="text-center text-2xl font-bold text-gray-100 font-abril">
            Welcome to <br /> AmaniSky Design
          </h1>
        </div>

        <div className="flex flex-col w-full items-center gap-2">
          <button
            className="w-[auto] bg-cyan-600  border-1 border-blue-400 rounded-lg px-2 py-2"
            type="button"
          >
            <Link to="">
              <span className="text-center text-base font-semibold text-gray-100">
                Continue with email
              </span>
            </Link>
          </button>
          <button
            className="w-auto bg-white  border-1 border-white rounded-lg px-2 py-2 "
            type="button"
          >
            <Link to="">
              <span className="text-center text-base font-semibold text-gray-900">
                Continue with Google
              </span>
            </Link>
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 text-gray-100 w-full justify-center ">
          <h2 className="text-base font-bold flex gap-4">
            Already a member?
            <button
              className="w-auto px-2  text-center text-base font-bold text-gray-100 rounded-lg cursor-pointer"
              onClick={handleLogin}
              type="button"
            >
              Log in
            </button>
          </h2>
          <h2 className="text-base font-bold flex gap-4">
            Are you a designer?{" "}
            <button
              className="w-auto px-2  text-base font-bold text-center text-gray-100 rounded-lg cursor-pointer"
              onClick={handlRegistration}
              type="button"
            >
              Get started here!
            </button>
          </h2>
        </div>
      </div>
      {displayShowLoginModal()}
      {displayShowRegistrationModal()}
    </div>
  );
};

export default LandingPage;
