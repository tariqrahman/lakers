import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Container, Box } from "@mui/material";
import { getAllTeams } from "./services/api";

import logo from "../public/logo.png";
import TeamProfile from "./components/TeamProfile";
import TradeTool from "./components/TradeTool/tradeTool";

// Lakers purple from teamColors.jsx
const lakersPurple = "#552583";

const Home = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeams = async () => {
    const data = await getAllTeams();
    setTeams(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
  }, []);
  return (
    <Container sx={{ mt: 4 }}>
      <TradeTool teams={teams} />
    </Container>
  );
};

function App() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeams = async () => {
    const data = await getAllTeams();
    setTeams(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <Router>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          width: "100vw",
        }}
      >
        <AppBar
          position="sticky"
          sx={{
            width: "100vw",
            top: 0,
            zIndex: 1100,
            left: 0,
            right: 0,
            backgroundColor: "#808080",
          }}
        >
          <Toolbar sx={{ width: "100%", maxWidth: "100%", px: 2 }}>
            <img
              src={logo}
              alt="Logo"
              style={{ height: 30, display: "block", marginRight: "16px" }}
            />
            <Typography
              variant="h6"
              component={Link}
              to="/tradeTool"
              style={{
                textDecoration: "none",
                color: "white",
                fontWeight: "bold",
              }}
            >
              Trade Center
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, width: "100%", backgroundColor: "white" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/team/:teamName" element={<TeamProfile />} />
            <Route path="/tradeTool" element={<TradeTool teams={teams} />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
