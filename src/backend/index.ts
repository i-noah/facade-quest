import express from "express";
import path from "path";
import api from "./api";
import bearerToken from "express-bearer-token";
import cros from "cors";
const { PORT = 3012, NODE_ENV } = process.env;

const app = express();
// Middleware that parses json and looks at requests where the Content-Type header matches the type option.
app.use(express.json());
app.use(bearerToken());
app.use(cros());

const frontendDir = path.resolve(__dirname, "..", "frontend");

app.use("/api", api);
// Serve app production bundle
if (NODE_ENV === "production") {
  app.use(express.static(frontendDir));
}

// Handle client routing, return all requests to the app
app.get("/", (_req, res) => {
  if (NODE_ENV === "production") {
    res.sendFile(path.join(frontendDir, "index.html"));
  } else res.send("facade-quest");
});

app.listen(PORT, () => {
  if (NODE_ENV === "production") {
    console.log(`Server listening at http://localhost:${PORT}`);
  } else {
    console.log(`Dev Server listening at http://localhost:3011`);
  }
});
