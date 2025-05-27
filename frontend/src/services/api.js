const API_BASE_URL = import.meta.env.PROD
  ? "/api"
  : "http://localhost:3001/api";

export async function getAllDraftPicks() {
  const response = await fetch(`${API_BASE_URL}/draft-picks`);
  if (!response.ok) {
    throw new Error("Failed to fetch draft picks");
  }
  return response.json();
}

export async function getDraftPicksByTeam(teamId) {
  const response = await fetch(`${API_BASE_URL}/draft-picks/team/${teamId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch team draft picks");
  }
  return response.json();
}

export async function getTeamByName(teamName) {
  const response = await fetch(`${API_BASE_URL}/team/${teamName}`);
  if (!response.ok) {
    throw new Error("Failed to fetch team");
  }
  return response.json();
}

export async function refreshDraftPicks() {
  const response = await fetch(`${API_BASE_URL}/refresh`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to refresh draft picks");
  }
  return response.json();
}

export async function getAllTeamsPicks() {
  const response = await fetch(`${API_BASE_URL}/draft-picks/tradeable`);
  if (!response.ok) {
    throw new Error("Failed to fetch all teams picks");
  }
  return response.json();
}

// Get all teams with their information
export const getAllTeams = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/draft-picks/teams`);
    if (!response.ok) {
      throw new Error("Failed to fetch teams");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching teams:", error);
    throw error;
  }
};

export const getAllTrades = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/trades`);
    if (!response.ok) {
      throw new Error("Failed to fetch trades");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching trades:", error);
    throw error;
  }
};

export async function saveTrade({ reporterName, teamIds, tradeSummary }) {
  const response = await fetch(`${API_BASE_URL}/trades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reporterName,
      teamIds,
      tradeSummary: JSON.stringify(tradeSummary),
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to save trade");
  }
  return response.json();
}

export async function deleteTrade(id) {
  const response = await fetch(`${API_BASE_URL}/trades/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete trade");
  }
  return response.json();
}
