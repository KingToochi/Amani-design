import Product from "../../models/Product.js"
export const getSearchResult = async(q) => {
     if (!q || !q.trim()) throw new Error("empty field")
        // Split input into words
        const inputValue = q.trim().split(/\s+/)
        console.log(inputValue)
    
        // Build MongoDB query: each word should match at least one field
        const mongoQuery = {
          $and: inputValue.map(word => ({
            $or: [
              { productCategory: { $regex: word, $options: "i" } },
              { productDescription: { $regex: word, $options: "i" } },
              {color: { $regex: word, $options: "i" }},
              {size: {$regex: word, $options: "i"}}
            ]
          }))
        }
    
        // Query MongoDB
        const products = await Product.find(mongoQuery)

        return products
}