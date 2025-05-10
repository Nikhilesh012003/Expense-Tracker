const User = require("../models/User");

const jwt = require("jsonwebtoken");

// GENERATE JWT TOKEN
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const { fullname, email, password, profileImageUrl } = req.body;

    //Validation: Check for missing Field
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are Required" });
    }

    //Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email Already Exists" });
    }
    // Create thr User
    const user = await User.create({
      fullname,
      email,
      password,
      profileImageUrl,
    });
    res.status(201).json({
      id: user._id,
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
};

// Login  User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All Fields are Required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid Credential" });
    }
    res
      .status(200)
      .json({ id: user._id, user, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: "Error Login user", error: err.message });
  }
};

// getUserInfo controller function - handles the request to fetch user details
exports.getUserInfo = async (req, res) => {
  try {
    // Fetch the user from the database using the ID stored in the authenticated request (req.user.id)
    // `.select("-password")` excludes the password field from the result
    const user = await User.findById(req.user.id).select("-password");

    // If the user is not found in the database, return a 400 Bad Request response with a message
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // If user is found, return the user data (without the password) with a 200 OK response
    res.status(200).json(user);
  } catch (err) {
    // If an error occurs during the process (e.g., database error), return a 500 Internal Server Error
    res
      .status(500)
      .json({ message: "Error in get user Info", error: err.message });
  }
};
