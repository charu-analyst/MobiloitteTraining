const { Schema, model } = require("mongoose");


const staticContent = Schema(
    {
        type: {
            type: String,
        },
        description: {
            type: String,
        },
        title: {
            type: String,
        },
        status: {
            type: String,
        }
    },
    { timestamps: true }
);
module.exports = model("static", staticContent);

const static = async () => {
    const types = ["contact-Us", "terms_Conditions", "about-Us"];
    const result = await model("static", staticContent).find({ type: types });
    if (result.length > 0) { console.log("Static content is already present in database"); }
    else {
        let obj = {
            type: "contact-Us",
            description:
                " Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eos illo vitae cumque fugiat cum pariatur, nobis nesciunt",
            title: "  Lorem ipsum1 ",
            status: "ACTIVE",
        };


        let obj1 = {
            type: "terms_Conditions",
            description:
                " Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eos illo vitae cumque fugiat cum pariatur, nobis nesciunt",
            title: "  Lorem ipsum2 ",
            status: "ACTIVE",
        };

        let obj2 = {
            type: "about-Us",
            description:
                " Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eos illo vitae cumque fugiat cum pariatur, nobis nesciunt",
            title: "  Lorem ipsum3 ",
            status: "ACTIVE",
        };
        const result = await model("static", staticContent).create([obj, obj1, obj2]);
        console.log(" static content is created", result);
    }
}

static();