const express = require("express")
const Datastore = require("nedb")
const path = require("path")
const hbs = require("express-handlebars")

const cars = new Datastore({
    filename: 'cars.db',
    autoload: true
})

var app = express()
var PORT = process.env.PORT || 2137;

var options = ["ubezpieczony", "benzyna", "uszkodzony", "napęd 4x4"]
var thisisbad = ["TAK", "NIE"]

app.use(express.static("static"))
app.set('views', path.join(__dirname, 'views'));  
app.engine('hbs', hbs({ 
    defaultLayout: 'main.hbs',
    helpers: {
        bad: function(x) {
            if(thisisbad.indexOf(x) != -1) {
                b = "<td>" + x + "</td>"
                return b
            } else if (x == "BRAK DANYCH") {
                return "<td> </td>";
            } else {
                forms = "<td><form action='/deleteCar'><input type='text' name='_id' value='" + x + "' hidden><input class='delete' type='submit' value='DELETE'></form></td><td><form action='/editCar'><input type='text' name='_id' value='" + x + "' hidden><input class='normie' type='submit' value='EDIT'></form></td>"
                return forms
            }
        },
        thisisbad: function(x) {
            if(thisisbad.indexOf(x) == -1 && x != "BRAK DANYCH" && x != true) {
                bruh = "<input type='text' name='_id' value='" + x + "' hidden></input>"
                return bruh
            }
            else {
                return null
            }
        }
    }
}));   
app.set('view engine', 'hbs');  


app.get("/", function(req, res) {


    cars.find({}, function(err, docs) {
        context = {docs : docs,
            options: options
        }
        res.render('index.hbs', context)
    })
    
    
}) 


app.get("/addCar", function (req, res) {
    
    doc = {}
    options.forEach(x => doc[x] = req.query[x] ? "TAK" : "NIE")

    cars.insert(doc, function (err) {
        res.redirect("/")
    })

})

app.get("/deleteCar", function (req, res) {
    cars.remove({_id: req.query._id}, function(err) {
        res.redirect("/")
    })
})

app.get("/editCar", function (req, res) {
    cars.find({}, function(err, docs) {
        context = {docs : docs,
            options: options
        }
        for(let x of context.docs) {
            if(x._id == req.query._id) {
                x.edited = true
            }
        }
        res.render('index.hbs', context)
    })


})

app.get("/finishEdit", function(req, res) {
    doc = {}
    options.forEach(x => doc[x] = req.query[x])

    cars.update({_id: req.query._id}, {$set: doc}, function(err) {
        res.redirect("/")
    })
}) 


app.listen(PORT, function() {
    console.log("Listening @ ", PORT);
})



