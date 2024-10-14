const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const users = Schema(
    {
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        mobileNumber: {
            type: Number,
            unique: true,
            required: true,
        },
        userName: {
            type: String,
            unique: true,
        },
        address: {
            type: String,
        },
        dateOfBirth: {
            type: String,
        },
        otp: {
            type: String,
        },
        isVarified: {
            type: Boolean,
            default: false,
        },
        isVerifiedEmail: {
            type: Boolean,
            default: false,
        },
        expirationTime: {
            type: Date,
        },
        userType: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        status: {
            type: String,
            enum: ["active", "deleted", "blocked"],
            default: "active",
        },
      
    },
    { timestamps: true }
);
module.exports = model("user", users);

const admin = async () => {
    const userData = await model("user", users).findOne({ userType: "admin" });
    if (userData.length !== 0) {
        console.log("admin present");
    } else {
        let obj = {
            firstName: "Ad",
            lastName: "Admin",
            mobileNumber: 7985853064,
            email: "co-admin@gmail.com",
            countryCode: "+91", 
            userName: "ad3064",
            password: bcrypt.hashSync("admin@112", 10),
            address: "mobiloitte,phase-1",
            dateOfBirth: "28-06-2002",
            userType: "admin", 
            status: "active",
            isVarified:"true"
        };
        const result = await model("user", users).create(obj);
        console.log("admin created ", result);
    }
};
admin();
