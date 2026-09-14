import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  company: { type: String },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['customer', 'admin'], 
    default: 'customer' 
  },
  createdAt: { type: Date, default: Date.now }
});

// Prevent Mongoose from recompiling the model upon hot reloads
export default mongoose.models.User || mongoose.model('User', UserSchema);