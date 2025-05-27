import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { teamColors } from "../../../../utils/teamColors";

const formatValue = (value) => {
  return value.toFixed(1);
};

const formatPick = (pick) => {
  return `${pick.season} ${pick.round === 1 ? "1st" : "2nd"} ${
    pick.pick_number ? `(#${pick.pick_number})` : ""
  }`;
};

const TTNewTradeReview = ({ reporterName, selectedTeams, tradeSummary }) => {
  console.log('TTNewTradeReview render start:', { reporterName, selectedTeams, tradeSummary });
  
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

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Trade Summary</Typography>
      {reporterName && (
        <Typography>Reported by: {reporterName}</Typography>
      )}
      <Divider sx={{ my: 2 }} />
      
      {sortedSummary.map((team) => {
        const netValueChange = team.finalValue - team.initialValue;
        const colors = teamColors[team.id];
        
        return (
          <Card 
            key={team.id} 
            sx={{ 
              mb: 2,
              borderLeft: `4px solid ${colors.primary}`,
            }}
          >
            <CardContent>
              <Box sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                mb: 2 
              }}>
                <Typography variant="h6" sx={{ color: colors.primary }}>
                  {team.name}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: netValueChange >= 0 ? "success.main" : "error.main",
                  }}
                >
                  {netValueChange >= 0 ? "+" : ""}
                  {formatValue(netValueChange)} Value
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Outgoing Assets */}
                <Box sx={{ flex: 1 }}>
                  {(() => {
                    const outgoingAssets = team.initialAssets.filter(
                      initial => !team.finalAssets.some(final => final.id === initial.id)
                    );
                    const outgoingValue = outgoingAssets.reduce(
                      (sum, asset) => sum + (asset.normalized_value || 0),
                      0
                    );
                    return (
                      <>
                        <Typography variant="subtitle1" color="error.main" gutterBottom>
                          Outgoing Assets ({formatValue(outgoingValue)} Value)
                        </Typography>
                        <List dense>
                          {outgoingAssets
                            .map(asset => (
                              <ListItem key={asset.id}>
                                <ListItemText
                                  primary={formatPick(asset)}
                                  secondary={`Value: ${formatValue(asset.normalized_value || 0)}`}
                                />
                              </ListItem>
                            ))}
                          {outgoingAssets.length === 0 && (
                            <ListItem>
                              <ListItemText primary="No outgoing assets" />
                            </ListItem>
                          )}
                        </List>
                      </>
                    );
                  })()}
                </Box>

                {/* Incoming Assets */}
                <Box sx={{ flex: 1 }}>
                  {(() => {
                    const incomingAssets = team.finalAssets.filter(
                      final => !team.initialAssets.some(initial => initial.id === final.id)
                    );
                    const incomingValue = incomingAssets.reduce(
                      (sum, asset) => sum + (asset.normalized_value || 0),
                      0
                    );
                    return (
                      <>
                        <Typography variant="subtitle1" color="success.main" gutterBottom>
                          Incoming Assets ({formatValue(incomingValue)} Value)
                        </Typography>
                        <List dense>
                          {incomingAssets
                            .map(asset => (
                              <ListItem key={asset.id}>
                                <ListItemText
                                  primary={formatPick(asset)}
                                  secondary={`Value: ${formatValue(asset.normalized_value || 0)}`}
                                />
                              </ListItem>
                            ))}
                          {incomingAssets.length === 0 && (
                            <ListItem>
                              <ListItemText primary="No incoming assets" />
                            </ListItem>
                          )}
                        </List>
                      </>
                    );
                  })()}
                </Box>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default TTNewTradeReview;
