import { FiSearch } from "react-icons/fi";

const SearchBar = ({className}) => {
    // this components create a search bar and a search icon with a prop called className 
    // which can be used to style it whenever its been imported
    return (  
        <form>
            <input 
            className="classname"
            type="text" placeholder="Search" name="searchBar" value="" />
            <button 
            className={className}
            type="button">
                <FiSearch />
            </button>
        </form>
    );
}
 
export default SearchBar;