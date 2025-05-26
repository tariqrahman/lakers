import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { getAllDraftPicks } from './services/api'
import TeamProfile from './components/TeamProfile'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Skeleton
} from '@mui/material'
import './App.css'

function Home() {
  const [draftPicks, setDraftPicks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDraftPicks = async () => {
      try {
        const data = await getAllDraftPicks();
        setDraftPicks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDraftPicks();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width="60%" height={60} sx={{ mx: 'auto', mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((index) => (
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        NBA Draft Picks
      </Typography>
      <Grid container spacing={3}>
        {draftPicks.map((pick, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  <Link to={`/team/${pick.team_name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {pick.team_name}
                  </Link>
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  Season: {pick.season}
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
  )
}

function App() {
  return (
    <Router>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component={Link} to="/" sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit' 
            }}>
              NBA Draft Tracker
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/team/:teamName" element={<TeamProfile />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  )
}

export default App
