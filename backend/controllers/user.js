const bcrypt = require('bcrypt'); //cryptage de données grâce au package bcrypt
const jwt = require('jsonwebtoken');//crée le token et le verifier
const User = require('../models/user');
const maskData = require('maskdata');//masquer l'email

//****************create mode pass valid****** */
var passwordValidator = require('password-validator');
// Create a schema
var schema = new passwordValidator();
// Add properties to it
schema
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(2)                                // Must have at least 2 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values
// Validate against a password string
console.log(schema.validate('validPASS123'));
// => true
console.log(schema.validate('invalidPASS'));
// => false
// Get a full list of rules which failed
console.log(schema.validate('joke', { list: true }));
// => [ 'min', 'uppercase', 'digits' ]


//***********************singnup***************/
exports.signup = (req, res, next) => {

  if (schema.validate(req.body.password)) {
    console.log('ok');
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: maskData.maskEmail2(req.body.email),   //maskage du mail
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  } else {
  res.statusMessage = "(Minimum 8 caractères: 1 minuscule, 1 majuscule et 2 chiffre)";
  res.status(400).end();  
    } 
   };
  

//**********************login*****************/
exports.login = (req, res, next) => {
    User.findOne({ email: maskData.maskEmail2(req.body.email), })  //maskage du mail
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
        bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            if (!valid) {
              return res.status(401).json({ error: 'Mot de passe incorrect !' });
            }
            res.status(200).json({
              userId: user._id,
//identification par token pour que utilisateur ne se connecte qu'une seue fois
              token: jwt.sign(
                { userId: user._id },
                'RANDOM_TOKEN_SECRET',//clé secret
                { expiresIn: '24h' }//chaque token durée 24h
              )
            });
          })
          .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };