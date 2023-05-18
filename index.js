const express = require("express");
const cors = require("cors");

const app = express();

// middleware
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server side home route");
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server run on port ${port}...`);
});
