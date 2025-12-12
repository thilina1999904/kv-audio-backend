import Product from "../models/product.js";

export async function addProduct(req,res){

    console.log(req.user)

    if(req.user==null){
        res.status(401).json({
            message:"Unauthorized Access please try again"
    })
    return
    }if(req.user.role!="admin"){
        res.status(403).json({
            message:"Unauthorized Access you are not admin"
    })
    return
    }
    const data = req.body;
    const newProduct = new Product(data);

    try{
        await newProduct.save();
        res.json({
            message:"Product Added Successfully"
        });

    }catch(error){
        res.status(500).json({
            error:"Product Addition Failed"
        })
    }

}