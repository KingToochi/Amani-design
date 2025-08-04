import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
const Category = () => {
  const [showMenDropdown, setShowMenDropdown] = useState(false);
  const [showWomenDropdown, setShowWomenDropdown] = useState(false);
  const [showKidsDropdown, setShowKidsDropdown] = useState(false);

  return (
    <ul className="w-full flex justify-center items-center gap-10 text-base text-gray-600 font-semibold">
      <li className="relative group">
        <Link to="/men">Men </Link>

        <button
          className="cursor-pointer"
        //   onClick={() => setShowMenDropdown((prev) => !prev)}
        >
          <FontAwesomeIcon icon="fa fa-angle-down" />
        </button>
        {/* {setShowMenDropdown && ( */}
          <ul className="hidden w-[200px] flex flex-col gap-4 absolute">
            <li>
              <Link to="">Men's Clothing</Link>
            </li>
            <li>
              <Link to="">Men's Footwears</Link>
            </li>
            <li>
              <Link to="">Men's Handbag</Link>
            </li>
            <li>
              <Link to="">Men's Cap</Link>
            </li>
          </ul>
        {/* )} */}
      </li>

      <li>
        <Link to="/Women">Women</Link>
        <button
          className="cursor-pointer"
        //   onClick={() => setShowWomenDropdown((prev) => !prev)}
        >
          <FontAwesomeIcon icon="fa fa-angle-down" />
        </button>
        {/* {setShowWomenDropdown && ( */}
          <ul className="hidden w-[200px] flex flex-col gap-4 absolute">
            <li>
              <Link to="">Women's Clothing</Link>
            </li>
            <li>
              <Link to="">Women's Footwears</Link>
            </li>
            <li>
              <Link to="">Women's Handbag</Link>
            </li>
            <li>
              <Link to="">Women's Headtie</Link>
            </li>
          </ul>
        {/* )} */}
      </li>

      <li>
        <Link to="/Kids">Kids</Link>
        <FontAwesomeIcon icon="fa fa-angle-down" />
        <ul className="hidden">
          <li>
            <Link to="">Women's Clothing</Link>
          </li>
          <li>
            <Link to="">Women's Footwears</Link>
          </li>
        </ul>
      </li>
    </ul>
  );
};

export default Category;
