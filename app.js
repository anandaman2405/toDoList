const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require('dotenv').config();

const user = process.env.user;
const password = process.env.pass

//mongoose.connect("mongodb://localhost:27017/todoListDB", {
mongoose.connect("mongodb+srv://"+user+":"+password+"@cluster0.ilsme.mongodb.net/todoListDB", {useNewUrlParser: true, useUnifiedTopology: true});

const app = express();

const itemsSchema = {
  workList: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  workList: "Cycling"
});

const item2 = new Item({
  workList: "Reading"
});

const item3 = new Item({
  workList: "Workout"
});

const listSchema = {
  name: String,
  listItem: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

const defaultItems = [item1, item2, item3];




app.set("view engine", "ejs"); //to use ejs template
app.use(bodyParser.urlencoded({
  extended: true
})); //to use data entered by user in website in our code or server side
app.use(express.static("public")); //to tell node to serve up public folder otherwise only views and remaining files(app.js,index.html..) will be served.

var items = [];

app.get("/", function(req, res) {

  // var options = {
  //   weekday : "long",
  //   day : "numeric",
  //   month : "long"
  // }
  //
  // var today = new Date();
  // var day = today.toLocaleDateString("en-US",options);
  const day = "Today";
  Item.find({}, function(err, foundItems) {

    if (foundItems == "") {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Inserted Successfully!");
        }
      })
      res.redirect("/")
    } else {
      res.render("list", {
        kindofDay: day,
        add: foundItems
      });
    }


  })
});

app.post("/", function(req, res) {
  const newItem = req.body.toDo;
  const routeTarget = req.body.button;

  const itemAdd = new Item({
    workList: newItem
  })
  if (routeTarget === "Today") {
    itemAdd.save();
    res.redirect("/")
  } else {
    List.findOne({
      name: routeTarget
    }, function(err, result) {
      result.listItem.push(itemAdd);
      result.save();
      res.redirect("/" + routeTarget);
    })
  }
})

app.post("/delete", function(req, res) {
  const checkedItem = req.body.checkbox;
  const listItem = req.body.listItem;
  console.log(checkedItem);

  Item.findByIdAndRemove(checkedItem, function(err) {
    if (err) {
      console.log(err)
    } else {
      console.log("Deleted successfully!")
    }
  })
  if (listItem === "Today") {
    res.redirect("/")
  } else {
    List.findOneAndUpdate({name:listItem},{$pull:{listItem:{_id:checkedItem}}},function(err){
      if(!err){
        res.redirect("/"+listItem);
      }
    })
  }
})

app.get("/:topic", function(req, res) {
  const customName = _.capitalize(req.params.topic);



  List.findOne({
    name: customName
  }, function(err, results) {
    if (!err) {
      if (!results) {
        const item1 = new List({
          name: customName,
          listItem: defaultItems
        })
        item1.save();
        res.redirect("/" + customName)
      } else {
        res.render("list", {
          kindofDay: customName,
          add: results.listItem
        });
      }
    }
  })


})

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully!");
});
