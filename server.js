'use strict';
//dependancies
const express=require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg =  require('pg');
const methodOverride=require('method-override');
//dotenv Load
require('dotenv').config();
//dotenv vars
const PORT = process.env.PORT ||3000;
const DATABASE_URL=process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);

//app setup
const app=express();
app.use(cors());
app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(methodOverride('_method'));

//routs
app.get('/',homepage);
app.get('/home' ,gitfactsApi);
app.post('/facts',addfacttodb);
app.get('/facts',readingfromdb);
app.get('/facts/:id',factDetails);
app.put('/facts/:id',updatefact);
app.delete('/facts/:id',deleteFact);
app.use('*',errorHandler);

//functions
function homepage(req,res){
  res.send('hello rania');
}
function gitfactsApi(req,res){
  let url ='https://cat-fact.herokuapp.com/facts';
  let factArr=[];
  superagent.get(url).then(data=>{
    data.body.all.forEach(element => {
      factArr.push(new Fact(element));
    });
    res.render('home-page',{result:factArr});
  });

}
function addfacttodb(req,res){
  let query = 'INSERT INTO fact (text,type) VALUES($1,$2);';
  let values=[req.body.text,req.body.type];
  client.query(query,values).then(()=>{
    res.redirect('/facts');
  }).catch(error=>{
    console.log('error',error);
  });
}
function readingfromdb(req,res){
  let query='SELECT * FROM fact;';
  client.query(query).then(data=>{
    res.render('fav-facts',{result : data.rows});
  }).catch(error=>{
    console.log('error',error);
  });
}
function factDetails(req,res){
  let query = 'SELECT * FROM fact WHERE id=$1;';
  let value= [req.params.id];
  client.query(query,value).then(data=>{
    res.render('fact-details',{result:data.rows[0]});
  }).catch(error=>{
    console.log('error',error);
  });
}
function deleteFact(req,res){
  let query = 'DELETE FROM fact WHERE id=$1;';
  let value = [req.params.id];
  client.query(query,value).then(()=>{
    res.redirect('/facts');
  }).catch(error=>{
    console.log('error',error);
  });
}
//constructor
function Fact(data){
  this.text=data.text;
  this.type=data.type;
}
function updatefact(req,res){
  let query ='UPDATE fact SET type=$1,text=$2 WHERE id=$3;';
  let values=[req.body.type,req.body.text,req.params.id];
  client.query(query,values).then(()=>{
    res.redirect('/facts');
  }).catch(error=>{
    console.log('error',error);
  });
}
function errorHandler(req,res){
  res.status(404).send('Oops not found !');
}

client.connect().then(()=>{
  app.listen(PORT,()=>{
    console.log(`listen to port ${PORT}`);
  });
}).catch(error=>{
  console.log('error',error);
});

