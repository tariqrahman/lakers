import { useState, useEffect } from "react";
import { getAllTrades } from "../../../services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  LinearProgress,
} from "@mui/material";
import TTViewTradeRow from "./ttViewTradeRow";

const TTViewTrades = (props) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

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
            {loading || trades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" style={{ padding: 0 }}>
                  <LinearProgress />
                </TableCell>
              </TableRow>
            ) : (
              <>
                {trades.map((trade, index) => (
                  <TTViewTradeRow
                    index={index}
                    key={trade.id}
                    trade={trade}
                    teams={props.teams}
                    onDelete={fetchTrades}
                  />
                ))}
              </>
            )}
          </TableBody>
        </Table>
        <TablePagination
          colSpan={3}
          style={{ padding: 0 }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          count={trades.length}
          rowsPerPage={10}
          page={0}
          onPageChange={handlePageChange}
        />
      </TableContainer>
    </div>
  );
};

export default TTViewTrades;
