import { useState, useEffect } from "react";
import { getAllTrades } from "../../../services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import TTViewTradeRow from "./ttViewTradeRow";

const TTViewTrades = (props) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrades = async () => {
    try {
      const data = await getAllTrades();
      setTrades(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load trades");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                style={{
                  padding: "10px",
                  backgroundColor: "#B0B0B0",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                Reporter
              </TableCell>
              <TableCell
                style={{
                  padding: "10px",
                  backgroundColor: "#B0B0B0",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                Teams
              </TableCell>
              <TableCell
                style={{
                  padding: "10px",
                  backgroundColor: "#B0B0B0",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                Date
              </TableCell>
              <TableCell
                style={{
                  padding: "10px",
                  backgroundColor: "#B0B0B0",
                  color: "white",
                  fontWeight: "bold",
                }}
              ></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trades.map((trade, index) => (
              <TTViewTradeRow
                index={index}
                key={trade.id}
                trade={trade}
                teams={props.teams}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TTViewTrades;
