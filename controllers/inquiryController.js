import Inquiry from "../models/inquiry.js";
import { isItCustomer } from "./userController.js";

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
        console.log(error)
        res.status(500).json({
            error: "Inquiry Addition Failed"
        })
    }
}