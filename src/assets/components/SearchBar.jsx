import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SearchBar = ({className}) => {
    // this components create a search bar and a search icon with a prop called className 
    // which can be used to style it whenever its been imported
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