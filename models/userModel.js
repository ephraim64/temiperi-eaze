import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
   name: {tyep: String},
   email: {type: String},
   password: {tyep: String}
})

const userModel = mongoose.model.user || mongoose.model('user', userSchema);

export default userModel;