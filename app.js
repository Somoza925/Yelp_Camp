var express        = require('express'),
    app            = express(), 
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    Campground     = require("./models/campground"),
    Comment        = require("./models/comment");
    seedDB         = require("./seed");

 mongoose.connect("mongodb://localhost/yelp_camp_3");  
 app.use(bodyParser.urlencoded({extended: true})); // allows the body parser to work
 app.set("view engine", "ejs"); // telling express to use ejs

 seedDB();
 
 app.get("/", function(req, res){
     res.render("landing");
});

//INDEX - show all campgrounds
app.get("/campgrounds", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){ // finds all campgrounds in the collection, throws it into the page.
        if (err){
            console.log(err);   
        } else {
                
               res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
});

//CREATE - add new campground to DB
app.post("/campgrounds", function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newCampground = {name: name, image: image, description: desc};

    // Create new Campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });
});

//NEW - show form to create new campground
app.get("/campgrounds/new", function(req, res){
    res.render("campgrounds/new");
});

//SHOW - shows more info about one campground
app.get("/campgrounds/:id", function(req, res){
    //find the campground with provided ID
    //.populate will get the campground found, fill the comments array with what the ID's are referring to. 
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
     if(err){
         console.log(err);
     } else {
         //render show template with that campground
         res.render("campgrounds/show", {campground: foundCampground});
     }

    });
});

// ===============================
//  COMMENTS ROUTES
// ===============================

app.get("/campgrounds/:id/comments/new", function (req, res){
    // find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if (err){
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});

app.post("/campgrounds/:id/comments", function (req, res){
    //look up campground using ID
    Campground.findById(req.params.id, function(err, campground){
        if (err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if (err){
                    console.log(err);
                } else {
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/"+ campground._id);
                }
            });
        }
    });
    //connect comment to campground
    //redircet campground show page
});






var port = process.env.PORT || 9250;
app.listen(port, function(){
    console.log('The YelpCamp server has started on ' + port+'!!!!');
}); 