const express = require('express');
const router = express.Router();


const saucesCtrl = require('../controllers/sauces');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');


router.get('/', auth, multer, saucesCtrl.getAllSauces);
router.post('/', auth, multer, saucesCtrl.createSauce);
router.get('/:id', auth, multer, saucesCtrl.getoneSauces);
router.put('/:id', auth, multer, saucesCtrl.modifySauces);
router.delete('/:id', auth, multer, saucesCtrl.deleteSauces);
router.post('/:id/like', auth, multer, saucesCtrl.likeDislikeSauce);



module.exports = router;