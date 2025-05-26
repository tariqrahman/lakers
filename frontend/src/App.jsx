import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Container, CircularProgress, Alert } from '@mui/material'
import { getAllTeamsPicks } from './services/api'
import TeamProfile from './components/TeamProfile'

const Home = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const data = await getAllTeamsPicks();
        setTeams(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load teams data');
        setLoading(false);
      }
    };

    loadTeams();
  }, []);
  console.log(teams);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        NBA Draft Picks
      </Typography>
      {teams?.map((team) => (
        <div key={team.team_id} style={{ marginBottom: '2rem' }}>
          <Typography variant="h5" gutterBottom>
            {team.team_name}
          </Typography>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {team.picks?.map((pick) => (
              <div
                key={pick.id}
                style={{
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#f5f5f5'
                }}
              >
                <Typography variant="subtitle1">
                  {pick.season} Round {pick.round}
                  {pick.pick_number ? ` Pick ${pick.pick_number}` : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: {pick.pick_type}
                  {pick.original_team ? ` (from ${pick.original_team})` : ''}
                </Typography>
                {pick.swap_details && (
                  <Typography variant="body2" color="text.secondary">
                    Swap: {pick.swap_details}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Value: {pick.value} (Normalized: {pick.normalized_value})
                </Typography>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Container>
  );
};

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" style={{ textDecoration: 'none', color: 'white' }}>
            NBA Draft Picks
          </Typography>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/team/:teamName" element={<TeamProfile />} />
      </Routes>
    </Router>
  )
}

export default App
