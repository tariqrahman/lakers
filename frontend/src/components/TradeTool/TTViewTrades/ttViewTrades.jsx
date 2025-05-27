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
  TextField,
  Box,
} from "@mui/material";
import TTViewTradeRow from "./ttViewTradeRow";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

const TTViewTrades = (props) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSortDate = () => {
    setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
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

  const filteredTrades = trades.filter((trade) =>
    trade.reporter_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
  });

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
                Name
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
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={handleSortDate}
              >
                Date{" "}
                {sortDirection === "desc" ? (
                  <ArrowDownwardIcon
                    fontSize="small"
                    style={{
                      verticalAlign: "middle",
                      width: 15,
                      marginBottom: 2,
                    }}
                  />
                ) : (
                  <ArrowUpwardIcon
                    fontSize="small"
                    style={{
                      verticalAlign: "middle",
                      width: 15,
                      marginBottom: 2,
                    }}
                  />
                )}
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
                {sortedTrades
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((trade, index) => (
                    <TTViewTradeRow
                      index={page * rowsPerPage + index}
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            py: 1,
          }}
        >
          <TextField
            label="Search by name"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 220 }}
            InputProps={{
              sx: { fontSize: 14, padding: 0 },
            }}
            InputLabelProps={{
              sx: { fontSize: 14 },
            }}
          />
          <TablePagination
            component="div"
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            count={filteredTrades.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Box>
      </TableContainer>
    </div>
  );
};

export default TTViewTrades;
