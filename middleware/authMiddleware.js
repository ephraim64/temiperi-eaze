import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'; // Adjust the path if needed

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT secret

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password'); // Exclude password

      next(); // Call the next middleware
    } catch (error) {
    //   console.error(error);
    //   res.status(401).send({ message: 'Not authorized, token failed' });
      next();
    }
  }

  if (!token) {
    res.status(401).send({ message: 'Not authorized, no token' });
  }
};

export { protect };