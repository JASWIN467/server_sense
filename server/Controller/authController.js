import User from "../Model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isDbConnected } from "../DB/db.js";

// In-memory fallback users for when DB is offline
const _memUsers = [
    { _id: "admin_id", username: "admin", rawPassword: "admin", role: "admin" },
    { _id: "user_id", username: "user", rawPassword: "user", role: "user" }
];

// Register User
export const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!isDbConnected()) {
            _memUsers.push({
                _id: Date.now().toString(),
                username,
                rawPassword: password,
                role: role || 'user'
            });
            return res.status(201).json({ message: "User registered successfully (in memory)" });
        }

        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'user' // Use provided role or default
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Login User
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!isDbConnected()) {
            const user = _memUsers.find(u => u.username === username);
            if (!user || user.rawPassword !== password) {
                return res.status(400).json({ message: "Invalid credentials (memory)" });
            }

            const secret = process.env.JWT_SECRET || "fallback_secret";
            const token = jwt.sign(
                { id: user._id, role: user.role, username: user.username },
                secret,
                { expiresIn: "1d" }
            );

            return res.json({
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role
                }
            });
        }

        // Check user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Create Token
        const secret = process.env.JWT_SECRET || "fallback_secret";
        const token = jwt.sign(
            { id: user._id, role: user.role, username: user.username },
            secret,
            { expiresIn: "1d" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Seed Admin + Default User
export const seedAdmin = async () => {
    if (!isDbConnected()) {
        console.log("Account seed skipped (DB offline)");
        return;
    }

    try {
        // Seed admin
        const adminExists = await User.findOne({ username: "admin" });
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("admin", salt);

            await new User({
                username: "admin",
                email: "admin@serversense.com",
                password: hashedPassword,
                role: "admin"
            }).save();
            console.log("✅ Admin account created: admin / admin");
        } else {
            console.log("Admin account already exists");
        }

        // Seed default user
        const userExists = await User.findOne({ username: "user" });
        if (!userExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("user", salt);

            await new User({
                username: "user",
                email: "user@serversense.com",
                password: hashedPassword,
                role: "user"
            }).save();
            console.log("✅ User account created: user / user");
        } else {
            console.log("User account already exists");
        }

    } catch (error) {
        console.error("Error seeding accounts:", error);
    }
};
