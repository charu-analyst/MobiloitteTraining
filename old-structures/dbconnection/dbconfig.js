const mongoose  =require("mongoose");
mongoose.connect("mongodb://localhost:27017/test").then(()=>{
    console.log("db is connected");
})