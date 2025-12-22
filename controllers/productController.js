import Product from "../models/product.js";
import { isItAdmin } from "./userController.js";

export async function addProduct(req, res) {


    if (req.user == null) {
        res.status(401).json({
            message: "Unauthorized Access please try again"
        })
        return
    } if (req.user.role != "admin") {
        res.status(403).json({
            message: "Unauthorized Access you are not admin"
        })
        return
    }
    const data = req.body;
    const newProduct = new Product(data);

    try {
        await newProduct.save();
        res.json({
            message: "Product Added Successfully"
        });

    } catch (error) {
        res.status(500).json({
            error: "Product Addition Failed"
        })
    }

}

export async function getProducts(req, res) {

    try {
        if (isItAdmin(req)) {
            const products = await Product.find();
            res.json(products);
            return;
        } else {
            const products = await Product.find({ availability: true });
            res.json(products);
            return;
        }
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({
            error: "Failed to get products"
        })
    }
}

export async function updateProduct(req, res) {
    try{
        if(isItAdmin(req)){
            const key = req.params.key;
            const data = req.body;

            await Product.updateOne({key: key }, data)
            res.json({
                message: "Product Updated Successfully"
            })
            return
        }else{
            res.status(403).json({
                message: "Unauthorized Access you are not admin"
            })
            return
        }
    }catch(error){

        res.status(500).json({
            error: "Product Updation Failed"
        })
    }
}


export async function deleteProduct(req,res){
    try{
        if(isItAdmin(req)){
            const key = req.params.key;
            await Product.deleteOne({key: key})
            res.json({
                message: "Product Deleted Successfully"
            })
            
        }

    }catch(error){
        res.status(500).json({
            error: "Product Deletion Failed"
        })
    }
}