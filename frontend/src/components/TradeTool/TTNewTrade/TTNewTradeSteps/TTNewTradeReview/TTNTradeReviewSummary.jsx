import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { teamColors } from "../../../../../utils/teamColors";

const TTNTradeReviewSummary = (props) => {
  const formatPick = (pick) => {
    return `${pick.season} ${pick.round === 1 ? "1st" : "2nd"} ${
      pick.pick_number ? `(#${pick.pick_number})` : ""
    }`;
  };

  const netValueChange = props.team.finalValue - props.team.initialValue;
  const outgoingAssets = props.team.initialAssets.filter(
    (initial) =>
      !props.team.finalAssets.some((final) => final.id === initial.id)
  );
  const incomingAssets = props.team.finalAssets.filter(
    (final) =>
      !props.team.initialAssets.some((initial) => initial.id === final.id)
  );
  return (
    <>
      <TableContainer key={props.team.id}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                colSpan={3}
                align="center"
                style={{
                  fontWeight: "bold",
                  padding: 6,
                  backgroundColor: teamColors[props.team.id].primary,
                  color: teamColors[props.team.id].primaryContrastFont,
                }}
              >
                {" "}
                {props.team.name}: {netValueChange >= 0 ? "+" : ""}
                {netValueChange.toFixed(1)} Value
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                style={{
                  fontWeight: "bold",
                  padding: 4,
                  backgroundColor: "#B0B0B0",
                  color: "white",
                  fontSize: "12px",
                }}
              >
                <SwapHorizIcon sx={{ fontSize: "20px", pt: 0.5, pl: 0.5 }} />
              </TableCell>
              <TableCell
                style={{
                  fontWeight: "bold",
                  padding: 4,
                  backgroundColor: "#B0B0B0",
                  color: "white",
                  fontSize: "12px",
                }}
              >
                Asset Name
              </TableCell>
              <TableCell
                style={{
                  fontWeight: "bold",
                  padding: 4,
                  backgroundColor: "#B0B0B0",
                  color: "white",
                  fontSize: "12px",
                }}
              >
                Value
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {outgoingAssets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  align="center"
                  style={{ fontSize: "12px", padding: 4 }}
                >
                  No outgoing assets
                </TableCell>
              </TableRow>
            ) : (
              outgoingAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell style={{ fontSize: "12px", padding: 6 }}>
                    Outgoing
                  </TableCell>
                  <TableCell style={{ fontSize: "12px", padding: 6 }}>
                    {formatPick(asset)}
                  </TableCell>
                  <TableCell
                    style={{ fontSize: "12px", padding: 6, color: "red" }}
                  >
                    -{asset.normalized_value?.toFixed(1) ?? 0}
                  </TableCell>
                </TableRow>
              ))
            )}
            {incomingAssets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  align="center"
                  style={{ fontSize: "12px", padding: 4 }}
                >
                  No incoming assets
                </TableCell>
              </TableRow>
            ) : (
              incomingAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell style={{ fontSize: "12px", padding: 6 }}>
                    Incoming
                  </TableCell>
                  <TableCell style={{ fontSize: "12px", padding: 6 }}>
                    {formatPick(asset)}
                  </TableCell>
                  <TableCell
                    style={{ fontSize: "12px", padding: 6, color: "green" }}
                  >
                    +{asset.normalized_value?.toFixed(1) ?? 0}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default TTNTradeReviewSummary;
