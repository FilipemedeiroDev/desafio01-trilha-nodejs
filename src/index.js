const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" })
  };

  request.user = user;

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usersAlreadyExists = users.some((user) => user.username === username);

  if (usersAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" })
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  const userCreated = users.find((user) => user.username === username);

  return response.status(201).send(userCreated);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "No task was found with the given id!" })
  }

  todo.deadline = new Date(deadline);
  todo.title = title;

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "No task was found with the given id!" })
  }

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "No task was found with the given id!" })
  }

  const filteredTodos = user.todos.filter((todo) => todo.id !== id)

  user.todos = filteredTodos;

  return response.status(204).send();
});

module.exports = app;