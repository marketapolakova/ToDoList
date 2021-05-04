require('dotenv').config()
const express = require("express")
const app = express()
const date = require("./date")
const mongoose = require("mongoose")
const _=require("lodash")
app.set("view engine", "ejs")

app.use(express.urlencoded({
    extended: true
}))
app.use(express.static("public"))

mongoose.connect(process.env.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const itemSchema = new mongoose.Schema({
    name: String
})


const Item = mongoose.model("Item", itemSchema)

const items = []
// Item.insertMany(items, function(err){
//     if (err){
//         console.log(err);
//     } else {
//         console.log("Beautifull");
//     }
// })


const lists = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("List", lists)

// let day= date().toString()

app.get("/", function (req, res) {
    Item.find(function (err, results) {
        if (err) {
            console.log(err);
        } else {
            res.render("list", {
                listTitle: "Today",
                newListItem: results
            })
        }
    })
    // let day=date()


})

app.post("/", function (req, res) {



    // if(req.body.list ==="Work"){
    //     workItems.push(req.body.newItem)

    //     res.redirect("/work")
    // } else{
    const listName = req.body.list

    const newItem = new Item({
        name: req.body.newItem

    })
    if (listName == "Today") {
        newItem.save()
        res.redirect("/")
    } else {
        List.findOne({
            name: listName
        }, function (err, foundList) {
            foundList.items.push(newItem)
            foundList.save()
            res.redirect("/" + listName)
        })
    }

    // }
})

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName
    if (listName === "Today") {

        Item.findByIdAndDelete(checkedItemId, function (err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/")
            }

        })
    } else{
        List.findOneAndUpdate({name: listName}, {$pull:{items:{_id:checkedItemId}}}, function(err, foundList){
            // !err= pokud nejsou erory
            if (!err){
                res.redirect("/"+listName)
            }
        })
    }

    // mongoose.connection.close()
})



app.get("/:route", function (req, res) {
    List.findOne({
        name: _.capitalize(req.params.route)
    }, function (err, results) {
        if (results) {
            res.render("list", {
                listTitle: results.name,
                newListItem: results.items
            })
            console.log("found");
        } else {
            const list = new List({
                name: _.capitalize(req.params.route),
                items: items
            })
            list.save()
            res.redirect("/" + _.capitalize(req.params.route))
        }

    })

})

app.get("/index", function (req, res) {
    res.render("index")
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function (req, res) {
    console.log(`server started at port ${port}`);
})