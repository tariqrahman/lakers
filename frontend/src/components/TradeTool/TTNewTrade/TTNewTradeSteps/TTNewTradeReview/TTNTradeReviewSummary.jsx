import { Box, Typography } from "@mui/material";

const TTNTradeReviewSummary = (props) => {
  const formatPick = (pick) => {
    return `${pick.season} ${pick.round === 1 ? "1st" : "2nd"} ${
      pick.pick_number ? `(#${pick.pick_number})` : ""
    }`;
  };

  const netValueChange = props.team.finalValue - props.team.initialValue;
  console.log("props.team", props.team, netValueChange);
  // Outgoing: in initialAssets but not in finalAssets
  const outgoingAssets = props.team.initialAssets.filter(
    (initial) =>
      !props.team.finalAssets.some((final) => final.id === initial.id)
  );
  // Incoming: in finalAssets but not in initialAssets
  const incomingAssets = props.team.finalAssets.filter(
    (final) =>
      !props.team.initialAssets.some((initial) => initial.id === final.id)
  );
  return (
    <Box key={props.team.id} sx={{ my: 3 }}>
      <Typography align="center" sx={{ fontWeight: "bold", color: "black" }}>
        {props.team.name}: {netValueChange >= 0 ? "+" : ""}
        {netValueChange.toFixed(1)} Value
      </Typography>
      <Box sx={{ mt: 1, mb: 1 }}>
        <Typography variant="subtitle1" color="error.main">
          Outgoing Assets
        </Typography>
        {outgoingAssets.length === 0 ? (
          <Typography>No outgoing assets</Typography>
        ) : (
          outgoingAssets.map((asset) => (
            <Typography key={asset.id}>
              {formatPick(asset)} (Value:{" "}
              {asset.normalized_value?.toFixed(1) ?? 0})
            </Typography>
          ))
        )}
      </Box>
      <Box sx={{ mt: 1, mb: 1 }}>
        <Typography variant="subtitle1" color="success.main">
          Incoming Assets
        </Typography>
        {incomingAssets.length === 0 ? (
          <Typography>No incoming assets</Typography>
        ) : (
          incomingAssets.map((asset) => (
            <Typography key={asset.id}>
              {formatPick(asset)} (Value:{" "}
              {asset.normalized_value?.toFixed(1) ?? 0})
            </Typography>
          ))
        )}
      </Box>
    </Box>
  );
};

export default TTNTradeReviewSummary;
