//Server

const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const { hash, compare } = require("./bc");

const {
    requireLoggedOutUser,
    requireSignedPetition,
    requireUnsignedPetition,
    requireLoggedInUser,
    cookieSecurity,
} = require("./middlewear");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(
    cookieSession({
        secret: "This is a secret",
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);
app.use(express.urlencoded({ extended: false }));
app.use(csurf());
app.use(cookieSecurity);

app.use((req, res, next) => {
    console.log("--------------");
    console.log(`${req.method} request coming in on route ${req.url}`);
    console.log("--------------");
    next();
});

app.use(express.static(__dirname + "/public"));

//GET /petition
app.get("/petition", (req, res) => {
    res.render("petitionPage", {
        layout: "main",
    });
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
                req.session.signed = true;
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("error in db.addUserSig", err);
            });
    }
});

//GET /register
app.get("/register", requireLoggedOutUser, (req, res) => {
    res.render("registerPage", {
        layout: "main",
    });
});

//POST /register
app.post(
    "/register",
    requireLoggedOutUser,

    (req, res) => {
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
                        console.log("added User to Data Base", id.rows[0].id);
                        req.session.id = id.rows[0].id;
                        req.session.signed = true;
                        res.redirect("/profile");
                    })
                    .catch((err) => {
                        console.log("error in db.register", err);
                        //if insert fails, re-render template with an error message!!!!!!!
                    });
            });
        }
    }
);

//GET Log In
app.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("logInPage", {
        layout: "main",
    });
});

//POST Log In
app.post("/login", requireLoggedOutUser, (req, res) => {
    const { email, password } = req.body;
    console.log(email);
    db.LogIn(email, password)
        .then((hash) => {
            if (compare(password, hash.rows[0].password)) {
                let currentEmail = req.body.email;
                db.getUserId(currentEmail)
                    .then((result) => {
                        req.session.id = result.rows[0].id;
                        db.getUserSignature(result.rows[0].id)
                            .then(() => {
                                res.redirect("/thanks");
                            })
                            .catch((err) => {
                                console.log(
                                    "error in .then of getUserSig",
                                    err
                                );
                            });
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

//GET Log Out
app.post("/logout", (req, res) => {
    console.log("hello there");
    req.session.id = null;
    res.redirect("/login");
});

//GET profile
app.get("/profile", requireLoggedInUser, (req, res) => {
    res.render("profilePage", {
        layout: "main",
    });
});

//POST profile
app.post("/profile", requireLoggedInUser, (req, res) => {
    if (
        req.body.website.startsWith("http") ||
        req.body.website.startsWith("https")
    ) {
        let age = req.body.age;
        let city = req.body.city;
        let url = req.body.website;
        let id = req.session.id;

        db.addUserData(age, city.toLowerCase(), url, id)
            .then(() => {
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("error in db.addUserData and getCount", err);
            });
    } else {
        console.log("no website");
        //db add error
    }
});

//GET /thanks
app.get("/thanks", requireSignedPetition, (req, res) => {
    db.getCount()
        .then((result) => {
            let countOfUsers = result.rows[0].count;
            let newID = req.session.id;

            db.getUserSignature(newID).then((result) => {
                if (!result.rows[0]) {
                    return;
                }
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
});

//GET edit
app.get("/edit", requireLoggedInUser, (req, res) => {
    db.getSpecificUser(req.session.id).then(({ rows }) => {
        console.log(req.session.id);
        console.log(rows);
        res.render("editPage", {
            layout: "main",
            rows,
        });
    });
});

app.post("/edit", requireLoggedInUser, (req, res) => {
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
        db.updateUser(id, firstName, lastName, email).catch((err) => {
            console.log("error in signers db.getUsers ", err);
        });
    }
    db.updateUserProfile(age, city.toLowerCase(), website, id)
        .catch((err) => {
            console.log("error in db.updateUserProfile ", err);
        })
        .then(() => {
            res.redirect("/thanks");
        });
});

// POST delete signature
delete app.post("/delete", (req, res) => {
    console.log("delete signature");
    let id = req.session.id;

    db.deleteSignature(id)
        .then(() => {
            req.session.signed = null;
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("error in delete signature", err);
        });
});

//GET /signers
app.get("/signers", requireSignedPetition, (req, res) => {
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
});

//GET /signers/:city
app.get("/signers/:city", requireSignedPetition, (req, res) => {
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
});

// GET "/""
app.get("/", (req, res) => {
    res.redirect("/register");
});

//GET "/info"
app.get("/info", (req, res) => {
    res.render("infoPage", {
        layout: "main",
    });
});

//start server
app.listen(process.env.PORT || 8080, () =>
    console.log("Petition Server running on 8080...")
);
