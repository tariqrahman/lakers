import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  Button,
} from "@mui/material";
import { teamColors } from "../../../../utils/teamColors";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MIN_TEAMS = 2;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// Custom Droppable component for Strict Mode compatibility
const StrictModeDroppable = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
};

function violatesStipienRule(picks, pickToRemove) {
  // Filter out the pick being considered for trade
  const remainingPicks = picks.filter(p => p.id !== pickToRemove.id);

  // Get all years with a first-round pick
  const firstRoundYears = remainingPicks
    .filter(p => p.round === 1)
    .map(p => p.season);

  // For each year from the earliest to the latest, check every pair of years
  const allYears = Array.from(new Set(picks.map(p => p.season))).sort();
  for (let i = 0; i < allYears.length - 1; i++) {
    const y1 = allYears[i];
    const y2 = allYears[i + 1];
    // If both years have no first-round pick, it's a violation
    if (
      !firstRoundYears.includes(y1) &&
      !firstRoundYears.includes(y2)
    ) {
      return true;
    }
  }
  return false;
}

const TTNewTradeConfigure = ({
  selectedTeams,
  teams,
  teamAssets,
  setTradeSummary,
  onNext,
  reporterName,
}) => {
  // Track selected assets in dropdowns
  const [selectedAssets, setSelectedAssets] = useState({});
  // Track assets in droppable areas
  const [tradeAssets, setTradeAssets] = useState({});
  // Track if drag and drop is ready
  const [isDragReady, setIsDragReady] = useState(false);

  useEffect(() => {
    // Initialize droppable areas for each team
    const initialTradeAssets = {};
    selectedTeams.forEach((teamId) => {
      initialTradeAssets[teamId] = [];
    });
    setTradeAssets(initialTradeAssets);
    setIsDragReady(true);
  }, [selectedTeams]);

  const handleNextClick = () => {
    getTeamTradeSummary();
    if (onNext) onNext();
  };

  const handleAssetChange = (teamId, event) => {
    const {
      target: { value },
    } = event;

    // Get the new selection
    const newSelection = typeof value === "string" ? value.split(",") : value;

    // Find removed items
    const removedItems = (selectedAssets[teamId] || []).filter(
      (id) => !newSelection.includes(id)
    );

    // Find added items
    const addedItems = newSelection.filter(
      (id) => !(selectedAssets[teamId] || []).includes(id)
    );

    // Update selected assets
    setSelectedAssets((prev) => ({
      ...prev,
      [teamId]: newSelection,
    }));

    // Update trade assets
    setTradeAssets((prev) => {
      const newTradeAssets = { ...prev };

      // Remove deselected items from all droppable areas
      Object.keys(newTradeAssets).forEach((targetTeamId) => {
        newTradeAssets[targetTeamId] = newTradeAssets[targetTeamId].filter(
          (asset) => !removedItems.includes(asset.id)
        );
      });

      // Add new items to the team's droppable area
      if (addedItems.length > 0) {
        const teamPicks =
          teamAssets.find((t) => t.team_id === teamId)?.picks || [];
        const newAssets = addedItems.map((id) => {
          const pick = teamPicks.find((pick) => pick.id === id);
          return {
            ...pick,
            team_id: teamId.toString(),
            original_team_id: teamId.toString(),
          };
        });

        if (!newTradeAssets[teamId]) {
          newTradeAssets[teamId] = [];
        }
        newTradeAssets[teamId] = [...newTradeAssets[teamId], ...newAssets];
      }

      return newTradeAssets;
    });
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    // Dropped outside a droppable area
    if (!destination) {
      return;
    }

    // Extract team IDs from droppable IDs
    const sourceTeamId = source.droppableId.split("-")[1];
    const destTeamId = destination.droppableId.split("-")[1];

    const sourceIndex = source.index;
    const destIndex = destination.index;

    // If dropped in the same place
    if (sourceTeamId === destTeamId && sourceIndex === destIndex) {
      return;
    }

    setTradeAssets((prev) => {
      // Create a deep copy of the previous state
      const newTradeAssets = JSON.parse(JSON.stringify(prev));

      // Initialize arrays if they don't exist
      if (!newTradeAssets[sourceTeamId]) newTradeAssets[sourceTeamId] = [];
      if (!newTradeAssets[destTeamId]) newTradeAssets[destTeamId] = [];

      // Get the item being moved
      const [movedItem] = newTradeAssets[sourceTeamId].splice(sourceIndex, 1);

      if (!movedItem) {
        return prev; // Return previous state if no item found
      }

      // If moving back to original team, check if it's still selected
      if (destTeamId === movedItem.original_team_id) {
        const isStillSelected = selectedAssets[
          movedItem.original_team_id
        ]?.includes(movedItem.id);
        if (!isStillSelected) {
          return prev; // Return previous state if not selected
        }
      }

      // Insert at new location
      newTradeAssets[destTeamId].splice(destIndex, 0, movedItem);

      return newTradeAssets;
    });
  };

  // Function to gather trade summary data for each team
  const getTeamTradeSummary = () => {
    const summary = selectedTeams.map((teamId) => {
      const team = teams.find((t) => t.id === teamId);
      const teamPicks =
        teamAssets.find((t) => t.team_id === teamId)?.picks || [];
      // Initial assets: only those selected in the dropdown
      const initialAssets = (selectedAssets[teamId] || [])
        .map((id) => teamPicks.find((pick) => pick.id === id))
        .filter(Boolean);
      // Final assets: those in the droppable area
      const finalAssets = tradeAssets[teamId] || [];
      const sumValue = (arr) =>
        arr.reduce((sum, asset) => sum + (asset.normalized_value || 0), 0);
      return {
        id: teamId,
        name: team?.name,
        initialAssets,
        finalAssets,
        initialValue: sumValue(initialAssets),
        finalValue: sumValue(finalAssets),
      };
    });
    setTradeSummary(summary);
  };

  // Check if any asset has changed teams
  const hasTradeOccurred = Object.entries(tradeAssets).some(([teamId, assets]) =>
    assets.some(asset => asset.team_id !== teamId)
  );

  return (
    <Box sx={{ width: "100%", mt: 2, pb: 8, position: "relative" }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <TableContainer component={Paper}>
          <Table
            sx={{
              tableLayout: "fixed",
              borderCollapse: "collapse",
              borderSpacing: 0,
            }}
          >
            <TableHead>
              <TableRow>
                {selectedTeams.map((teamId) => {
                  const team = teams.find((t) => t.id === teamId);
                  const colors = teamColors[teamId];
                  return (
                    <TableCell
                      key={teamId}
                      sx={{
                        backgroundColor: colors.primary,
                        color: colors.primaryContrastFont,
                        fontWeight: "bold",
                        textAlign: "center",
                        width: `${100 / selectedTeams.length}%`,
                        padding: 1,
                      }}
                    >
                      {team?.name || `Team ${teamId}`}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {selectedTeams.map((teamId, idx) => (
                  <TableCell
                    key={teamId}
                    sx={{
                      padding: 0,
                      width: `${100 / selectedTeams.length}%`,
                      height: "250px",
                      verticalAlign: "top",
                      borderLeft: idx === 0 ? 0 : "none",
                      borderRight:
                        idx === selectedTeams.length - 1 ? 0 : "none",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        m: 0,
                      }}
                    >
                      <FormControl
                        sx={{
                          width: "100%",
                          borderRadius: 0,
                          flexShrink: 0,
                        }}
                        variant="standard"
                      >
                        <InputLabel
                          id={`team-${teamId}-assets-label`}
                          size="small"
                        >
                          {selectedAssets[teamId]?.length > 0 ? "" : "Assets"}
                        </InputLabel>
                        <Select
                          labelId={`team-${teamId}-assets-label`}
                          multiple
                          value={selectedAssets[teamId] || []}
                          onChange={(e) => handleAssetChange(teamId, e)}
                          renderValue={(selected) => {
                            const selectedPicks = selected.map((id) => {
                              const team = teamAssets.find(
                                (t) => t.team_id === teamId
                              );
                              const pick = team?.picks?.find(
                                (p) => p.id === id
                              );
                              return pick
                                ? `${pick.season} ${
                                    pick.round === 1 ? "1st" : "2nd"
                                  } ${
                                    pick.pick_number
                                      ? `(#${pick.pick_number})`
                                      : ""
                                  }`
                                : "";
                            });
                            return selectedPicks.join(", ");
                          }}
                          MenuProps={MenuProps}
                          size="small"
                          variant="standard"
                          sx={{
                            "& .MuiSelect-select": {
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              width: "100%",
                            },
                          }}
                        >
                          {teamAssets
                            .find((t) => t.team_id === teamId)
                            ?.picks?.map((asset) => (
                              <MenuItem
                                key={asset.id}
                                value={asset.id}
                                size="small"
                                disabled={violatesStipienRule(
                                  teamAssets.find((t) => t.team_id === teamId)?.picks || [],
                                  asset
                                )}
                                sx={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                <Checkbox
                                  style={{ paddingRight: 10 }}
                                  checked={
                                    selectedAssets[teamId]?.indexOf(asset.id) >
                                    -1
                                  }
                                />
                                <ListItemText
                                  primary={`${asset.season} ${
                                    asset.round === 1 ? "1st" : "2nd"
                                  } ${
                                    asset.pick_number
                                      ? `(#${asset.pick_number})`
                                      : ""
                                  }`}
                                  sx={{
                                    "& .MuiTypography-root": {
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    },
                                  }}
                                />
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                      <StrictModeDroppable
                        droppableId={`team-${teamId}`}
                        isDropDisabled={false}
                        isCombineEnabled={false}
                        ignoreContainerClipping={false}
                      >
                        {(provided, snapshot) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            sx={{
                              flex: 1,
                              borderTop: "1px dashed #ccc",
                              borderBottom: "1px dashed #ccc",
                              borderLeft: idx === 0 ? "1px dashed #ccc" : 0,
                              borderRight:
                                idx === selectedTeams.length - 1
                                  ? "1px dashed #ccc"
                                  : "1px solid #e0e0e0",
                              borderRadius: 1,
                              p: 1,
                              backgroundColor: snapshot.isDraggingOver
                                ? "#e0e0e0"
                                : "#f5f5f5",
                              width: "100%",
                              overflow: "auto",
                              m: 0,
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            {(tradeAssets[teamId] || []).map((asset, index) => (
                              <Draggable
                                key={`asset-${asset.id}`}
                                draggableId={`asset-${asset.id}`}
                                index={index}
                              >
                                {(provided, snapshot) => {
                                  const assetColors =
                                    teamColors[asset.team_id] || {};
                                  return (
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      sx={{
                                        p: 1,
                                        mb: 1,
                                        backgroundColor: snapshot.isDragging
                                          ? assetColors.primary
                                          : assetColors.primary,
                                        color: assetColors.primaryContrastFont,
                                        borderRadius: 1,
                                        boxShadow: 1,
                                        cursor: "grab",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        fontWeight: "bold",
                                        width: `${300 / selectedTeams.length}%`,
                                      }}
                                    >
                                      {`${asset.season} ${
                                        asset.round === 1 ? "1st" : "2nd"
                                      } ${
                                        asset.pick_number
                                          ? `(#${asset.pick_number})`
                                          : ""
                                      }`}
                                    </Box>
                                  );
                                }}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </Box>
                        )}
                      </StrictModeDroppable>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DragDropContext>
      {selectedTeams.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            bottom: 10,
            right: 10,
            display: "flex",
            gap: 2,
            paddingTop: 10,
          }}
        >
          <Button
            variant="contained"
            onClick={handleNextClick}
            disabled={
              selectedTeams.length < 2 ||
              reporterName === "" ||
              !hasTradeOccurred
            }
          >
            Next
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TTNewTradeConfigure;
