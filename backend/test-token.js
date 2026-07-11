import { getAccessToken } from "./services/flutterwave.js";

app.get("/test-token", async(req,res)=>{

    try{

        const token = await getAccessToken();

        res.json({
            success:true,
            token
        });

    }

    catch(err){

        console.log(err.response?.data);

        res.status(500).json(err.response?.data);

    }

});