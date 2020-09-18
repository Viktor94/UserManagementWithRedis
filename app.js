const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// Create Redis Client
let client = redis.createClient();

client.on('connect', function () {
  console.log('Connected to Redis...');
});

client.on("error", function (err) {
  console.log("Error " + err);
});

//Set Port
const port = 3000;

//Init app
const app = express();
app.engine('handlebars', exphbs({defaultLayout: 'main'}));

// View Engine\
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Method Override
app.use(methodOverride('_method'));

//Home page
app.get('/', (req, res, next) => {
  res.render('searchusers')
})

//Search processing
// Search processing
app.post('/user/search', function (req, res, next) {
  let id = req.body.id;

  client.hgetall(id, function (err, obj) {
    if (!obj) {
      res.render('searchusers', {
        error: 'User does not exist'
      });
    } else {
      obj.id = id;
      res.render('details', {
        user: obj
      });
    }
  });
});

//Add User
app.get('/user/add', (req, res, next) => {
  res.render('adduser')
})

// Process Add User Page
app.post('/user/add', function (req, res, next) {
  let id = req.body.id;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let phone = req.body.phone;

  client.hmset(id, [
    'first_name', first_name,
    'last_name', last_name,
    'email', email,
    'phone', phone
  ], function (err, reply) {
    if (err) {
      console.log(err);
    }
    console.log(reply);
    res.redirect('/');
  });
});

//Delete User
app.delete('/user/delete/:id', (req, res, next) => {
  client.del(req.params.id);
  res.redirect('/');
})

app.listen(port, function () {
  console.log('Server started on port: ' + port);
})
