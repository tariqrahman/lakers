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
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        {saveSuccess && <Alert severity="success">{saveSuccess}</Alert>}
        {saveError && <Alert severity="error">{saveError}</Alert>}
        <Button
          variant="contained"
          color="primary"
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
