import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema({
    id : {
        type:Number
    },
    email : {
        type:String,
        required:true,
        unique:true
    },
    message : {
        type:String,
        required:true
    },
    phone : {
        type:String,
        required:true
    },
    date: {
        type: Date,
        default: Date.now
    },
    response:{
        type:String,
        required:false,
        default:""
    },
    isResolved:{
        type:Boolean,
        required:true,
        default:false
    }
});

const inquiry = mongoose.model ("inquiry",inquirySchema);

export default inquiry;