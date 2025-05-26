import express from 'express';
import { getDraftPicksByTeam, getAllDraftPicks, getTeamByName } from '../utils/draftPicks.js';

const router = express.Router();

router.get('/draft-picks', async (req, res) => {
  try {
    const draftPicks = await getAllDraftPicks();
    res.json(draftPicks);
  } catch (error) {
    console.error('Error fetching draft picks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/draft-picks/team/:teamId', async (req, res) => {
  try {
    const draftPicks = await getDraftPicksByTeam(req.params.teamId);
    res.json(draftPicks);
  } catch (error) {
    console.error('Error fetching team draft picks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/team/:name', async (req, res) => {
  try {
    const team = await getTeamByName(req.params.name);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 