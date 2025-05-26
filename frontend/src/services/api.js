const API_BASE_URL = 'http://localhost:3001/api';

export async function getAllDraftPicks() {
  const response = await fetch(`${API_BASE_URL}/draft-picks`);
  if (!response.ok) {
    throw new Error('Failed to fetch draft picks');
  }
  return response.json();
}

export async function getDraftPicksByTeam(teamId) {
  const response = await fetch(`${API_BASE_URL}/draft-picks/team/${teamId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch team draft picks');
  }
  return response.json();
}

export async function getTeamByName(teamName) {
  const response = await fetch(`${API_BASE_URL}/team/${teamName}`);
  if (!response.ok) {
    throw new Error('Failed to fetch team');
  }
  return response.json();
} 