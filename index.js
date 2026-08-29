const express = require("express");
const swaggerUI = require("swagger-ui-express");
const openapi = require("./openapi.json");

const app = express();
const port = 3000;

app.use(express.json());
app.use("/docs", swaggerUI.serve, swaggerUI.setup(openapi));

const tasks = [
    { id: 1, title: "Buy groceries", done: false},
    { id: 2, title: "Walk the dog", done: true},
    { id: 3, title: "Read a book", done: false}
];

app.get("/", (req,res) =>{
    res.json({
        name: "Task API",
        version: "1.0",
        endpoints: ["/tasks"]
    });
});

app.get("/health", (req,res) =>{
    res.json({
        status:"ok"
    });
});

app.get("/tasks", (req,  res) =>{
    res.json(tasks);
});

app.get("/tasks/:id", (req, res) =>{
    const id = Number(req.params.id);
    const task = tasks.find((task) => task.id === id);

    if (!task){
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

    res.json(task);
});

app.post("/tasks", (req, res) => {
    const{ title} = req.body;

    if (title == undefined || title == null || String(title).trim() === ""){
        return res.status(400).json({
            error: "Title is required and cannot be empty"
        });
    }

    const nextId = tasks.length === 0
    ? 1
    : Math.max(...tasks.map((task) => task.id)) + 1;

    const newTask = {
        id: nextId,
        title: String(title).trim(),
        done: false
    };

    tasks.push(newTask);
    res.status(201).json(newTask);

});

app.put("/tasks/:id", (req,res) => {
    const id = Number(req.params.id);
    const task = tasks.find((task) => task.id === id);

    if (!task) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

     const { title, done } = req.body;

    if (title === undefined && done === undefined) {
        return res.status(400).json({
            error: "Request must include title and/or done"
        });
    }

    if (title !== undefined) {
        if (typeof title !== "string" || title.trim() === "") {
            return res.status(400).json({
                error: "Title cannot be empty"
            });
        }

        task.title = title.trim();
    }

    if (done !== undefined) {
        if (typeof done !== "boolean") {
            return res.status(400).json({
                error: "Done must be true or false"
            });
        }

        task.done = done;
    }

    res.status(200).json(task);
});

app.delete("/tasks/:id", (req, res) => {
    const id = Number(req.params.id);
    const taskIndex = tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

    tasks.splice(taskIndex, 1);
    res.status(204).send();
});



app.listen(port, ()=>{
    console.log("Server runnin at http://localhost:${port}");
});