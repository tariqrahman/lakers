import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
} from "@mui/material";
import TTNewTradeSelectTeams from "./TTNewTradeSteps/TTNewTradeSelecTeams";
import TTNewTradeConfigure from "./TTNewTradeSteps/TTNewTradeConfigure";

const steps = ["Select Teams", "Configure Trade", "Review"];
const MIN_TEAMS = 2;

const TTNewTrade = (props) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTeams, setSelectedTeams] = useState([]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        pt: 4,
        bgcolor: "#f5f5f5",
      }}
    >
      <Card
        sx={{
          width: "80%",
          maxWidth: "1200px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
          bgcolor: "rgba(255, 255, 255, 0.95)",
          position: "relative",
          minHeight: "400px",
        }}
      >
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Create New Trade
          </Typography>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box sx={{ mt: 4 }}>
            {activeStep === 0 && (
              <TTNewTradeSelectTeams
                teams={props.teams}
                selectedTeams={selectedTeams}
                setSelectedTeams={setSelectedTeams}
              />
            )}
            {activeStep === 1 && (
              <TTNewTradeConfigure
                teams={props.teams}
                selectedTeams={selectedTeams}
                setSelectedTeams={setSelectedTeams}
                teamAssets={props.teamAssets}
              />
            )}
            {activeStep === 2 && <Typography>Review Step</Typography>}
          </Box>
          <Box
            sx={{
              position: "absolute",
              bottom: 20,
              right: 20,
              display: "flex",
              gap: 2,
            }}
          >
            {activeStep >= 1 && (
              <Button variant="outlined" color="error" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={selectedTeams.length < MIN_TEAMS}
            >
              Next
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TTNewTrade;
