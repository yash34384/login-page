// I have used very simple UI using ejs but We can also do it using react or angular like frameworks with more  styling. And authentication can be more powerful using encryption and other things, it is just for demo. 

// importing modules 
const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');

// using middleware 
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// connecting sql server 
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'node'
});

conn.connect(function (err) {
  if (err) {
    throw err;
  }
  console.log('connected....');
})

// setting ejs 
app.set('view engine', 'ejs');

// login user
app.get('/', (req, res) => {
  res.render('user_login', {
    title: 'Login Page'
  });
});
app.post('/login', (req, res) => {
  const email = req.body.user_email;
  const password = req.body.password;
  if (email && password) {
    let sql = `select * from users where user_email='${email}' and password='${password}'`;
    conn.query(sql, function (err, results) {
      if (results.length > 0) {
        req.session.loggedin = true;
        req.session.email = email;
        res.redirect('/adm');
      }
      else {
        res.render('alert', {
          alert: 'incorrect username or password'
        });
      }
    });
  }
  else {
    res.render('alert', {
      alert: 'Login First'
    });
  }
});

// showing all users 
app.get('/adm', (req, res) => {
  if (req.session.loggedin) {
    let sql = "SELECT * FROM users";
    let query = conn.query(sql, (err, rows) => {
      if (err) throw err;
      res.render('user_index', {
        title: 'User Management',
        users: rows
      });
    });
  }
  else {
    res.render('alert', {
      alert: 'Login First'
    });
  }
});

// adding new user
app.get('/add', (req, res) => {
  if (req.session.loggedin) {
    res.render('user_add', {
      title: 'User Management'
    });
  }
  else {
    res.render('alert', {
      alert: 'Login First'
    });
  }
});
app.post('/save', (req, res) => {
  if (req.body.password === req.body.con_password) {
    let data = { user_name: req.body.user_name, user_email: req.body.user_email, password: req.body.password };
    let sql = "INSERT INTO users SET ?";
    let query = conn.query(sql, data, (err, results) => {
      if (err) throw err;
      res.redirect('/adm');
    });
  }
  else {
    res.render('alert', {
      alert: 'Cofirm password does not match'
    });
  }
});

// editing user 
app.get('/edit/:userId', (req, res) => {
  if (req.session.loggedin) {
    const userId = req.params.userId;
    let sql = `Select * from users where user_id = ${userId}`;
    let query = conn.query(sql, (err, result) => {
      if (err) throw err;
      res.render('user_edit', {
        title: 'User Management',
        user: result[0]
      });
    });
  }
  else {
    res.render('alert', {
      alert: 'Login First'
    });
  }
});
app.post('/update', (req, res) => {
  const userId = req.body.user_id;
  let sql = `update users SET user_name='${req.body.user_name}', password='${req.body.password}' where user_id='${userId}'`;
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.redirect('/adm');
  });
});

// deleting user 
app.get('/delete/:userId', (req, res) => {
  if (req.session.loggedin) {
    const userId = req.params.userId;
    let sql = `DELETE from users where user_id = ${userId}`;
    let query = conn.query(sql, (err, result) => {
      if (err) throw err;
      res.redirect('/adm');
    });
  }
  else {
    res.render('alert', {
      alert: 'Login First'
    });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    res.redirect('/');
  });
});

// starting server 
const server = app.listen(4000, function () {
  console.log('server start on port 4000');
});