const express = require("express");
const app = express();
require("./dbconnection/dbconfig");
const port = 9000;
const fileUpload = require("express-fileupload");   // file upload
app.use(fileUpload({ useTempFiles : true, tempFileDir :'/home/admin1/Desktop/node all folder/node m1+m2 test/tempfiles'})) ;



const userRouter = require("./routing/userRouter");
const staticRouter = require('./routing/staticRouter');
const admin = require('./routing/adminRouter');
const category = require("./routing/categoryRouter");
const product=require("./routing/productRouter")



app.use('/user', userRouter);
app.use('/static', staticRouter);
app.use('/admin', admin);
app.use('/category',category);
 app.use("/product",product)

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
