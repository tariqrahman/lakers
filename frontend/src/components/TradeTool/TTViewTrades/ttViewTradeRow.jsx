import { useState } from "react";
import {
  TableRow,
  TableCell,
  Modal,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TTNTradeReviewSummary from "../TTNewTrade/TTNewTradeSteps/TTNewTradeReview/TTNTradeReviewSummary";
import { deleteTrade } from "../../../services/api";
import DeleteIcon from "@mui/icons-material/Delete";

const TTViewTradeRow = (props) => {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const backgroundColor = props.index % 2 === 1 ? "#F0F0F0" : "#FFFFFF";

  const formattedTeams = props.teams
    .filter((team) => props.trade.team_ids.includes(team.id))
    .map((team) => team.name);

  function formatDateMMDDYY(isoString) {
    const date = new Date(isoString);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    return `${mm}/${dd}/${yy}`;
  }

  const formattedDate = formatDateMMDDYY(props.trade.created_at);
  const sortedSummary = [...props.trade?.trade_summary].sort(
    (a, b) => b.finalValue - b.initialValue - (a.finalValue - a.initialValue)
  );

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent opening modal
    if (!window.confirm("Are you sure you want to delete this trade?")) return;
    setDeleting(true);
    try {
      await deleteTrade(props.trade.id);
      if (props.onDelete) props.onDelete(props.trade.id); // parent can remove from list
    } catch (err) {
      alert("Failed to delete trade");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <TableRow
        key={props.trade.id}
        hover
        style={{ cursor: "pointer" }}
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        sx={{ backgroundColor: backgroundColor }}
      >
        <TableCell style={{ padding: "10px" }}>
          {props.trade.reporter_name}
        </TableCell>
        <TableCell style={{ padding: "10px" }}>
          {formattedTeams.join(", ")}
        </TableCell>
        <TableCell style={{ padding: "10px" }}>{formattedDate}</TableCell>
        <TableCell style={{ padding: "10px", width: 40 }}>
          {hover && (
            <IconButton
              size="small"
              color="error"
              hover
              onClick={handleDelete}
              disabled={deleting}
              style={{ width: 18, height: 18 }}
            >
              <DeleteIcon sx={{ width: 18, height: 18 }} />
            </IconButton>
          )}
        </TableCell>
      </TableRow>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            maxWidth: 600,
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Trade Summary</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          {sortedSummary.map((team) => (
            <TTNTradeReviewSummary key={team.id} team={team} />
          ))}
        </Box>
      </Modal>
    </>
  );
};

export default TTViewTradeRow;
