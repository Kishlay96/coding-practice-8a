const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeServer = async () => {
  try {
    db = open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error is ${message.error}`);
    process.exit(1);
  }
};
initializeServer();

const checkStatusandPriority = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};

const checkStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const checkPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodoQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case checkStatusandPriority(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
            AND status = '${status}' AND priority = '${priority}';`;
      break;
    case checkStatus(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
            AND status = '${status}';`;
      break;
    case checkPriority(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' 
            AND priority = '${priority}'`;
      break;
    default:
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
  }
  data = await db.all(getTodoQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQueryId = `SELECT * FROM todo WHERE id = ${todoId};`;
  const todoArray = await db.get(getTodoQueryId);
  response.send(todoArray);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const makeTodoQuery = `INSERT INTO todo(id,todo,priority,status)
    VALUES(${id}, '${todo}','${priority}','${status}';`;
  await db.run(makeTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestbody = request.body;
  switch (true) {
    case requestbody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestbody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestbody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const previousTodo = await db.get(previousQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;
  const updateQuery = `UPDATE todo SET 
    todo = '${todo}' ,priority = '${priority}',status = '${status}'
    WHERE id = ${todoId};`;
  await db.run(updateQuery);
  response.send(`${updatedColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
  DELETE FROM 
    todo
  WHERE 
    id = ${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
