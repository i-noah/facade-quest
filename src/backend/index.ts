import express from "express";
import path from "path";
import api from "./api";
import bearerToken from "express-bearer-token";
import cros from "cors";
const { PORT = 3012 } = process.env;

const app = express();
// Middleware that parses json and looks at requests where the Content-Type header matches the type option.
app.use(express.json());
app.use(bearerToken());
app.use(cros());
app.use("/api", api);
// Serve app production bundle
// app.use(express.static("dist/app"));

// Handle client routing, return all requests to the app
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "app/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
