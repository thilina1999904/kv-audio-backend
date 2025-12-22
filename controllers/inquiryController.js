import Inquiry from "../models/inquiry.js";
import { isItCustomer } from "./userController.js";
import { isItAdmin } from "./userController.js";

export async function addInquiry(req, res) {
    try {
        if (isItCustomer(req)) {
            const data = req.body;
            data.email = req.user.email;
            data.phone = req.user.phone;

            let id = 0;
            const inquries = await Inquiry.find().sort({ id: -1 }).limit(1);

            if (inquries.length == 0) {
                id = 1;
            } else {
                id = inquries[0].id + 1;
            }
            data.id = id;

            const newInquiry = new Inquiry(data);
            const response = await newInquiry.save();

            res.json({
                message: "Inquiry Added Successfully",
                id: response.id
            })

        }
    } catch (error) {
        res.status(500).json({
            error: "Inquiry Addition Failed"
        })
    }
}

export async function getInquiries(req, res) {
    try {
        if (isItCustomer(req)) {
            const inquiries = await Inquiry.find({
                email: req.user.email
            });
            res.json(inquiries);
            return
        } else if (isItAdmin(req)) {
            const inquiries = await Inquiry.find();
            res.json(inquiries);
            return;
        } else {
            res.status(403).json({
                message: "You are not authorized to perform this action"
            })
            return;
        }

    } catch (e) {
        res.status(500).json({
            message: "Failed to get inquries"
        })
    }
}

export async function deleteInquiry(req, res) {
    try {
        if (isItAdmin(req)) {
            const id = req.params.id;

            await Inquiry.deleteOne({ id: id })
            res.json({
                message: "Inquiry Deleted Successfully"
            })
            return;
        } else if (isItCustomer(req)) {
            const id = req.params.id;

            const inquiry = await Inquiry.findOne({ id: id });
            if (inquiry == null) {
                res.status(404).json({
                    message: "Inquiry Not Found"
                })
                return;
            } else {
                if (inquiry.email == req.user.email) {
                    await Inquiry.deleteOne({ id: id })
                    res.json({
                        message: "Inquiry Deleted Successfully"
                    })
                    return;
                } else {
                    res.status(403).json({
                        message: "You Are not Authorized to perform this Action"
                    })
                    return;
                }
            }
        }else{
            res.status(403).json({
                message : " You are not authorized to perform this action"
            })
            return       
        }
    } catch (e) {
        res.status(500).json({
            message: "Failed to Delete Inquiry"
        })
    }
}

export async function updateInquiry(req,res){
    try{
        if(isItAdmin(req)){
            const id = req.params.id;
            const data = req.body;

            await Inquiry.updateOne({id:id},data)
            res.json({
                message :"Inquiry Update Successfully"
            })
        }else if(isItCustomer(req)){
            const id = req.params.id;
            const data = req.body;

            const inquiry =  await Inquiry .findOne({id:id});
            if(inquiry == null){

                res.status(404).json({
                    message:"Inquiry Not Found"
                })
                return
            }else{
                if(inquiry.email == req.user.email){

                    await Inquiry.updateOne({id:id},{message:data.message})
                    res.json({
                        message : "Inquiry Update Successfully"
                    })
                    return;
                }else{
                    res.status(403).json({
                        message: "You are not authorized to Update inquiry"
                    })
                    return;
                }
            }
        }else{
            res.status(403).json({
                message: "You are not authorized to perform this action"
            })
        }

    }catch(e){
        res.status(500).json({
            message: "Failed to Update Inquiry"
        })
    }

}