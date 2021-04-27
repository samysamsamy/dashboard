'use strict';

const express = require('express')
const app = express()
const port = 8080
const axios = require('axios');
const bodyParser = require('body-parser');
const md5 = require('js-md5');
let jsonWidget = require('./public/json/widget.json')

app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// BEG NASA
app.post('/nasa', (req, res) => {
  planetary(req.body.date, res)
})

function planetary(date, res) {
  axios.get("https://api.nasa.gov/planetary/apod?api_key=RG44KjsgTZhC4hc3OmVgxyMjraZcjcohHPPx4oZh&date=" + date).then((response) => {
    res.status(200)
    res.send({ url: response.data.url })
  }).catch((err) => {
    res.status(err.response.data.code)
    res.send(err.response.data.msg)
  })
}

// END NASA

app.post('/country', (req, res) => {
  getcountry(req.body.ip, res)
})

function getcountry(ip, res) {
      axios.get("https://api.ip2country.info/ip?" + ip).then((response) => {
        res.status(200)
        res.send({ Country: response.data.countryName})
      }).catch((err) => {
        res.status(err.response.data.code)
        res.send(err.response.data.msg)
      })
}


// BEG CITY WEATHER

app.post('/cityWeather', (req, res) => {
  getCityWeather(req.body.city, res)
})

function getCityWeather(city, res) {
  axios.get("http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=e349ae55f077143f4cc830950565694a").then((response) => {
    res.status(200)
    let temp = (response.data.main.temp - 273.15)
    res.send({ temperature: temp, weather: response.data.weather[0].description })
  }).catch((err) => {
    res.status(err.response.data.code)
    res.send(err.response.data.msg)
  })
}

// END CITY WEATHER

// BEG CASH CONVERTER
app.post('/converter', (req, res) => {
  getConversion(req.body.from, req.body.to, req.body.quantity, res)
})

function getConversion(from, to, qty, res) {
  axios.get("http://api.currencies.zone/v1/quotes/" + from + "/" + to + "/json?quantity=" + qty + "&key=6276|G77ejZHhzFBtKy7iXDgSh8^BNA3vjtc6").then((response) => {
    res.status(200)
    res.send({ toConvert: { type: from, quantity: qty }, converted: { type: to, quantity: response.data.result.amount } })
  }).catch((err) => {
    res.status(err.response.data.code)
    res.send(err.response.data.msg)
  })
}



app.get('/getAllRateFrom', (req, res) => {
  getAllRateFrom(req.body.devise, res)
})


function getAllRateFrom(devise, res) {
  axios.get("http://api.currencies.zone/v1/full/" + devise + "/json?key=6276|G77ejZHhzFBtKy7iXDgSh8^BNA3vjtc6").then((response) => {
    res.status(200)
    res.send(response.data)
  }).catch((err) => {
    res.status(err.response.data.code)
    res.send(err.response.data.msg)
  })
}
// END CASH CONVERTER

// BEG LICHESS

app.post('/lichess', (req, res) => {
  getUserInfoLichess(req.body.username, res)
})

function getUserInfoLichess(username, res) {
  axios.get("https://lichess.org/api/user/" + username).then((response) => {
    res.status(200)
    console.log('pass')
    res.send({ info: response.data.perfs.classical})
  }).catch((err) => {
    res.status(err.response.data.code)
    res.send(err.response.data.msg)
  })
}

// END LICHESS


// app.get('/', (req, res) => {
//   res.send("ok")
// })
// const { auth } = require('express-openid-connect');

// const config = {
//   authRequired: false,
//   auth0Logout: true,
//   secret: 'a long, randomly-generated string stored in env',
//   baseURL: 'http://localhost:8080',
//   clientID: 'mO36ptiwhdKbodMVZXppjFjzpVZMrT5a',
//   issuerBaseURL: 'https://alors-la.eu.auth0.com'
// };

// auth router attaches /login, /logout, and /callback routes to the baseURL
// app.use(auth(config));

// req.isAuthenticated is provided from the auth router
// const { requiresAuth } = require('express-openid-connect');

// app.get('/', (req, res) => {
//   res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
// });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/Html/Home.html');
})


const mysql = require("mysql");


var con = mysql.createPool({
  host: "sql189.main-hosting.eu",
  user: "u177508093_admin",
  password: "PassDbDashboard1",
  database: "u177508093_Dashboard"
});

var userLogged = ""




app.post('/register', (req, res) => {

  console.log("register");

  userLogged = req.body.email;

  con.query("INSERT INTO users(name,email,password) VALUES('" + req.body.user + "','" + req.body.email + "','" + md5(req.body.password) + "')", function (err, result) {
    if (err) throw err;

    res.send("registered !")

  });

});

app.post('/login', (req, res) => {

  console.log("login");

  userLogged = req.body.email;

  con.query("SELECT * FROM users WHERE password='" + md5(req.body.password) + "' AND email='" + req.body.email + "'", function (err, result) {
    if (err) throw err;

    if (result[0] == null) {
      res.send({msg: "none"})
      console.log("login failed")
      userLogged = ""
    }
    else {
      res.send(JSON.stringify(result[0]))
      console.log('login successfull')
    }
  });

});

app.post('/widget', (req, res) => {
  console.log("edit widget");
  if (req.body.val == "false") {
    con.query("UPDATE users SET " + req.body.widget + " = 0 WHERE email = '" + userLogged + "'", function (err, result) {
      if (err) throw err;
    });  
  } else {
    con.query("UPDATE users SET " + req.body.widget + " = 1 WHERE email = '" + userLogged + "'", function (err, result) {
      if (err) throw err;
    });  
  }
});

app.get('/logout', (req, res) => {
  console.log("logout");
  userLogged = ""
  res.send({msg: "logout"})
});

app.get('/profil', (req, res) => {

  console.log("get data")

  if (userLogged == "")
    res.send("none")
  else {
    con.query("SELECT * FROM users WHERE email='" + userLogged + "'", function (err, result) {
      if (err) throw err;

      if (result == "undefined") res.send("nope")
      else res.send(JSON.stringify(result[0]))
    });
  }
});


// app.get('/profile', requiresAuth(), (req, res) => {
//   res.send(JSON.stringify(req.oidc.user));
// });

app.get('/about.json', (req, res) => {
  let copy = jsonWidget
  copy[" client "][" host "] = req.connection.remoteAddress
  copy[" server "][" current_time "] = Date.now()
  res.send(copy)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
