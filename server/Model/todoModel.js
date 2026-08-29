// Define model schema
import mongoose from "mongoose";

// Todo document structure
const todoSchema = new mongoose.Schema({
  todo: {
    type: String,
    required: true,   // <-- FIXED
    unique: true      // Optional: remove if you want duplicate todos
  }
});

// Create collection named 'todos'
const todoCollection = mongoose.model("todos", todoSchema);

export default todoCollection;
