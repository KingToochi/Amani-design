import { getCategory } from "./category.service.js"
export const fetchCategory = async() => {
    try {
        return await getCategory()

    }catch(error) {
        console.log(error)
        next(error)
    }
}