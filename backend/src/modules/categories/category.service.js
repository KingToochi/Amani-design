
export const getCategory = async() => {
        const fetchMenProduct = await Product.findOne({
          productSubCategory: { $regex: "\\bmen\\b", $options: "i" },
        });
    
      const fetchWomenProduct = await Product.findOne({
        productSubCategory: { $regex: "\\bwomen\\b", $options: "i" },
      });
    
      const fetchAccessories = await Product.findOne({
        productSubCategory: { $regex: "\\baccessory\\b", $options: "i" },
      });
        return res.status(200).json({success:true, fetchAccessories, fetchMenProduct, fetchWomenProduct})
}