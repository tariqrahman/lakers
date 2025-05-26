const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

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

export async function refreshDraftPicks() {
  const response = await fetch(`${API_BASE_URL}/refresh`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to refresh draft picks');
  }
  return response.json();
}

export async function getAllTeamsPicks() {
  const response = await fetch(`${API_BASE_URL}/draft-picks/tradeable`);
  if (!response.ok) {
    throw new Error('Failed to fetch all teams picks');
  }
  return response.json();
} 