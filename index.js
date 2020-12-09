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
    if (hiddenSig == "") {
        return;
    } else {
        console.log("id: ", user_id);
        db.addUserSig(hiddenSig, user_id)
            .then(() => {
                console.log("added to DB");
                req.session.signed = "signed";
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
                    console.log("added User to Data Base");
                    req.session.id = id.rows[0].id;
                    req.session.signed = "false";
                    res.redirect("/profile");
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
    const { email, password } = req.body;
    db.LogIn(email, password)
        .then((hash) => {
            if (compare(password, hash.rows[0].password)) {
                let currentEmail = req.body.email;
                db.getUserId(currentEmail)
                    .then((result) => {
                        req.session.id = result.rows[0].id;
                        db.getUserSignature(result.rows[0].id).then(
                            (result) => {
                                if (result.rows[0].signature) {
                                    req.session.signed = "signed";
                                    res.redirect("/thanks");
                                } else {
                                    res.redirect("/thanks");
                                }
                            }
                        );
                    })
                    .catch((err) => {
                        console.log("error in db.getUserId", err);
                    });
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
//////////////////////////Profile////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
//GET profile
app.get("/profile", (req, res) => {
    res.render("profilePage", {
        layout: "main",
    });
});

//POST profile
app.post("/profile", (req, res) => {
    if (
        req.body.website.startsWith("http") ||
        req.body.website.startsWith("https")
    ) {
        let age = req.body.age;
        let city = req.body.city;
        let url = req.body.website;
        let id = req.session.id;

        db.addUserData(age, city, url, id)
            .then(() => {
                if (req.session.signed != "signed") {
                    res.redirect("/petition");
                }
            })
            .catch((err) => {
                console.log("error in db.addUserData and getCount", err);
            });
    } else {
        console.log("no website");
        //db add error
    }
});

/////////////////////////////////////////////////////////////////////////
//////////////////////////Thanks ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
//GET /thanks
app.get("/thanks", (req, res) => {
    if (req.session.signed != "signed") {
        res.redirect("/petition");
    } else {
        db.getCount()
            .then((result) => {
                let countOfUsers = result.rows[0].count;
                let newID = req.session.id;

                db.getUserSignature(newID).then((result) => {
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

app.post("/thanks", (req, res) => {
    console.log("a post request to thanks was made");
});

/////////////////////////////////////////////////////////////////////////
//////////////////////////Edit Profile////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
//GET edit
app.get("/edit", (req, res) => {
    db.getSpecificUser(req.session.id).then(({ rows }) => {
        res.render("editPage", {
            layout: "main",
            rows,
        });
    });
});

app.post("/edit", (req, res) => {
    const {
        firstName,
        lastName,
        email,
        password,
        age,
        city,
        website,
    } = req.body;
    const id = req.session.id;

    if (password != "") {
        console.log("password changed");
        hash(password)
            .then((hash) => {
                db.updatePasswortAndUser(id, firstName, lastName, email, hash);
            })
            .catch((err) => {
                console.log("error in db.updatePasswordAndUser ", err);
            });
    } else {
        console.log("just data changed");
        //IF no password {change first, last, email}
        db.updateUser(id, firstName, lastName, email).catch((err) => {
            console.log("error in signers db.getUsers ", err);
        });
    }
    //console.log(age, city, website, id);
    db.updateUserProfile(age, city, website, id)
        .catch((err) => {
            console.log("error in db.updateUserProfile ", err);
        })
        .then(() => {
            res.redirect("/thanks");
        });
});

/////////////////////////////////////////////////////////////////////////
//////////////////////////Signers ///////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

//GET /signers
app.get("/signers", (req, res) => {
    if (req.session.signed != "signed") {
        res.redirect("/petition");
    } else {
        db.getUsers()
            .then(({ rows }) => {
                res.render("signersPage", {
                    layout: "main",
                    rows,
                });
            })
            .catch((err) => {
                console.log("error in signers db.getUsers ", err);
            });
    }
});

/////////////////////////////////////////////////////////////////////////
//////////////////////////City Signers///////////////////////////////////
/////////////////////////////////////////////////////////////////////////

//GET /signers/:city
app.get("/signers/:city", (req, res) => {
    if (req.session.signed != "signed") {
        res.redirect("/petition");
    } else {
        let city = req.params.city;
        db.getUserFromCity(city)
            .then(({ rows }) => {
                res.render("signersCity", {
                    layout: "main",
                    rows,
                });
            })
            .catch((err) => {
                console.log("error in signers db.getUsers ", err);
            });
    }
});

/////////////////////////////////////////////////////////////////////////
//////////////////////////all other /////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

//GET /
// app.get("*", (req, res) => {
//     res.redirect("/register");
// });

app.listen(process.env.PORT || 8080, () =>
    console.log("Petition Server running on 8080...")
);
