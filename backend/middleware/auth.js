const jwt = require('jsonwebtoken');


module.exports = (req, res, next) => {
    try {
      //recuperer le token dans le header
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId; //recuperer le userId
  //verifier que le userId et corespond a celle de token
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Invalid user ID';
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};