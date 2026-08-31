import { getCategory } from "./category.service.js"
const fetchCategory = async() => {
    try {
        return await getCategory()

    }catch(error) {
        console.log(error)
        next(error)
    }
}

export default fetchCategory;