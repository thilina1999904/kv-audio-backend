import mongoose from "mongoose";

const userSchema =  new mongoose.Schema({
    email : {
        type : String,
        required : true,
        unique: true
    },
    Password : {
        type : String,
        required : true,
    },
    role : {
        type : String,
        required : true,
        default : "customer"
    },
    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    address : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : true
    },
    profilePicture :{
        type : String,
        required : true,
        default : "https://cdn.vectorstock.com/i/1000v/92/16/default-profile-picture-avatar-user-icon-vector-46389216.jpg"
    }
});

const User = mongoose.model("User",userSchema);

export default User;