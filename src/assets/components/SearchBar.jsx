import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SearchBar = ({className}) => {
    return (  
        <div>
            <input 
            className="classname"
            type="text" placeholder="Search" name="searchBar" value="" />
            <button 
            className={className}
            type="button">
                <FontAwesomeIcon icon="fa fa-search" />
            </button>
        </div>
    );
}
 
export default SearchBar;