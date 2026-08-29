import { addTodo, getTodo, updateTodo,deleteTodo } from "../Controller/todoController.js";

import express from 'express'

const route = express.Router()

route.post('/addtodo', addTodo);
route.get('/gettodo',getTodo);
route.put('/updatetodo',updateTodo);
route.delete('/deletetodo',deleteTodo);


export default route



