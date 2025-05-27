import { useState, useEffect } from "react";
import { Box } from "@mui/material";
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
    <Box sx={{ width: "100%", height: "calc(100vh - 64px)", overflow: "hidden" }}>
      {!isViewMode ? (
        <TTViewTrades />
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
