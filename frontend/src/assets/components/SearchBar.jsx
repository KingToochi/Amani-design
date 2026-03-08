import { FaSearch } from "react-icons/fa";
import { useState } from "react";

const SearchBar = ({inputClass, buttonClass, formClass, onSubmit, query, handleChange}) => {
    // this components create a search bar and a search icon with a prop called className 
    // which can be used to style it whenever its been imported
 
   

    
    return (  
        <form className={formClass} onSubmit={onSubmit}>
            <input 
            className={inputClass}
            type="text" placeholder="Search" name="searchBar" value={query} onChange={handleChange} />
            <button 
            className={buttonClass}
            type="button">
                <FaSearch />
            </button>
        </form>
    );
}
 
export default SearchBar;