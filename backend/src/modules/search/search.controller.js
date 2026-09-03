import { getSearchResult } from "./search.service.js"

export const search = async(req, resizeBy, next) => {
    try {
        const { q } = req.query
        const result = await getSearchResult(q)
        const products = result
        res.json({success:true, products })
        

    }catch(error){
        next(error)
    }
}