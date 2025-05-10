const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const UserSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash Password before saving
UserSchema.pre("save", async function (next) {
  // If the password field has not been modified, skip hashing
  if (!this.isModified("password")) return next();

  // Hash the password using bcrypt with a salt round of 10
  this.password = await bcrypt.hash(this.password, 10);

  // Proceed to the next middleware or save function
  next();
});

// Compare Password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  // Compares the entered password with the hashed password stored in the database
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
