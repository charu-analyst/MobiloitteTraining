const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const mongoosePaginate = require("mongoose-paginate-v2");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");


const users = Schema({
  firstName: {
    type: String,
  },

  lastName: {
    type: String,
  },

  age: {
    type: Number,
  },

  number: {
    type: Number,
    unique: true,
    required: true
  },

  email: {
    type: String,
    unique: true,
    required: true

  },
  password: {
    type: String,
    required: true,

  },
  otp: {
    type: String,

  },
  isVarified: {
    type: Boolean,
    default: false,

  },
  expirationTime: {
    type: Date
  },
  userType: {
    type: String,
    enum: ['user', 'admin'],
    default: "user"
  },
  status: {
    type: String,
    enum: ['active', 'deleted', 'blocked'],
    default: 'active'
  },
  url: {
    type: String,
  }
},
  { timestamps: true })
users.plugin(mongoosePaginate)
users.plugin(aggregatePaginate);
module.exports = model("api", users)



const admin = async (req, res) => {
  const userData = await model("api", users).find({ userType: "admin" })
  if (userData.length !== 0) {
    console.log("admin present");

  }
  else {
    let obj = {
      firstName: "co-",

      lastName: "Admin",

      age: 20,

      number: 7985853064,

      email: "co-admin@gmail.com",
      password: bcrypt.hashSync('admin@112', 10),
      userType: "admin"
    }
    const result = await model("api", users).create(obj)
    console.log("admin created ", result)
  }

};
admin();
