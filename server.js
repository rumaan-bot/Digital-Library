var express = require("express");  
var path = require("path");  
var mongoose = require('mongoose');   
var bodyParser = require('body-parser');   
var morgan = require("morgan");  
var db = require("./config.js");  
var ejs = require('ejs');

var app = express();  
var port = process.env.port || 8888;  
var srcpath  =path.join(__dirname,'/public') ;  
app.use(express.static('public'));  
app.use(bodyParser.json());    
app.use(bodyParser.urlencoded({extended:true}));  
  
// Database Connectivity
var Schema = mongoose.Schema;  
var bookSchema = new Schema({      
    bookid: { type: String, unique : true, dropDups: true  },       
    bookname: { type: String   },            
},{ versionKey: false });  
var model = mongoose.model('book', bookSchema, 'book');  

app.get('/home', function (req, res) {  
   console.log("Got a GET request for the homepage");  
   res.send('<h1>Welcome to Library</h1>');   
})

app.get('/about', function (req, res) {  
   console.log("Got a GET request for /about");  
   res.send('Educational materials available for all subject areas');
})
app.get('/music library project',function(req, res){
	console.log("Got a request for Music Library");
	res.send('Song will be played');
})

app.get('/viewAuthors()',function (req , res){
	console.log("Got a request for author details");
	res.send('Author details are here');
})

//api for INSERT data from database  
app.post("/api/savedata",function(req,res){   
       
    var mod = new model(req.body);  
	req.body.serverMessage = "NodeJS replying to REACT"
	mod.save(function (err, result){                       
        if(err) 
		{ 
			console.log(err.message); 
			//res.send("Duplicate Book ID")
			res.json({
			status: 'fail'
		    })
		} 
		else
		{
            console.log('Book Inserted');
			/*Sending the respone back to the angular Client */
			res.json({
			msg: 'We received your data!!!(nodejs)',
			status: 'success',mydata:req.body
			})
		}
       })     
})  

 // get data from database DISPLAY  
 app.get('/display', function (req, res) { 
//------------- USING EMBEDDED JS -----------
 model.find().sort({bookid:1}).exec(
 		function(err , i){
        if (err) return console.log(err)
        res.render('disp.ejs',{books: i})  
     })
//---------------------// sort({bookid:-1}) for descending order -----------//
})

app.get('/delete.html', function (req, res) {  
   res.sendFile( __dirname + "/" + "delete.html" );    
})

//api for Delete data from database  
app.get("/delete", function(req, res) {
	//var bookidnum=parseInt(req.query.bookid)  // if bookid is an integer
	var bookidnum=req.query.bookid;
	
        model.remove({"bookid":bookidnum},function(err, obj){
				if (err) {
					console.log("Failed to remove data.");
			} else {
				if (obj.result.n>=1)
				{
				res.send("<br/>"+bookidnum+":"+"<b>Book Deleted</b>");
				console.log("Book Deleted")
				}
				else
					res.send("Book Not Found")
			}
        });
  })
  
  
//Update data from database  
app.get('/update.html', function (req, res) {
    res.sendFile( __dirname + "/" + "update.html" );
})

app.get("/update", function(req, res) {
	var bookname1=req.query.bookname;
   	model.findOneAndUpdate({"bookname":bookname1},{"bookname":"newbook"},{multi:true},   
    function(err,obj) {  
     if (err) {  
        res.send(err);
       console.log("Failed to updated data") 
      }
      else 
     {
      if (obj==null)
       {  res.send("Book Not Found") }
     else
      {
	    res.send("<br/>"+bookname1+":"+"<b>Book Name Updated</b>");
	   console.log("Book Updated")
       }
     }
 });	
})	

//--------------SEARCH------------------------------------------
app.get('/search.html', function (req, res) {  
   res.sendFile( __dirname + "/" + "search.html" );    
})

app.get("/search", function(req, res) {
	//var bookidnum=parseInt(req.query.bookid)  // if bookid is an integer
	var bookidnum=req.query.bookid;
	model.find({bookid: bookidnum},{bookname:1,bookid:1,_id:0}).exec(function(err, docs) {
    if (err) {
      console.log(err.message+ "Failed to get data.");
    } else
	{
	if (docs=='')
		res.send("<br/>"+bookidnum+":"+"<b>Book Not Found</b>")
	else
	    res.status(200).json(docs);
	}
  });
  })  
  
// call by default index.html page  
app.get("*",function(req,res){   
    res.sendFile(srcpath +'/index.html');  
})   
//server stat on given port  
app.listen(port,function(){   
    console.log("server start on port:"+ port);  
})  
