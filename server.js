const express = require("express");
const path = require("path");
const fs = require("fs");
const util = require("util");
const { v4: uuidv4 } = require("uuid");

const readFromFile = util.promisify(fs.readFile);

const PORT = process.env.PORT || 3001;

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Homepage
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public/index.html"))
);

// Notes page
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "public/notes.html"))
);

// Reads db.json file and returns as JSON object
app.get("/api/notes", (req, res) =>
  readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)))
);

// API post request for adding a new note
app.post("/api/notes", (req, res) => {
  console.log(req.body);

  console.info(`${req.method} request received to add a new task`);

  const { title, text } = req.body;

  if (req.body) {
    const newNote = {
      title,
      text,
      id: uuidv4(),
    };

    // Retrieve existing notes
    fs.readFile("./db/db.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
      } else {
        // converts string data to JSON
        const parsedNotes = JSON.parse(data);

        // Adds new note
        parsedNotes.push(newNote);

        // Adds updated notes back to db file
        fs.writeFile("./db/db.json", JSON.stringify(parsedNotes), (writeErr) =>
          writeErr
            ? console.error(writeErr)
            : console.info("Succesfully added note!")
        );
      }
    });

    const response = {
      status: "success",
      body: newNote,
    };

    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json("Error in posting note");
  }
});

// Helper code to delete notes
const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content), (err) =>
    err ? console.error(err) : console.info(`\Successfully deleted note!`)
  );

// API delete request for notes
app.delete("/api/notes/:id", (req, res) => {
  const noteID = req.params.id;
  readFromFile("./db/db.json")
    .then((data) => JSON.parse(data))
    .then((json) => {
      // Filters through the notes and makes a new array of all notes except the one with the selected ID
      const result = json.filter((note) => note.id !== noteID);
      console.log(result);
      // Saves new array to the db file
      writeToFile("./db/db.json", result);

      // Responds to the delete request
      res.json(`Note ID ${noteID} has been deleted`);
    });
});

// Wildcard route
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "public/index.html"))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
