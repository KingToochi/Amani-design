
const Search = ({ searchedProduct }) => {
    if (searchedProduct.length === 0) {
        return(
            <h1 className="text-center">No item found</h1>
        )
    }
  return (
    <div className="w-full flex flex-col gap-2 items-center">
      {searchedProduct.map(items => (
        <div key={items._id} className="flex flex-col items-center">
          <img
            src={items.productImage}
            alt="searched product"
            className="w-40 h-40 object-cover"
          />
          <h1>{items.productDescription}</h1>
        </div>
      ))}
    </div>
  )
}

export default Search
