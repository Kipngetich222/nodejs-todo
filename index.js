// Dependencies required for the app
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

// Placeholders for added task
let task = ["buy socks", "practise with nodejs"];
// Placeholders for removed task
let complete = ["finish jquery"];

// Post route for adding new task
app.post("/addtask", (req, res) => {
    const newTask = req.body.newtask;
    task.push(newTask);
    res.redirect("/");
});

// Post route for removing completed task
app.post("/removetask", (req, res) => {
    const completeTask = req.body.check;
    if (typeof completeTask === "string") {
        complete.push(completeTask);
        task.splice(task.indexOf(completeTask), 1);
    } else if (typeof completeTask === "object") {
        for (let i = 0; i < completeTask.length; i++) {
            complete.push(completeTask[i]);
            task.splice(task.indexOf(completeTask[i]), 1);
        }
    }
    res.redirect("/");
});

// Post route for deleting selected completed tasks
app.post("/deletecomplete", (req, res) => {
    const deleteIndexes = req.body.deleteCheck;
    if (typeof deleteIndexes === "string") {
        complete.splice(deleteIndexes, 1);
    } else if (Array.isArray(deleteIndexes)) {
        deleteIndexes.forEach(index => {
            complete.splice(index, 1);
        });
    }
    res.redirect("/");
});

// Render the ejs and display added task, completed task
app.get("/", (req, res) => {
    res.render("index", { task: task, complete: complete });
});

// Set app to listen on port 3000
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
