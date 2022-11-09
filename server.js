const express = require("express");
const path = require("path");
const fs = require("fs");
const util = require("util");

const readFromFile = util.promisify(fs.readFile);
const { v4: uuidv4 } = require("uuid");

// Helper method for generating unique ids
// const uuid = require("./helpers/uuid");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public/index.html"))
);

app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "public/notes.html"))
);
// app.get("/api/notes", (req, res) => res.send("Hello now on api/notes"));

// Reads db.json file and returns as JSON object
app.get("/api/notes", (req, res) =>
  readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)))
);

// const readAndAppend = (content, file) => {
//   fs.readFile(file, "utf8", (err, data) => {
//     if (err) {
//       console.error(err);
//     } else {
//       const parsedData = JSON.parse(data);
//       parsedData.push(content);
//       writeToFile(file, parsedData);
//     }
//   });
// };

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

    // obtain existing notes
    fs.readFile("./db/db.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
      } else {
        // converts string into JSON object
        const parsedNotes = JSON.parse(data);

        // Add a new review
        parsedNotes.push(newNote);

        // write updated note back to file
        fs.writeFile("./db/db.json", JSON.stringify(parsedNotes), (writeErr) =>
          writeErr
            ? console.error(writeErr)
            : console.info("Succesfully updated notes!")
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

// const writeToFile = (destination, content) =>
//   fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
//     err ? console.error(err) : console.info(`\nData written to ${destination}`)
//   );

// app.delete("/api/notes/:id", (req, res) => {
//   const noteID = req.params.note_id;
//   readFromFile("./db/db.json")
//     .then((data) => JSON.parse(data))
//     .then((json) => {
//       // Make a new array of all tips except the one with the ID provided in the URL
//       const result = json.filter((note) => note.note_id !== noteID);
//       console.log(result);
//       // Save that array to the filesystem
//       writeToFile("./db/db.json", result);

//       // Respond to the DELETE request
//       res.json(`Item ${noteID} has been deleted 🗑️`);
//     });
// });

app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "public/index.html"))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
