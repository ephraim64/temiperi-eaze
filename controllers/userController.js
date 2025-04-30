import userModel from "../models/userModel.js";
import validator from 'validator'


//login user 
export const loginUser = async (req, res) => {
   const {email, password} = req.body;

   try {
      const user = await userModel.findOne({email});

      if(!user){
         return res.status(404).json({success: false, message: 'User does not exist'})
      }
      
      if(user){
         return res.status(200).json({success: true, message: `welcome back`})
      }

   } catch (error) {
      console.log(error)
      res.status(500).json({success: false, message: 'Error'})
   }
}

// register user
export const registerUser = async (req, res) => {
   const {name, password, email} = req.body;

   try {
      //checking if user already exist
      const exists = await userModel.findOne({email});
      if(exists){
         return res.status(404).json({success: false, message: 'User already exist'})
      }

      //email format validation and strong password 
      if(!validator.isEmail(email)){
         return res.status(404).json({success: false, message: 'Please enter a valid email'})
      }

      if(password.length < 8){
         return res.status(404).json({success: false, message: 'please enter a strong password'})
      }

      //creating a new user
      const newUser = new userModel({
         name: name,
         email: email,
         password: password
      });

      //saving user in database
      const user = await newUser.save()
      return res.status(201).json({success: true, user})
   } catch (error) {
      console.log(error);
      return res.status(500).json({success: false, message: 'Error'})
   }
}