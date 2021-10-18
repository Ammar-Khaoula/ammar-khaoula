const express = require('express');
const mg = require('mongoose');

//body-parser:tronsforme le corp de la requette en JSON (objet js utilisable)
const bodyParser = require('body-parser');
//const sauce = require('./models/Sauce');
//const Utilisateur = require('./models/user');
const userRoutes = require('./routes/user');
const saucesRoutes = require('./routes/sauces');
const path = require('path');

//pour resoudre un error CROSS par le frontend
const cors = require('cors');
const helmet = require("helmet");


// const dbURI = 'mongodb+srv://steve:test1234@testoc.jbsbe.mongodb.net/test?retryWrites=true&w=majority'
const dbURI ='mongodb+srv://steve:steve@cluster0.8ersf.mongodb.net/Sauce-piquante?retryWrites=true&w=majority'
mg.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log('connecté à la base de données'))
  .catch((err) => console.log(err));

const app = express();
app.use(helmet());
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


app.use(bodyParser.json()); 
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', saucesRoutes);

module.exports = app;