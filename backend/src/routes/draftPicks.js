import express from "express";
import {
  getDraftPicksByTeam,
  getAllDraftPicks,
  getTeamByName,
} from "../utils/draftPicks.js";
import { refreshDraftPicks } from "../scripts/draftPicksScraper.js";
import { Pool } from "pg";

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

router.get("/draft-picks", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, t.team_name, t.team_code
      FROM tradeable_picks p
      JOIN teams t ON p.team_id = t.id
      ORDER BY t.team_name, p.season, p.round, p.pick_number
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching draft picks:", error);
    res.status(500).json({ error: "Failed to fetch draft picks" });
  }
});

router.get("/draft-picks/team/:teamId", async (req, res) => {
  try {
    const draftPicks = await getDraftPicksByTeam(req.params.teamId);
    res.json(draftPicks);
  } catch (error) {
    console.error("Error fetching team draft picks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/team/:name", async (req, res) => {
  try {
    const team = await getTeamByName(req.params.name);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    res.json(team);
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all teams' picks
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, t.team_name, t.team_code
      FROM tradeable_picks p
      JOIN teams t ON p.team_id = t.id
      ORDER BY t.team_name, p.season, p.round, p.pick_number
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching draft picks:", error);
    res.status(500).json({ error: "Failed to fetch draft picks" });
  }
});

// Get all tradeable picks grouped by team
router.get("/draft-picks/tradeable", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id as team_id,
        t.name as team_name,
        json_agg(
          json_build_object(
            'id', p.id,
            'season', p.season,
            'round', p.round,
            'pick_number', p.pick_number,
            'pick_type', p.pick_type,
            'value', p.value,
            'normalized_value', p.normalized_value,
            'swap_details', p.swap_details,
            'original_team', ot.name
          ) ORDER BY p.season, p.round, p.pick_number
        ) as picks
      FROM teams t
      LEFT JOIN tradeable_picks p ON t.id = p.team_id
      LEFT JOIN teams ot ON p.original_team_id = ot.id
      GROUP BY t.id, t.name
      ORDER BY t.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tradeable picks:", error);
    res.status(500).json({ error: "Failed to fetch tradeable picks" });
  }
});

// Get draft picks for a specific team
router.get("/team/:teamId", async (req, res) => {
  try {
    const { teamId } = req.params;
    const result = await pool.query(
      `
      SELECT p.*, t.team_name, t.team_code
      FROM tradeable_picks p
      JOIN teams t ON p.team_id = t.id
      WHERE p.team_id = $1
      ORDER BY p.season, p.round, p.pick_number
    `,
      [teamId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching team draft picks:", error);
    res.status(500).json({ error: "Failed to fetch team draft picks" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    await refreshDraftPicks();
    res.json({ message: "Draft picks refresh completed successfully" });
  } catch (error) {
    console.error("Error refreshing draft picks:", error);
    res.status(500).json({ error: "Failed to refresh draft picks" });
  }
});

// Get all teams with their information
router.get("/draft-picks/teams", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        name
      FROM teams
      ORDER BY name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

// Save a new trade
router.post("/trades", async (req, res) => {
  const { reporterName, teamIds, tradeSummary } = req.body;
  if (!reporterName || !Array.isArray(teamIds) || !tradeSummary) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    // Parse tradeSummary if it's a string
    const parsedTradeSummary = typeof tradeSummary === 'string' ? JSON.parse(tradeSummary) : tradeSummary;
    const result = await pool.query(
      `INSERT INTO trades (reporter_name, team_ids, trade_summary) VALUES ($1, $2, $3::jsonb) RETURNING *`,
      [reporterName, teamIds, JSON.stringify(parsedTradeSummary)]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error saving trade:", error);
    res.status(500).json({ error: "Failed to save trade" });
  }
});

// Get all saved trades
router.get("/trades", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, reporter_name, team_ids, trade_summary, created_at FROM trades ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching trades:", error);
    res.status(500).json({ error: "Failed to fetch trades" });
  }
});

// Delete a trade by ID
router.delete("/trades/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM trades WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Trade not found" });
    }
    res.json({ message: "Trade deleted", trade: result.rows[0] });
  } catch (error) {
    console.error("Error deleting trade:", error);
    res.status(500).json({ error: "Failed to delete trade" });
  }
});

export default router;
