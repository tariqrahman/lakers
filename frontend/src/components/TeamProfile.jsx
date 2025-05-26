import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDraftPicksByTeam, getTeamByName } from '../services/api';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Skeleton
} from '@mui/material';

function TeamProfile() {
  const { teamName } = useParams();
  const [team, setTeam] = useState(null);
  const [draftPicks, setDraftPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const teamData = await getTeamByName(teamName);
        if (teamData) {
          setTeam(teamData);
          const picks = await getDraftPicksByTeam(teamData.id);
          setDraftPicks(picks);
        } else {
          setError('Team not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamName]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width="40%" height={60} sx={{ mx: 'auto', mb: 4 }} />
        <Skeleton variant="text" width="30%" height={40} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="80%" height={40} />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }
  
  if (error) return (
    <Container>
      <Alert severity="error">Error: {error}</Alert>
    </Container>
  );
  
  if (!team) return (
    <Container>
      <Alert severity="error">Team not found</Alert>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        {team.name}
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Draft Picks
      </Typography>
      <Grid container spacing={3}>
        {draftPicks.map((pick, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  Season {pick.season}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  First Round: {pick.first_rd}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  Second Round: {pick.second_rd}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Last Updated: {new Date(pick.last_updated).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default TeamProfile; 