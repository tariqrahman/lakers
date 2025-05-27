import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  TextField,
} from "@mui/material";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MAX_TEAMS = 5;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const TTNewTradeSelectTeams = (props) => {
  const handleTeamChange = (event) => {
    const {
      target: { value },
    } = event;
    props.setSelectedTeams(
      typeof value === "string" ? value.split(",") : value
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        gap: 2,
        maxWidth: "1200px",
      }}
    >
      <FormControl sx={{ width: 300 }} size="small">
        <InputLabel id="team-select-label">Select Teams</InputLabel>
        <Select
          labelId="team-select-label"
          id="team-select"
          multiple
          value={props.selectedTeams}
          onChange={handleTeamChange}
          input={<OutlinedInput label="Select Teams" />}
          renderValue={(selected) => {
            const selectedNames = selected.map(
              (id) => props.teams.find((team) => team.id === id)?.name
            );
            return selectedNames.join(", ");
          }}
          MenuProps={MenuProps}
          size="small"
        >
          {props.teams.map((team) => (
            <MenuItem
              key={team.id}
              value={team.id}
              disabled={
                props.selectedTeams.length >= MAX_TEAMS &&
                !props.selectedTeams.includes(team.id)
              }
            >
              <Checkbox
                style={{ padding: 6 }}
                checked={props.selectedTeams.indexOf(team.id) > -1}
              />
              <ListItemText primary={team.name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Name"
        value={props.reporterName}
        onChange={(e) => props.setReporterName(e.target.value)}
        size="small"
        sx={{ minWidth: 200 }}
      />
    </Box>
  );
};

export default TTNewTradeSelectTeams;
