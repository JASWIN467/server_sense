import User from "../Model/User.js";
import bcrypt from "bcryptjs";
import { isDbConnected } from "../DB/db.js";

// In-memory fallback users for when DB is offline
const _memUsers = [
    { _id: "admin_id", username: "admin", email: "admin@serversense.com", role: "admin", createdAt: new Date() },
    { _id: "user_id", username: "user", email: "user@serversense.com", role: "user", createdAt: new Date() }
];

// GET /api/users - List all users
export const getUsers = async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.json(_memUsers);
        }

        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error fetching users" });
    }
};

// PUT /api/users/:id - Update user details or role
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, role, password } = req.body;

        if (!isDbConnected()) {
            const index = _memUsers.findIndex(u => u._id === id);
            if (index === -1) return res.status(404).json({ message: "User not found" });
            if (username) _memUsers[index].username = username;
            if (email) _memUsers[index].email = email;
            if (role) _memUsers[index].role = role;
            return res.json(_memUsers[index]);
        }

        const updateFields = {};
        if (username) updateFields.username = username;
        if (email) updateFields.email = email;
        if (role) updateFields.role = role;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateFields.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Server error updating user" });
    }
};

// DELETE /api/users/:id - Delete a user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isDbConnected()) {
            const index = _memUsers.findIndex(u => u._id === id);
            if (index === -1) return res.status(404).json({ message: "User not found" });
            _memUsers.splice(index, 1);
            return res.json({ message: "User deleted successfully" });
        }

        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Server error deleting user" });
    }
};
