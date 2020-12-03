//Server

const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieParser = require("cookie-parser");

app.use(cookieParser());

//set up handlebars
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//middlewear check requests
app.use((req, res, next) => {
    console.log("--------------");
    console.log(`${req.method} request coming in on route ${req.url}`);
    console.log("--------------");
    next();
});

//static Files
app.use(express.static(__dirname + "/public"));

//GET /petition
app.get("/petition", (req, res) => {
    if (req.cookies.signed == "signed") {
        console.log("allready filled out, redirected to thanks");
        res.redirect("/thanks");
    } else {
        res.render("petitionPage", {
            layout: "main",
        });
    }
});

//post /petition
app.post("/petition", (req, res) => {
    //get values
    console.log("a Post request to /petition was made");
    res.cookie("signed", "signed");
    res.redirect("/thanks");
});

//GET /thanks
app.get("/thanks", (req, res) => {
    if (req.cookies.signed != "signed") {
        console.log("not filled out, redirected to petition");
        res.redirect("/petition");
    } else {
        res.render("thanksPage", {
            layout: "main",
        });
    }
});

//GET /signers
app.get("/signers", (req, res) => {
    res.render("signersPage", {
        layout: "main",
    });
});

//get route all cities from DB
app.get("/firstName", (req, res) => {
    db.getFirstName()
        .then(({ rows }) => {
            console.log("result from getCities: ", rows);
            res.sendStatus(200);
        })
        .catch((err) => {
            console.log("error in db.getCities ", err);
        });
});

//post route for insert data into DB
app.post("/addName", (req, res) => {
    db.addName("juli", "Ri")
        .then(() => {
            console.log("it worked");
            res.sendStatus(200);
        })
        .catch((err) => {
            console.log("error in db.addName", err);
        });
});

app.listen(8080, () => console.log("Petition Server running on 8080..."));
