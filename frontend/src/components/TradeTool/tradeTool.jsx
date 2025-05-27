import { useState, useEffect } from "react";
import { Box, Button, Typography, IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import { getAllTeamsPicks } from "../../services/api";
import TTViewTrades from "./TTViewTrades/ttViewTrades";
import TTNewTrade from "./TTNewTrade/ttNewTrade";
import useMediaQuery from "@mui/material/useMediaQuery";

const TradeTool = (props) => {
  const [teamAssets, setTeamAssets] = useState([]);
  const [isViewMode, setIsViewMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tradesRefreshKey, setTradesRefreshKey] = useState(0);
  const isSmallScreen = useMediaQuery("(max-width: 500px)");

  const fetchTeamAssets = async () => {
    try {
      const data = await getAllTeamsPicks();
      setTeamAssets(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load team assets");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamAssets();
  }, []);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleTradeSaved = () => {
    setIsViewMode(true);
    setTradesRefreshKey((k) => k + 1);
  };

  return (
    <Box
      sx={{ width: "100%", height: "calc(100vh - 64px)", overflowY: "auto" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 7,
          pt: 6,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "black" }}>
          {isViewMode ? "All Trades" : "Create Trade"}
        </Typography>
        {isSmallScreen ? (
          <IconButton
            color="primary"
            onClick={() => setIsViewMode((prev) => !prev)}
          >
            {isViewMode ? (
              <VisibilityIcon sx={{ fontSize: 24 }} />
            ) : (
              <AddIcon sx={{ fontSize: 24 }} />
            )}
          </IconButton>
        ) : (
          <Button
            variant="contained"
            sx={{
              "backgroundColor": "#552583",
              "color": "#fff",
              "&:hover": {
                backgroundColor: "#6d3fb6",
              },
              "&:focus": {
                outline: "none",
                backgroundColor: "#552583",
              },
              "&:focus-visible": {
                outline: "2px solid #6d3fb6",
                outlineOffset: "2px",
              },
            }}
            onClick={() => setIsViewMode((prev) => !prev)}
          >
            {isViewMode ? "Create Trade" : "See Trades"}
          </Button>
        )}
      </Box>
      {isViewMode ? (
        <Box sx={{ width: "90%", margin: "auto", pt: 4 }}>
          <TTViewTrades teams={props.teams} key={tradesRefreshKey} />
        </Box>
      ) : (
        <TTNewTrade
          teams={props.teams}
          teamAssets={teamAssets}
          onNext={handleNext}
          onBack={handleBack}
          onTradeSaved={handleTradeSaved}
        />
      )}
    </Box>
  );
};

export default TradeTool;
