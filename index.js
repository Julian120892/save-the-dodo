//Server

const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieParser = require("cookie-parser");

//set up handlebars
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(cookieParser());

//middlewear check requests
app.use((req, res, next) => {
    console.log("--------------");
    console.log(`${req.method} request coming in on route ${req.url}`);
    console.log("--------------");
    next();
});

app.use(express.urlencoded({ extended: false }));

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

//POST /petition
app.post("/petition", (req, res) => {
    const { firstName, lastName } = req.body;
    console.log("a Post request to /petition was made", firstName, lastName);

    db.addUserData(firstName, lastName)
        .then(() => {
            console.log("new signing");
            res.cookie("signed", "signed");
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("error in db.addUserData", err);
            //res.render("petitionPage", {
            //    layout: "main", //+error
            //});
        });
});

//GET /thanks
app.get("/thanks", (req, res) => {
    if (req.cookies.signed != "signed") {
        console.log("not filled out, redirected to petition");
        res.redirect("/petition");
    } else {
        db.getCount().then((result) => {
            let countOfUsers = result.rows[0].count;
            console.log("user Count: ", countOfUsers);
            res.render("thanksPage", {
                layout: "main",
                countOfUsers,
            });
        });
    }
});

//GET /signers
app.get("/signers", (req, res) => {
    if (req.cookies.signed != "signed") {
        console.log("not filled out, redirected to petition");
        res.redirect("/petition");
    } else {
        db.getUsers()
            .then(({ rows }) => {
                console.log("rows: ", rows);
                res.render("signersPage", {
                    layout: "main",
                    rows,
                });
            })
            .catch((err) => {
                console.log("error in db.getUsers ", err);
            });
    }
});

app.listen(8080, () => console.log("Petition Server running on 8080..."));
