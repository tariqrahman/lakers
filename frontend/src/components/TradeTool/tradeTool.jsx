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
          py: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          {isViewMode ? "Trades" : "Create Trade"}
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
        <TTViewTrades teams={props.teams} />
      ) : (
        <TTNewTrade
          teams={props.teams}
          teamAssets={teamAssets}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
    </Box>
  );
};

export default TradeTool;
