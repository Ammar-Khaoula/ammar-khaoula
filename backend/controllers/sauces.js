const sauces = require('../models/Sauce');
const fs = require('fs');


//*************get*********** */
exports.getAllSauces = (req, res, next) => {
  sauces.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

//************************post************* */
function validateSauce(saucesObject) {
  if ((saucesObject.name.trim().length <= 3) ||
    (saucesObject.description.trim().length <= 3) ||
    (saucesObject.mainPepper.trim().length <= 3) ||
    (saucesObject.manufacturer.trim().length <= 3) )
      return false;
  return true;
}
exports.createSauce = (req, res, next) => {
  const saucesObject = JSON.parse(req.body.sauce);
  delete saucesObject._id;
  if (validateSauce(saucesObject)){ 
  const sauce = new sauces({
    //...saucesObject,
    userId :  saucesObject.userId,
    name : saucesObject.name.trim(),
    manufacturer : saucesObject.manufacturer.trim(),
    description :  saucesObject.description.trim(),
    mainPepper :  saucesObject.mainPepper.trim(),
    heat : saucesObject.heat,
    likes: "0",
    dislikes: "0",
    usersLiked: [],
    usersDislikes: [],
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
    .catch(error => res.status(400).json({ error }));
}
else {
  res.statusMessage = "(la sauce n'est pas valide)";
  res.status(400).end();  
}
};
//*************get id*********** */
exports.getoneSauces = (req, res, next) => {
  sauces.findOne({ _id: req.params.id })
    .then(sauces => res.status(200).json(sauces))
    .catch (error => res.status(404).json({ error }));
};
//*****************put************ */
exports.modifySauces = (req, res, next) => {
  
  const saucesObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    if (validateSauce(saucesObject)){
  sauces.updateOne({ _id: req.params.id }, { ...saucesObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
      .catch(error => res.status(400).json({ error }));
  }
  else {
    res.statusMessage = "(la sauce n'est pas valide)";
    res.status(400).end();  
  }
};
//*****************delette********* */
exports.deleteSauces = (req, res, next) => {
  sauces.findOne({ _id: req.params.id })
    .then(sauces => {
      const filename = sauces.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        sauces.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};
//*************like/dislike************ */
exports.likeDislikeSauce = (req, res, next) => {
  const vote = req.body.like;
  switch (vote) {
    //l'utilisateur aime : on ajoute son id au tableau et on incrémente les likes
    case 1:
      sauces.updateOne({ _id: req.params.id }, {
        $inc: { likes: +1 },
        $push: { usersLiked: req.body.userId }
      })
        .then(() => res.status(201).json({ message: "like ajouté" }))
        .catch(error => res.status(500).json({ message: "like erreur :" + error }))
      break;

    //l'utilisateur n'aime pas : on ajoute son id au tableau et on incrémente les likes
    case -1:
      sauces.updateOne({ _id: req.params.id }, {
        $push: { usersDisliked: req.body.userId }, $inc: { dislikes: +1 }
      })
        .then(() => res.status(201).json({ message: "dislike est ajouté" }))
        .catch(error => res.status(500).json({ message: "disliked erreur" + error }))
      break;

    //l'utilisateur annule son choix : on retire l'utilisateur du tableau et on désincrémente les likes ou dislikes suivant le tableau dans lequel il se trouvait
    case 0:
      sauces.findOne({ _id: req.params.id })
        .then(sauce => {
          if (sauce.usersLiked.includes(req.body.userId)) {
            sauces.updateOne({ _id: req.params.id }, {
              $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 }
            })
              .then(() => res.status(201).json({ message: "like a été retiré !" }))
              .catch(error => res.status(500).json({ message: "like a été retiré ! erreur"+error }))
          }
          else {
            sauces.updateOne({ _id: req.params.id }, {
              $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 }
            })
              .then(() => res.status(201).json({ message: "disliked a été retiré !" }))
              .catch(error => res.status(500).json({ message: "disliked a été retiré erreur !"+error }))
          }

        })
        .catch(error => res.status(500).json({ message:"eureur  " +error }))
      break;
          
    default: console.log(req.body)
  }
};