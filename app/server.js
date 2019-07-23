
var express = require('express'),
cookieParser = require('cookie-parser'),
session = require('express-session'),
passport = require('passport'),
LocalStrategy = require('passport-local').Strategy,
bodyParser = require('body-parser'),
flash = require('express-flash'),
morgan = require('morgan'),
multer = require('multer');

var db = require('./data/db.js'),
album_hdlr = require('./handlers/albums.js'),
page_hdlr = require('./handlers/pages.js'),
helpers = require('./handlers/helpers.js');

var app = express();

app.use(express.static(__dirname + "/../static"));
app.use(morgan('dev'));

// Parse application/x-www-form-urlencoded & JSON
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var upload = multer({ dest: "uploads/" });

var session_configuration = {
    secret: 'whoopity whoopity whoop whoop',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
};

session_configuration.cookie.secure = false;
app.use(flash());
app.use(session(session_configuration));
app.use(cookieParser('whoopity whoopity whoop whoop'));
app.use(passport.initialize());
app.use(passport.session());

var users = {
    "id123456" : { id: 123456, username: "marcwan", password: "boo" },
    "id1" : { id: 1, username: "admin", password: "admin" }
};

passport.use(new LocalStrategy(
    function (username, password, done) {
        for (userid in users) {
            var user = users[userid];
            if (user.username.toLowerCase() == username.toLowerCase()) {
                if (user.password == password)
                {
                    return done(null, user);
                }
            }
        }
        return done(null, false, { message: 'Incorrect Credentials.'});
    }
));

passport.serializeUser(function( user, done) {
    if (users["id" + user.id]) {
        done(null, "id" + user.id);
    }
    else {
        done(new Error("CANT_SERIALIZE_INVALID_USER"));
    }
});

passport.deserializeUser(function( userid, done) {
    if (users[userid]) {
        done(null, users[userid]);
    }
    else {
        done(new Error("CANT_FIND_USER_TO_DESERIALIZE"));
    }
});



app.get('/v1/albums.json', album_hdlr.list_all);
app.put('/v1/albums.json', album_hdlr.create_album);
app.get('/v1/albums/:album_name.json', album_hdlr.album_by_name);
app.get('/v1/albums/:album_name/photos.json', album_hdlr.photos_for_album);
app.put('/v1/albums/:album_name/photos.json',
    upload.single("photo_file"),
    album_hdlr.add_photo_to_album);

app.get('/pages/:page_name', page_hdlr.generate);
app.get('/pages/:page_name/:sub_page', page_hdlr.generate);


// app.get("/", (req, res) => {
// res.redirect("/pages/home");
// res.end();
// });

app.get("/", function (req, res) {
    console.log(req.flash());
    res.end('<a href="/login">Login Here</a>');
});

app.get("/login", function(req, res) {
    var error = req.flash("error");
    var form = '<form action="/login" method="post">' +
        '   <div>' +
        '       <label>Username:</label>' +
        '       <input type="text" name="username"/>' +
        '   </div>' +
        '   <div>' +
        '       <label>Password:</label>' +
        '       <input type="password" name="password"/>' +
        '   </div>' +
        '   <div>' +               
        '       <input type="submit" value="Log In"/>' +
        '   </div>' +
        '</form>';
    
        if (error && error.length) {
            form = "<b> " + error[0] + "</b><br/>" + form;
        }
        
        res.send(form);
});

app.post("/login",
    passport.authenticate('local', { successRedirect: '/pages/home',
                                        failureRedirect: '/login',
                                        successFlash: { message: "welcome back" },
                                        failureFlash: true })
    );

app.get('*', four_oh_four);

function four_oh_four(req, res) {
res.writeHead(404, { "Content-Type" : "application/json" });
res.end(JSON.stringify(helpers.invalid_resource()) + "\n");
}

function authenticatedOrNot(req, res, next) {
    if(req.isAuthenticated()) {
        next();
    }
    else {
        res.redirect("/login");
    }
}

/**
* Initialise the server and start listening when we're ready!
*/
db.init( (err, results) => {
if (err) {
    console.error("** FATAL ERROR ON STARTUP: ");
    console.error(err);
    process.exit(-1);
}

console.log("** Database initialised, listening on port 8080");
app.listen(8080);
});

// app.get("/", function (req, res) {
//     console.log(req.flash());
//     res.end('<a href="/login">Login Here</a>');
// });

// app.get("/login", function(req, res) {
//     var error = req.flash("error");
//     var form = '<form action="/login" method="post">' +
//         '   <div>' +
//         '       <label>Username:</label>' +
//         '       <input type="text" name="username"/>' +
//         '   </div>' +
//         '   <div>' +
//         '       <label>Password:</label>' +
//         '       <input type="password" name="password"/>' +
//         '   </div>' +
//         '   <div>' +               
//         '       <input type="submit" value="Log In"/>' +
//         '   </div>' +
//         '</form>';
    
//         if (error && error.length) {
//             form = "<b> " + error[0] + "</b><br/>" + form;
//         }
        
//         res.send(form);
// });

// app.post("/login",
//     passport.authenticate('local', { successRedirect: '/pages/home',
//                                         failureRedirect: '/login',
//                                         successFlash: { message: "welcome back" },
//                                         failureFlash: true })
//     );




// var express = require('express'),
//     cookieParser = require('cookie-parser'),
//     session = require('express-session'),
//     passport = require('passport'),
//     LocalStrategy = require('passport-local').Strategy,
//     bodyParser = require('body-parser'),
//     flash = require('express-flash'),
//     db = require('./data/db.js'),
//     morgan = require('morgan'),
//     multer = require('multer'),
//     album_hdlr = require('./handlers/albums.js'),
//     page_hdlr = require('./handlers/pages.js'),
//     helpers = require('./handlers/helpers.js'),
//     fs = require('fs');    

// var app = express();

// var session_configuration = {
//     secret: 'whoopity whoopity whoop whoop',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: true }
// };

// session_configuration.cookie.secure = false;
// app.use(flash());
// app.use(session(session_configuration));
// app.use(cookieParser('whoopity whoopity whoop whoop'));
// app.use(passport.initialize());
// app.use(passport.session());

// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json())

// var upload = multer({ dest: "uploads/"});

// var users = {
//     "id123456" : { id: 123456, username: "marcwan", password: "boo" },
//     "id1" : { id: 1, username: "admin", password: "admin" }
// };

// passport.use(new LocalStrategy(
//     function (username, password, done) {
//         for (userid in users) {
//             var user = users[userid];
//             if (user.username.toLowerCase() == username.toLowerCase()) {
//                 if (user.password == password)
//                 {
//                     return done(null, user);
//                 }
//             }
//         }
//         return done(null, false, { message: 'Incorrect Credentials.'});
//     }
// ));

// passport.serializeUser(function( user, done) {
//     if (users["id" + user.id]) {
//         done(null, "id" + user.id);
//     }
//     else {
//         done(new Error("CANT_SERIALIZE_INVALID_USER"));
//     }
// });

// passport.deserializeUser(function( userid, done) {
//     if (users[userid]) {
//         done(null, users[userid]);
//     }
//     else {
//         done(new Error("CANT_FIND_USER_TO_DESERIALIZE"));
//     }
// });



// app.use(express.static(__dirname + "/../static"));
// app.use(morgan('dev'));

// app.get('/v1/albums.json', album_hdlr.list_all);
// app.put('/v1/albums.json', album_hdlr.create_album);
// app.get('/v1/albums/:album_name.json', album_hdlr.album_by_name);

// app.put('/v1/albums/:album_name/photos.json',
//         upload.single("photo_file"),
//         album_hdlr.add_photo_to_album);
// app.get('/pages/:page_name', authenticatedOrNot, page_hdlr.generate);
// app.get('/pages/:page_name/:sub_page', authenticatedOrNot, page_hdlr.generate);

// // app.get("/", function (req, res) {
// //     res.redirect("/pages/home");
// //     res.end();
// // });

// app.get("/", function (req, res) {
//     console.log(req.flash());
//     res.end('<a href="/login">Login Here</a>');
// });

// app.get("/login", function(req, res) {
//     var error = req.flash("error");
//     var form = '<form action="/login" method="post">' +
//         '   <div>' +
//         '       <label>Username:</label>' +
//         '       <input type="text" name="username"/>' +
//         '   </div>' +
//         '   <div>' +
//         '       <label>Password:</label>' +
//         '       <input type="password" name="password"/>' +
//         '   </div>' +
//         '   <div>' +               
//         '       <input type="submit" value="Log In"/>' +
//         '   </div>' +
//         '</form>';
    
//         if (error && error.length) {
//             form = "<b> " + error[0] + "</b><br/>" + form;
//         }
        
//         res.send(form);
// });

// app.post("/login",
//     passport.authenticate('local', { successRedirect: '/pages/home',
//                                         failureRedirect: '/login',
//                                         successFlash: { message: "welcome back" },
//                                         failureFlash: true })
//     );

// app.get('*', four_oh_four);

// function four_oh_four(req, res) {
//     res.writeHead(404, { "Content-Type" : "application/json" });
//     res.end(JSON.stringify(helpers.invalid_resource()) + "\n");
// }

// function authenticatedOrNot(req, res, next) {
//     if(req.isAuthenticated()) {
//         next();
//     }
//     else {
//         res.redirect("/login");
//     }
// }

// //app.listen(8080);

// db.init( (err, results) => {
//     if (err) {
//         console.error("** FATAL ERROR ON STARTUP: ");
//         console.error(err);
//         process.exit(-1);
//     }
//     console.error("** Database initialized, listening on port 8080");
//     app.listen(8080);
// });