const mysql = require("mysql");

// First you need to create a connection to the database
// Be sure to replace 'user' and 'password' with the correct values
const con = mysql.createConnection({
  host: "localhost",
  user: "kt",
  password: "kt123456",
  database: "kokeiluja",
  multipleStatements: true, //out parametria varten aliohjelmassa
});

con.connect((err) => {
  if (err) {
    console.log("Error connecting to Db");
    throw err;
  }
  console.log("Connection established");
});


const express = require("express");
//const bodyParser = require("body-parser");
/* const app = express().use(bodyParser.json()); //vanha tapa - ei enää voimassa. 
kts. https://devdocs.io/express/ -> req.body*/
var app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));


/*CORS isn’t enabled on the server, this is due to security reasons by default,
so no one else but the webserver itself can make requests to the server.*/
// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "*");
  
    // Request methods you wish to allow
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
  
    // Request headers you wish to allow
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token"
    );
  
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true);
  
    res.setHeader("Content-type", "application/json");
  
    // Pass to next layer of middleware
    next();
});

app.get("/urheilijat/kaikki", (req, res) => {
  con.query("SELECT * FROM urheilijat", (err, rows) => {
    if (err) {
      res.json({"tila":"haku epäonnistui"});
      throw err;
    }

    let palautettava = []
    rows.forEach( row => {
      palautettava.push(row);
    });
    res.json(palautettava);
  })
})

// Haku kentillä
app.get("/urheilijat/:nimi/:sukunimi/:kutsumanimi/:syntymavuosi/:laji/:paino", (req, res) => {
  const inParams = [
    req.params.nimi, 
    req.params.sukunimi, 
    req.params.kutsumanimi, 
    req.params.syntymavuosi, 
    req.params.laji, 
    req.params.paino
  ]

  con.query("SELECT * FROM urheilijat WHERE nimi = ? OR sukunimi = ? OR kutsumanimi = ? OR syntymavuosi = ? OR laji = ? OR paino = ?", inParams, (err, rows) => {
    if (err) {
      res.json({"tila":"virhe. tietojen haku epäonnistui"})
      throw err;
    }

    let palautettava = [];
    palautettava.push({"tila":"haku onnistui"});
    rows.forEach( row => {
      palautettava.push(row);
    });
    res.json(palautettava);
  });
});

// Urheilijan lisääminen
app.post("/urheilijat", (req, res) => {

  const params = [
    req.body.nimi, 
    req.body.sukunimi, 
    req.body.kutsumanimi, 
    req.body.syntymavuosi + '-01-01', 
    req.body.laji, 
    req.body.paino,
    req.body.saavutukset,
    req.body.kuva
  ]

  con.query("INSERT INTO urheilijat (nimi, sukunimi, kutsumanimi, syntymavuosi, laji, paino, saavutukset, kuva) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", params, (err, rows) => {
        if (err) {
          res.json({"tila":"virhe. tietoja ei lisätty"})
          throw err;
        }
  });

  res.json({"tila":"urheilijan tiedot lisatty"});
});

// Urheilijan tietojen poisto ID:llä
app.delete("/urheilijat/:id", (req, res) => {

  con.query("DELETE FROM urheilijat WHERE id = ?", String(req.params.id), (err, rows) => {
    if (err) {
      res.json({"tila":"virhe. urheilijan tietojen poisto epäonnistui"});
      throw err;
    }
  });

  res.json({"tila": "urheilijan tiedot poistettu"});
});

// Urheilijan tietojen päivittäminen 
app.put("/urheilijat", (req, res) => {

  const inParams = [
    req.body.paino,
    req.body.saavutukset,
    req.body.kuva,
    req.body.id
  ]

  con.query("UPDATE urheilijat SET paino = ?, saavutukset = ?, kuva = ? WHERE id = ?", inParams, (err, rows) => {
    if (err) {
      res.json({"tila":"virhe. tietojen päivittäminen epäonnistui"});
      throw err;
    }
    res.json({"tila":"urheilijan tiedot päivitetty"});
  });
});

app.listen(3030, () => {
    console.log("Listening at port 3030");
});