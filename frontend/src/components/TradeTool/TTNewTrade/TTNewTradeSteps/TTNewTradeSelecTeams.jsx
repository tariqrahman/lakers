import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
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
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <FormControl sx={{ width: 300 }}>
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
    </Box>
  );
};

export default TTNewTradeSelectTeams;
