import { ThemeProvider } from "@emotion/react";
import { createTheme, CssBaseline } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import { AuthProvider, RequireAuth } from "./components/AuthProvider";
import { Signin } from "./pages/Signin";
import { HomePage } from "./pages/Home";
import { QuestPage } from "./pages/Quest";

function App() {
  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <div className="App">
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <HomePage />
                </RequireAuth>
              }
            />
            <Route
              path="/quest/:group/:cnt"
              element={
                <RequireAuth>
                  <QuestPage />
                </RequireAuth>
              }
            />
            <Route path="/signin" element={<Signin />} />
          </Routes>
        </AuthProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;
