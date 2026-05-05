import User from "../Model/userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/SendEmail.js";
import crypto from "crypto";


// register
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ message: "User created successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error in registration" });
    }
};


// login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error in login" });
    }
};


// forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always return same response (security)
    if (!user) {
      return res.status(200).json({
        message: "If the email exists, a reset link has been sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetTokenExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `https://ai-job-intel-frontend.vercel.app/reset-password/${resetToken}`;

    const htmlContent = `...same HTML...`;

    await sendEmail(user.email, "Reset Your Password", htmlContent);

    return res.status(200).json({
      message: "If the email exists, a reset link has been sent",
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: "Error sending reset email",
    });
  }
};


// reset password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset link"
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpire = null;

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully"
    });

  } catch (error) {
    return res.status(500).json({ message: "Error resetting password" });
  }
};