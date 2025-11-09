import express from "express";

const app = express();
const port = parseInt(process.env.PORT || "8000", 10);

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
