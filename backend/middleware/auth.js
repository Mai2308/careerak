const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next){
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'change-me-dev-secret');
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    req.user = user;
    next();
  }catch(err){
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
