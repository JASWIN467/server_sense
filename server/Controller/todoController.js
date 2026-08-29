import todoCollection from "../Model/todoModel.js";

// ====================== ADD TODO ======================
export const addTodo = async (req, res) => {
  try {
    const { todo } = req.body;

    // VALIDATION: Check empty or missing todo
    if (!todo || todo.trim() === "") {
      return res.status(400).json({ mess: "Todo cannot be empty." });
    }

    // Save todo
    const data = new todoCollection({ todo: todo.trim() });
    await data.save();

    res.status(201).json({ mess: "Todo has been stored" });

  } catch (err) {
    // DUPLICATE ERROR (unique index)
    if (err.code === 11000) {
      return res.status(400).json({
        mess: "Todo already exists. Please use a different text.",
      });
    }

    // OTHER ERRORS
    res.status(500).json({ mess: err.message });
  }
};


// ====================== GET ALL TODOS ======================
export const getTodo = async (req, res) => {
  try {
    const data = await todoCollection.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ====================== UPDATE TODO ======================
export const updateTodo = async (req, res) => {
  try {
    const data = await todoCollection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!data) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// ====================== DELETE TODO ======================
export const deleteTodo = async (req, res) => {
  try {
    const data = await todoCollection.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({ message: "Todo has been deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
