//Server

const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const { hash, compare } = require("./bc");

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

/////////////////////////////////////////////////////////////////////////
//////////////////////////PETITION//////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

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
    let user_id = req.session.id;
    console.log("id: ", user_id);

    const { hiddenSig } = req.body;
    //console.log("a Post request to /petition was made", req.body);
    if (hiddenSig == "") {
        return;
    } else {
        console.log("id: ", user_id);
        db.addUserSig(hiddenSig, user_id)
            .then(() => {
                console.log("added to DB");
                req.session.signed = "signed";
                //req.session.id = id;
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("error in db.addUserSig", err);
            });
    }
});

/////////////////////////////////////////////////////////////////////////
//////////////////////////REGISTER //////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

//GET /register
app.get("/register", (req, res) => {
    res.render("registerPage", {
        layout: "main",
    });
});

//POST /register
app.post("/register", (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    //console.log("a Post request to /register was made", req.body);

    if (firstName == "") {
        return;
    } else if (lastName == "") {
        return;
    } else if (email == "") {
        return;
    } else if (password == "") {
        return;
    } else {
        hash(password).then((hash) => {
            db.newUser(firstName, lastName, email, hash)
                .then((id) => {
                    console.log("added to DB");
                    req.session.id = id.rows[0].id;
                    req.session.signed = "false";
                    res.redirect("/petition");
                })
                .catch((err) => {
                    console.log("error in db.register", err);
                    //if insert fails, re-render template with an error message!!!!!!!
                });
        });
    }
});

/////////////////////////////////////////////////////////////////////////
//////////////////////////LOG IN ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
//GET Log In
app.get("/login", (req, res) => {
    res.render("logInPage", {
        layout: "main",
    });
});

//POST Log In
app.post("/login", (req, res) => {
    //console.log(req.body);
    const { email, password } = req.body;
    db.LogIn(email, password)
        .then((hash) => {
            if (compare(password, hash.rows[0].password)) {
                req.session.logged = "true";
                console.log(hash.rows);
                req.session.id = 22; //put user_id in here!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                if (req.session.signed != "signed") {
                    res.redirect("/petition");
                } else {
                    res.redirect("/thanks");
                }
            } else {
                console.log("wrong password");
                //something went wrong new passowrd please
            }
        })
        .catch((err) => {
            console.log("error in db.login", err);
        });
});

/////////////////////////////////////////////////////////////////////////
//////////////////////////Thanks ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
//GET /thanks
app.get("/thanks", (req, res) => {
    if (req.session.signed != "signed") {
        console.log("not filled out, redirected to petition");
        res.redirect("/petition");
    } else {
        db.getCount()
            .then((result) => {
                let countOfUsers = result.rows[0].count;
                let newID = req.session.id;
                console.log("newID: ", newID);

                db.getUserSignature(newID).then((result) => {
                    console.log("result: ", result.rows[0]);
                    let savedSigning = result.rows[0].signature;
                    res.render("thanksPage", {
                        layout: "main",
                        countOfUsers,
                        savedSigning,
                    });
                });
            })
            .catch((err) => {
                console.log("error in db.getUserSignature and getCount", err);
            });
    }
});

/////////////////////////////////////////////////////////////////////////
//////////////////////////Signers ///////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

//GET /signers
app.get("/signers", (req, res) => {
    if (req.session.signed != "signed") {
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

/////////////////////////////////////////////////////////////////////////
//////////////////////////all other /////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

//GET /
app.get("*", (req, res) => {
    res.redirect("/register");
});

app.listen(8080, () => console.log("Petition Server running on 8080..."));
