const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { email, password, accountType } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists." });

    if (password.length < 7) return res.status(400).json({ message: "Password must be at least 7 characters." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ ...req.body, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "Signup successful!" });
  } catch (err) {
    res.status(500).json({ message: "Signup error", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    // Check password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        accountType: user.accountType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Convert mongoose doc to plain object
    const userObj = user.toObject();

    // Send all relevant fields back
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: userObj._id,
        fullName: userObj.fullName,
        email: userObj.email,
        accountType: userObj.accountType,
        username: userObj.username,
        skills: userObj.skills,
        experienceLevel: userObj.experienceLevel,
        bio: userObj.bio,
        portfolioUrl: userObj.portfolioUrl,
        hourlyRate: userObj.hourlyRate,
        company: userObj.company,
        projectDescription: userObj.projectDescription,
        budget: userObj.budget,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

