import { useState } from "react";
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
import TTNewTradeReview from "./TTNewTradeSteps/TTNewTradeReview";

const TTNewTrade = (props) => {
  const [activeStep, setActiveStep] = useState(0);
  const [tradeSummary, setTradeSummary] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [reporterName, setReporterName] = useState("");

  const handleNext = () => {
    console.log('Next clicked, current tradeSummary:', tradeSummary);
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  console.log('TTNewTrade render:', { activeStep, tradeSummary, selectedTeams });

  return (
    <>
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
          height: "100%",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <TTNewTradeSelectTeams
          teams={props.teams}
          selectedTeams={selectedTeams}
          setSelectedTeams={setSelectedTeams}
          reporterName={reporterName}
          setReporterName={setReporterName}
        />
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
            <Typography variant="h4" align="center" gutterBottom>
              Create New Trade
            </Typography>
            <Box sx={{ mt: 4 }}>
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
                  <Typography variant="h6" align="center" gutterBottom>
                    Trade Summary
                  </Typography>
                  {console.log('Rendering TTNewTradeReview with:', { reporterName, selectedTeams, tradeSummary })}
                  <TTNewTradeReview
                    reporterName={reporterName}
                    selectedTeams={selectedTeams}
                    tradeSummary={tradeSummary}
                  />
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </Paper>
    </>
  );
};

export default TTNewTrade;
