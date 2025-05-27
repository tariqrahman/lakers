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
              <TableCell>Reporter</TableCell>
              <TableCell>Teams</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trades.map((trade) => (
              <TTViewTradeRow
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
