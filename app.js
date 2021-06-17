// jshint esversion: 6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const dateFormat = require("dateformat");
var now = new Date();
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

const day = dateFormat(now, "yyyy-mm-dd");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("Public"));
app.use(session({
  secret: "Our Little Secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-chinmay:dine0606@cluster0.iwfq8.mongodb.net/myDb", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  secret: String
});
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

const itemSchema = {
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true
  },
  asa: {
    type: String,
    required: true
  },
  hs: {
    type: String,
    required: true
  },
  date: String
};

const Item = mongoose.model("Item", itemSchema);

// login section

app.get("/", function(req, res) {
  res.render("create");
});
app.get("/home", function(req, res){
  if (req.isAuthenticated()){
    res.render("home", {
      date: day
    })
  } else {
    res.redirect("/login")
  }
})
app.get("/login", function(req, res) {
  res.render("login");
});
app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/")
});

app.post("/register", function(req, res) {
  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err)
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/home")
      })
    }
  })
});
app.post("/login", function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/home")
      })
    }
  })
});

app.post("/", function(req, res) {
  const item = new Item({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    asa: req.body.asa,
    hs: req.body.hs,
    date: day
  })
  Item.findOne({
    date: item.date,
    name: item.name
  }, function(err, results) {
    if (!err) {
      if (results) {
        Item.findOne({
          name: item.name,
          date: item.date
        }, function(err, result) {
          if (!err) {
            if (result) {
              result.asa = item.asa;
              result.hs = item.hs;
              console.log(item.asa);
              result.save(function(err, foundResult) {
                if (!err) {
                  console.log(foundResult)
                  res.render("failure")
                } else {
                  res.redirect("/")
                  console.log(err);
                }
              });
            } else {
              item.save(function(err, foundResult) {
                if (!err) {
                  console.log(foundResult)
                  res.render("success")
                } else {
                  res.redirect("/")
                  console.log(err);
                }
              });
            }
          } else {
            console.log(err);
          }
        });
      } else {
        item.save(function(err, foundResult) {
          if (!err) {
            console.log(foundResult)
            res.render("success")
          } else {
            res.redirect("/")
            console.log(err);
          }
        });
      }
    }
  });
});

app.get("/database", function(req, res) {
  Item.find({}, function(err, docs){
    if(!err){
      if(docs){
        res.render("database", {
          docs: docs
        })
      }
    }
  })
})

app.get("/links", function(req, res){
  res.render("links");
});

app.post("/names", function(req, res){
  const searchName = _.capitalize(req.body.searchName);
  Item.find({
    name: searchName
  }, function(err, files){
    if(!err){
      if(files){
        res.render("db-names", {
          personName: searchName,
          files: files
        }); console.log(files)
      } else {
        res.send("no data found")
      }
    } else {
      log(err)
    }
  })
})

app.post("/dates", function(req, res){
  const searchDate = req.body.searchDate;
  console.log(searchDate);
  Item.find({
    date: searchDate
  }, function(err, docs) {
    if (!err) {
      if (docs) {
        res.render("db-date", {
          day: searchDate,
          docs: docs
        }); console.log(docs);
      } else {
        res.send("no date found")
      }
    } else {
      log(err);
    }
  })
})


app.get("/database/:todayDate", function(req, res) {
  const todayDate = req.params.todayDate;
  Item.find({
    date: todayDate
  }, function(err, docs) {
    if (!err) {
      if (docs) {
        res.render("db-date", {
          day: todayDate,
          docs: docs
        }); console.log(docs);
      } else {
        res.send("no date found")
      }
    } else {
      log(err);
    }
  })
});

app.get("/:nameOfPerson", function(req, res){
  const nameOfPerson = _.capitalize(req.params.nameOfPerson);
  Item.find({
    name: nameOfPerson
  }, function(err, files){
    if(!err){
      if(files){
        res.render("db-names", {
          personName: nameOfPerson,
          files: files
        }); console.log(files)
      } else {
        res.send("no data found")
      }
    } else {
      log(err)
    }
  })
});

app.listen(process.env.PORT || 3000, function() {
  console.log("The server is running on Port 3000");
});
// link: https://lg-daily-update-app.herokuapp.com/ //
