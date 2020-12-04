//Server

const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");

//set up handlebars
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//app.use(cookieParser());
app.use(
    cookieSession({
        secret: "This is a secret",
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(express.urlencoded({ extended: false }));

app.use(csurf());

app.use(function (req, res, next) {
    res.set("x-frame-options", "DENY"); //clickjacking
    res.locals.csrfToken = req.csrfToken(); //csrf attacks
    next();
});

//middlewear check requests
app.use((req, res, next) => {
    console.log("--------------");
    console.log(`${req.method} request coming in on route ${req.url}`);
    console.log("--------------");
    next();
});

//static Files
app.use(express.static(__dirname + "/public"));

//GET /
app.get("/", (req, res) => {
    res.redirect("/petition");
});

//GET /petition
app.get("/petition", (req, res) => {
    if (req.session.signed == "signed") {
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
    const { firstName, lastName, hiddenSig } = req.body;
    //console.log("a Post request to /petition was made", req.body);

    if (firstName == "") {
        return;
    } else if (lastName == "") {
        return;
    } else if (hiddenSig == "") {
        return;
    } else {
        db.addUserData(firstName, lastName, hiddenSig)
            .then((id) => {
                console.log("added to DB");
                req.session.signed = "signed";
                req.session.id = id;
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("error in db.addUserData", err);
            });
    }
});

//GET /thanks
app.get("/thanks", (req, res) => {
    if (req.session.signed != "signed") {
        console.log("not filled out, redirected to petition");
        res.redirect("/petition");
    } else {
        db.getCount()
            .then((result) => {
                let countOfUsers = result.rows[0].count;
                let newID = req.session.id.rows[0].id;
                console.log("newID: ", newID);

                db.getUserSignature(newID).then((result) => {
                    //console.log("result: ", result.rows[0].signature);
                    let savedSigning = result.rows[0].signature;
                    res.render("thanksPage", {
                        layout: "main",
                        countOfUsers,
                        savedSigning,
                    });
                });
            })
            .catch((err) => {
                console.log("error in db.getUsers ", err);
            });
    }
});

//GET /signers
app.get("/signers", (req, res) => {
    if (req.session.signed != "signed") {
        console.log("not filled out, redirected to petition");
        res.redirect("/petition");
    } else {
        db.getUsers()
            .then(({ rows }) => {
                //console.log("rows: ", rows);
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
