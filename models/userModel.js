const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Must provide name'],
  },
  email: {
    type: String,
    required: [true, 'Must provide email'],
    unique: [true, 'Email already exist'],
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email format'],
  },
  password: {
    type: String,
    required: [true, 'Must provide password'],
    minlength: 8,
    unique: [true, 'Password already exist'],
    select: false,
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

  passwordConfirm: {
    type: String,
    required: [true, 'Password must be confirmed'],
    validate: {
      //This only works on CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// PRE-SAVE MIDDLEWARE - From lesson 127 - CAUSING PROBLEM if not passing "password" to isModified()
//This fx only runs if password was actually modified
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// ANOTHER PRE-SAVE MIDDLEWARE - From lesson 137 - To save passwordChangedAt in DB
userSchema.pre('save', function (next) {
  if (!this.isModified || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//PRE-FIND MIDDLEWARE
userSchema.pre(/^find/, function (next) {
  //this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

//INSTANCE METHOD to check if password match at login
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
  // if they are the same it returns true
};

//INSTANCE METHOD to check if the password has been changed after 1st issued (JWT timestamp)
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log('This is this.passwordResetToken \n' + this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  console.log('this.passwordResetExpires \n' + this.passwordResetExpires);

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
