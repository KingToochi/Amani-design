import { getCategory } from "./category.service.js"
const fetchCategory = async(req, res, next) => {
    try {

        const categoryData = await getCategory()
        const{ fetchAccessories, fetchMenProduct, fetchWomenProduct } = categoryData
        res.status(200).json({success:true, fetchAccessories, fetchMenProduct, fetchWomenProduct})

    }catch(error) {
        console.log(error)
        next(error)
    }
}

export default fetchCategory;