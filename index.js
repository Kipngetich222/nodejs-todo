const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Define formatTime function
function formatTime(time) {
    const date = new Date(time);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

// Placeholder for added tasks
let tasks = [];

// Socket.IO logic for real-time notifications
io.on("connection", socket => {
    console.log("A client connected");

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("A client disconnected");
    });
});

// Post route for adding new task
app.post("/addtask", (req, res) => {
    // Extract task details from request body
    const newTask = req.body.newtask;
    const startTime = new Date(req.body.starttime);
    const endTime = new Date(req.body.endtime);

    // Check for valid start time
    if (isNaN(startTime.getTime())) {
        return res.status(400).send("Invalid start time format for task: " + newTask);
    }

    // Create a new task object
    const task = {
        name: newTask,
        startTime: startTime,
        endTime: endTime,
        due: false // Assuming the task is not initially due
    };

    // Add the task to the tasks array
    tasks.push(task);

    // Emit a socket event to notify clients about the new task
    io.emit('newTaskAdded', task);

    // Redirect to the home page
    res.redirect("/");
});

// Post route for clearing completed tasks
app.post("/clearcompleted", (req, res) => {
    tasks = tasks.filter(task => !task.due);
    res.redirect("/");
});

// Post route for removing selected tasks
app.post("/deleteselected", (req, res) => {
    const selectedTasks = req.body.check;
    if (typeof selectedTasks === "string") {
        tasks = tasks.filter(task => task.name !== selectedTasks);
    } else if (Array.isArray(selectedTasks)) {
        tasks = tasks.filter(task => !selectedTasks.includes(task.name));
    }
    res.redirect("/");
});

// Render the ejs and display added task, completed task
app.get("/", (req, res) => {
    const completedTasks = tasks.filter(task => task.due);
    const incompleteTasks = tasks.filter(task => !task.due);
    res.render("index", { completedTasks: completedTasks, incompleteTasks: incompleteTasks, formatTime: formatTime });
});

// Set app to listen on port 3000
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
