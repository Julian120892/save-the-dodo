exports.requireLoggedOutUser = (req, res, next) => {
    if (req.session.id) {
        res.redirect("/petition");
    } else {
        next();
    }
};

exports.requireUnsignedPetition = (req, res, next) => {
    if (req.session.signed) {
        res.redirect("/thanks");
    } else {
        next();
    }
};

exports.requireSignedPetition = (req, res, next) => {
    if (!req.session.signed) {
        res.redirect("/petition");
    } else {
        next();
    }
};

module.exports.requireLoggedInUser = (req, res, next) => {
    if (!req.session.id && req.url != "/register" && req.url != "/login") {
        res.redirect("/register");
    } else {
        next();
    }
};

exports.cookieSecurity = (req, res, next) => {
    res.set("x-frame-options", "deny");
    res.locals.csrfToken = req.csrfToken();
    next();
};
