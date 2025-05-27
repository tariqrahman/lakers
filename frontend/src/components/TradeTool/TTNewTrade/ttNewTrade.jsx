import { useState, useEffect } from "react";
import {
  Paper,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
} from "@mui/material";
import TTNewTradeSelectTeams from "./TTNewTradeSteps/TTNewTradeSelectTeams";
import TTNewTradeConfigure from "./TTNewTradeSteps/TTNewTradeConfigure";
import TTNewTradeReview from "./TTNewTradeSteps/TTNewTradeReview/TTNewTradeReview";

const TTNewTrade = (props) => {
  const [activeStep, setActiveStep] = useState(0);
  const [tradeSummary, setTradeSummary] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [reporterName, setReporterName] = useState("");

  const handleNext = () => {
    // No longer setActiveStep here
    // setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Add a handler for after save
  const handleTradeSaved = () => {
    if (props.onTradeSaved) props.onTradeSaved(); // parent can trigger refresh
    setActiveStep(0);
    setTradeSummary([]);
    setSelectedTeams([]);
    setReporterName("");
  };

  // Advance to review step only after tradeSummary is set
  useEffect(() => {
    if (tradeSummary && tradeSummary.length > 0 && activeStep === 0) {
      setActiveStep(1);
    }
  }, [tradeSummary]);

  return (
    <>
      <Box
        sx={{ width: "100%", height: "calc(100vh - 64px)", overflowY: "auto" }}
      >
        <Paper
          elevation={2}
          sx={{
            mx: "auto",
            mt: 2,
            mb: 4,
            p: 4,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            backgroundColor: "#f5f5f5",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          {activeStep === 0 && (
            <TTNewTradeSelectTeams
              teams={props.teams}
              selectedTeams={selectedTeams}
              setSelectedTeams={setSelectedTeams}
              reporterName={reporterName}
              setReporterName={setReporterName}
            />
          )}
          <Card
            sx={{
              width: "95%",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
              bgcolor: "rgba(255, 255, 255, 0.95)",
              position: "relative",
              minHeight: "400px",
              margin: "auto",
              mt: 2,
            }}
          >
            <CardContent>
              {activeStep === 0 && (
                <>
                  {selectedTeams.length > 1 ? (
                    <TTNewTradeConfigure
                      teams={props.teams}
                      selectedTeams={selectedTeams}
                      setSelectedTeams={setSelectedTeams}
                      teamAssets={props.teamAssets}
                      reporterName={reporterName}
                      setTradeSummary={setTradeSummary}
                      onNext={handleNext}
                    />
                  ) : (
                    <Typography variant="h6" align="center" gutterBottom>
                      Select 2 or more teams to begin
                    </Typography>
                  )}
                </>
              )}
              {activeStep === 1 && (
                <>
                  <TTNewTradeReview
                    reporterName={reporterName}
                    selectedTeams={selectedTeams}
                    tradeSummary={tradeSummary}
                    onSaveSuccess={handleTradeSaved}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </Paper>
      </Box>
    </>
  );
};

export default TTNewTrade;
