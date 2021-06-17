// jshint esversion: 6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

const day = date.getDate();



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/lgDb", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemSchema = {

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

const collectionItems = [];

const listSchema = {
  name: String,
  data: [itemSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function(req, res) {
  res.render("home", {
    date: day
  });
});

app.get("/database", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (!err) {
      res.render("database", {
        post: foundItems
      })
      console.log(foundItems)
    }
  });
});

app.post("/", function(req, res) {

  var item = new Item({
    name: req.body.name,
    asa: req.body.asa,
    hs: req.body.hs,
    date: day
  });

 Item.findOne({date:item.date},function(err,results){
   if(!err){
     if(results){
       Item.findOne({name:item.name},function(err,result){
        if(!err){
          if(result){

               result.asa = item.asa;
               result.hs = item.hs;
              console.log(item.asa);
              result.save(function(err, foundResult) {
                if (!err) {
                  console.log(foundResult)
                  res.render("success")
                } else {
                  res.redirect("/")
                  console.log(err);
                }
              });
            }
            else{
              item.save(function(err, foundResult) {
                if (!err) {
                  console.log(foundResult)
                  res.render("success")
                } else {
                  res.redirect("/")
                  console.log(err);
                }
              });
            }}
            else{
              console.log(err);
            }

       });

     }
     else{
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
 })
})



app.get("/database/:todayDate",function(req,res){
  const todayDate = req.params.todayDate;
  Item.find({date:todayDate},function(err,docs){
    console.log(docs);
  if(!err){
    if(docs){
      //res.send(docs);
      res.render("db",{
        day : todayDate,
        docs:docs
      })
    }
    else{
      res.send("no date found")
    }

  }
  else{
    log(err);
  }

  })
})




app.listen(process.env.PORT||3000, function() {
  console.log("The server is running on pPort 3000");
});
