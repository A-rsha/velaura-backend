
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/User');
const EmailOTP = require('../models/EmailOTP');
const transporter = require('../config/email');



exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        await newUser.save();

        return res.status(201).json({
            success: true,
            message: "User created successfully"
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// ========================================
// LOGIN - VERIFY PASSWORD AND SEND OTP
// ========================================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find registered user
        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Verify password
        const isPasswordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 1000000).toString();

        // Hash OTP before storing
        const otpHash = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

        // Remove previous OTP for this email
        await EmailOTP.deleteMany({
            email: normalizedEmail
        });

        // Save OTP with 5-minute expiry
        await EmailOTP.create({
            email: normalizedEmail,
            otpHash,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            attempts: 0
        });

        // Send OTP email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: normalizedEmail,
            subject: "VELAURA Login Verification OTP",
            text: `Your VELAURA login OTP is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`
        });

        // Do not issue tokens before OTP verification
        return res.status(200).json({
            success: true,
            requiresOTP: true,
            message: "OTP sent to your registered email"
        });

    } catch (error) {
        console.error("LOGIN OTP ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to send OTP. Please check the email configuration and try again."
        });
    }
};


// ========================================
// VERIFY LOGIN OTP AND COMPLETE LOGIN
// ========================================
exports.verifyLoginOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp || !/^\d{6}$/.test(String(otp))) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid 6-digit OTP"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification request"
            });
        }

        const otpRecord = await EmailOTP.findOne({
            email: normalizedEmail
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "OTP not found. Please login again."
            });
        }

        // Check expiry
        if (otpRecord.expiresAt.getTime() <= Date.now()) {
            await EmailOTP.deleteMany({
                email: normalizedEmail
            });

            return res.status(400).json({
                success: false,
                message: "OTP expired. Please login again."
            });
        }

        // Limit incorrect attempts
        if (otpRecord.attempts >= 5) {
            await EmailOTP.deleteMany({
                email: normalizedEmail
            });

            return res.status(429).json({
                success: false,
                message: "Too many incorrect attempts. Please login again."
            });
        }

        // Hash entered OTP
        const enteredOtpHash = crypto
            .createHash('sha256')
            .update(String(otp))
            .digest('hex');

        // Compare OTP
        if (enteredOtpHash !== otpRecord.otpHash) {
            otpRecord.attempts += 1;
            await otpRecord.save();

            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please try again."
            });
        }

        // OTP is correct; remove it
        await EmailOTP.deleteMany({
            email: normalizedEmail
        });

        // Generate access token
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // Generate refresh token
        const refreshToken = jwt.sign(
            {
                userId: user.id
            },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: "7d"
            }
        );

        user.refreshToken = refreshToken;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("VERIFY LOGIN OTP ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to verify OTP. Please try again."
        });
    }
};


// ========================================
// GET USER PROFILE
// ========================================
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error("GET PROFILE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// ========================================
// REFRESH ACCESS TOKEN
// ========================================
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required"
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(decoded.userId);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        const newAccessToken = jwt.sign(
            {
                userId: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            success: true,
            token: newAccessToken
        });

    } catch (error) {
        console.error("REFRESH TOKEN ERROR:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token"
        });
    }
};


// ========================================
// SEND REGISTRATION OTP
// ========================================
exports.sendRegistrationOTP = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();

        const otpHash = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

        await EmailOTP.deleteMany({
            email: normalizedEmail
        });

        await EmailOTP.create({
            email: normalizedEmail,
            otpHash,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            attempts: 0
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: normalizedEmail,
            subject: "Verify Your VELAURA Account",
            text: `Your VELAURA verification OTP is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`
        });

        return res.status(200).json({
            success: true,
            message: "OTP sent to your email"
        });

    } catch (error) {
        console.error("SEND REGISTRATION OTP ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to send OTP. Please try again."
        });
    }
};


// ========================================
// VERIFY REGISTRATION OTP AND CREATE USER
// ========================================
exports.verifyRegistrationOTP = async (req, res) => {
    try {
        const { name, email, password, otp } = req.body;

        if (!name || !email || !password || !otp) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const otpRecord = await EmailOTP.findOne({
            email: normalizedEmail
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "OTP not found. Please request a new OTP."
            });
        }

        if (otpRecord.expiresAt.getTime() <= Date.now()) {
            await EmailOTP.deleteMany({
                email: normalizedEmail
            });

            return res.status(400).json({
                success: false,
                message: "OTP expired. Please request a new OTP."
            });
        }

        if (otpRecord.attempts >= 5) {
            await EmailOTP.deleteMany({
                email: normalizedEmail
            });

            return res.status(429).json({
                success: false,
                message: "Too many incorrect attempts. Please request a new OTP."
            });
        }

        const enteredOtpHash = crypto
            .createHash('sha256')
            .update(String(otp))
            .digest('hex');

        if (enteredOtpHash !== otpRecord.otpHash) {
            otpRecord.attempts += 1;
            await otpRecord.save();

            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please try again."
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            await EmailOTP.deleteMany({
                email: normalizedEmail
            });

            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        await newUser.save();

        await EmailOTP.deleteMany({
            email: normalizedEmail
        });

        return res.status(201).json({
            success: true,
            message: "Email verified and account created successfully"
        });

    } catch (error) {
        console.error("VERIFY REGISTRATION OTP ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to verify OTP. Please try again."
        });
    }
};
