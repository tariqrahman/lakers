import { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { getAllTeamsPicks } from "../../services/api";
import TTViewTrades from "./TTViewTrades/ttViewTrades";
import TTNewTrade from "./TTNewTrade/ttNewTrade";

const TradeTool = (props) => {
  const [teamAssets, setTeamAssets] = useState([]);
  const [isViewMode, setIsViewMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tradesRefreshKey, setTradesRefreshKey] = useState(0);

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
      {/* Header and Toggle Button Row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 4,
          pt: 6,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "black", paddingLeft: 3 }}>
          {isViewMode ? "Trade Drafts" : "Create Trade"}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsViewMode((prev) => !prev)}
        >
          {isViewMode ? "Create Trade" : "See Trades"}
        </Button>
      </Box>
      {/* Main Content */}
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
