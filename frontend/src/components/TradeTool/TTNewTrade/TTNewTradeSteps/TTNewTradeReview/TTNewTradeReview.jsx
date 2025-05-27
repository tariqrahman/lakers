import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { saveTrade } from "../../../../../services/api";
import TTNTradeReviewSummary from "./TTNTradeReviewSummary";

const TTNewTradeReview = ({
  reporterName,
  selectedTeams,
  tradeSummary,
  onSaveSuccess,
  onBack,
}) => {
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [saveError, setSaveError] = useState(null);

  if (!tradeSummary || tradeSummary.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No trade data available</Typography>
      </Box>
    );
  }

  // Sort teams by net value gain (descending)
  const sortedSummary = [...tradeSummary].sort(
    (a, b) => b.finalValue - b.initialValue - (a.finalValue - a.initialValue)
  );

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);
    try {
      await saveTrade({ reporterName, teamIds: selectedTeams, tradeSummary });
      setSaveSuccess("Trade saved successfully!");
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      setSaveError("Failed to save trade");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ width: "96%", height: "calc(100vh - 64px)", overflowY: "auto" }}>
      {sortedSummary.map((team) => (
        <Box key={team.id} style={{ marginBottom: 40 }}>
          <TTNTradeReviewSummary team={team} />
        </Box>
      ))}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
        {saveSuccess && <Alert severity="success">{saveSuccess}</Alert>}
        {saveError && <Alert severity="error">{saveError}</Alert>}
        <Button
          variant="outlined"
          sx={{
            color: '#d32f2f',
            borderColor: '#d32f2f',
            '&:hover': {
              borderColor: '#d32f2f',
              backgroundColor: 'rgba(211, 47, 47, 0.04)',
            },
            '&:focus': {
              outline: 'none',
              borderColor: '#d32f2f',
            },
            '&:focus-visible': {
              outline: '2px solid #d32f2f',
              outlineOffset: '2px',
            }
          }}
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#552583",
            color: "#fff",
            '&:hover': {
              backgroundColor: '#6d3fb6',
            },
            '&:focus': {
              outline: 'none',
              backgroundColor: '#552583',
            },
            '&:focus-visible': {
              outline: '2px solid #6d3fb6',
              outlineOffset: '2px',
            }
          }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : "Save Trade"}
        </Button>
      </Box>
    </Box>
  );
};

export default TTNewTradeReview;
