import axios from 'axios';
import * as cheerio from 'cheerio';
import { Pool } from 'pg';

const BASE_URL = 'https://basketball.realgm.com/nba/draft/future_drafts/team';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Function to parse pick number from text
const parsePickNumber = (text) => {
  const match = text.match(/#(\d+)/);
  return match ? parseInt(match[1]) : null;
};

// Function to determine pick type and swap type
const determinePickType = (text) => {
  // Check for swap types first
  if (text.includes('Least favorable') || text.includes('LF') || 
      text.includes('least favorable') || text.includes('less favorable')) {
    return 'SWAP_LF';
  }
  if (text.includes('Most favorable') || text.includes('MF') || 
      text.includes('most favorable') || text.includes('more favorable')) {
    return 'SWAP_MF';
  }
  if (text.includes('second most favorable') || text.includes('two most favorable')) {
    return 'SWAP_MF'; // Treat as most favorable for simplicity
  }
  if (text.includes('third most favorable')) {
    return 'SWAP_MF'; // Treat as most favorable for simplicity
  }
  
  // Check for other types
  if (text.includes('swap')) return 'SWAP'; // Generic swap if we can't determine LF/MF
  if (text.includes('protected')) return 'PROTECTED';
  
  // Check for team codes (3 capital letters) - this indicates an acquired pick
  if (text.match(/\b[A-Z]{3}\b/)) {
    return 'ACQUIRED';
  }
  
  // If it contains "Own" and no team codes, it's an own pick
  if (text.includes('Own')) return 'OWN';
  
  return 'ACQUIRED'; // Default to ACQUIRED if we can't determine
};

// Function to parse the draft picks table for a team
const parseDraftPicks = ($, table) => {
  const picks = [];
  
  $(table).find('tr').each((_, row) => {
    if ($(row).find('th').length > 0) return;
    
    const year = $(row).find('td:nth-child(1)').text().trim();
    const firstRound = $(row).find('td:nth-child(2)').text().trim();
    const secondRound = $(row).find('td:nth-child(3)').text().trim();
    
    console.log('\nProcessing row:', { year, firstRound, secondRound });
    
    if (year) {
      // Parse first round picks
      if (firstRound) {
        const firstRoundPicks = parsePickDetails(firstRound, 1, year);
        console.log('First round picks parsed:', firstRoundPicks);
        picks.push(...firstRoundPicks);
      }
      
      // Parse second round picks
      if (secondRound) {
        const secondRoundPicks = parsePickDetails(secondRound, 2, year);
        console.log('Second round picks parsed:', secondRoundPicks);
        picks.push(...secondRoundPicks);
      }
    }
  });
  
  return picks;
};

// Function to parse individual pick details
const parsePickDetails = (pickText, round, year) => {
  const picks = [];
  console.log('\nParsing pick text:', pickText);
  
  // Split the text by semicolons to handle multiple picks
  const pickTexts = pickText.split(';').map(text => text.trim()).filter(text => text);
  console.log('Split into:', pickTexts);

  for (const text of pickTexts) {
    // Skip if the pick is traded away (starts with "To", case-insensitive, ignore whitespace)
    if (/^to /i.test(text)) {
      console.log('Skipping traded away pick:', text);
      continue;
    }

    const pickType = determinePickType(text);
    const pickNumber = parsePickNumber(text);
    console.log('Processing:', { text, pickType, pickNumber });

    // Add pick if:
    // 1. It has a pick number (for current year picks)
    // 2. It's a swap (for any year)
    // 3. It's an OWN pick (for future years)
    if (!pickNumber && !pickType.startsWith('SWAP') && pickType !== 'OWN') {
      console.log('Skipping pick without number, not a swap, and not OWN:', text);
      continue;
    }

    // Basic pick object
    const pick = {
      season: parseInt(year),
      round,
      pick_type: pickType,
      is_tradeable: true
    };

    // Add pick number if available
    if (pickNumber) {
      pick.pick_number = pickNumber;
    }

    // Try to extract original team if it's an acquired pick
    if (pickType === 'ACQUIRED') {
      const teamMatch = text.match(/([A-Z]{3})/);
      if (teamMatch) {
        pick.original_team = teamMatch[1];
        console.log('Found original team:', pick.original_team);
      }
    }

    // For swaps, store the basic swap text and try to extract involved teams
    if (pickType.startsWith('SWAP')) {
      pick.swap_details = text;
      const teamMatches = text.match(/([A-Z]{3})/g);
      if (teamMatches) {
        pick.swap_teams = [...new Set(teamMatches)];
      }
    }

    picks.push(pick);
  }

  return picks;
};

// Function to extract team name from table header
const getTeamName = ($, table) => {
  const headerText = $(table).prevAll('h2').first().text().trim();
  return headerText.replace(' Future NBA Draft Picks', '');
};

// Function to get pick value based on number
const getPickValue = (pickNumber) => {
  const valueMap = {
    1: 4000, 2: 3100, 3: 2670, 4: 2410, 5: 2240, 6: 2110, 7: 2000, 8: 1910, 9: 1830, 10: 1720,
    11: 1600, 12: 1500, 13: 1400, 14: 1320, 15: 1240, 16: 1180, 17: 1130, 18: 1080, 19: 1030,
    20: 980, 21: 920, 22: 860, 23: 800, 24: 750, 25: 700, 26: 660, 27: 620, 28: 570, 29: 520,
    30: 470, 31: 360, 32: 350, 33: 330, 34: 320, 35: 300, 36: 290, 37: 280, 38: 270, 39: 250,
    40: 240, 41: 230, 42: 220, 43: 210, 44: 200, 45: 190, 46: 180, 47: 170, 48: 160, 49: 150,
    50: 140, 51: 130, 52: 120, 53: 110, 54: 100, 55: 90, 56: 90, 57: 80, 58: 70, 59: 60, 60: 50
  };
  return valueMap[pickNumber] || 0;
};

// Function to get normalized value based on number
const getNormalizedValue = (pickNumber) => {
  const normalizedMap = {
    1: 100.00, 2: 77.50, 3: 66.75, 4: 60.25, 5: 56.00, 6: 52.75, 7: 50.00, 8: 47.75, 9: 45.75,
    10: 43.00, 11: 40.00, 12: 37.50, 13: 35.00, 14: 33.00, 15: 31.00, 16: 29.50, 17: 28.25,
    18: 27.00, 19: 25.75, 20: 24.50, 21: 23.00, 22: 21.50, 23: 20.00, 24: 18.75, 25: 17.50,
    26: 16.50, 27: 15.50, 28: 14.25, 29: 13.00, 30: 11.75, 31: 9.00, 32: 8.75, 33: 8.25,
    34: 8.00, 35: 7.50, 36: 7.25, 37: 7.00, 38: 6.75, 39: 6.25, 40: 6.00, 41: 5.75, 42: 5.50,
    43: 5.25, 44: 5.00, 45: 4.75, 46: 4.50, 47: 4.25, 48: 4.00, 49: 3.75, 50: 3.50, 51: 3.25,
    52: 3.00, 53: 2.75, 54: 2.50, 55: 2.25, 56: 2.25, 57: 2.00, 58: 1.75, 59: 1.50, 60: 1.25
  };
  return normalizedMap[pickNumber] || 0;
};

// Function to calculate average value for a round
const calculateAverageValue = (round, pickType) => {
  // For first round swaps, use specific pick values
  if (round === 1) {
    if (pickType === 'SWAP_LF') {
      return getPickValue(20); // Use 20th pick value for LF swaps
    }
    if (pickType === 'SWAP_MF') {
      return getPickValue(10); // Use 10th pick value for MF swaps
    }
  }

  // For other cases, calculate the average
  const start = round === 1 ? 1 : 31;
  const end = round === 1 ? 30 : 60;
  let sum = 0;
  for (let i = start; i <= end; i++) {
    sum += getPickValue(i);
  }
  return sum / (end - start + 1);
};

// Function to calculate average normalized value for a round
const calculateAverageNormalizedValue = (round, pickType) => {
  // For first round swaps, use specific pick values
  if (round === 1) {
    if (pickType === 'SWAP_LF') {
      return getNormalizedValue(20); // Use 20th pick value for LF swaps
    }
    if (pickType === 'SWAP_MF') {
      return getNormalizedValue(10); // Use 10th pick value for MF swaps
    }
  }

  // For other cases, calculate the average
  const start = round === 1 ? 1 : 31;
  const end = round === 1 ? 30 : 60;
  let sum = 0;
  for (let i = start; i <= end; i++) {
    sum += getNormalizedValue(i);
  }
  return sum / (end - start + 1);
};

// Main function to refresh data
const refreshDraftPicks = async () => {
  try {
    console.log('Starting draft picks refresh...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Present' : 'Missing');
    
    const response = await axios.get(BASE_URL);
    console.log('Successfully fetched data from RealGM');
    
    const $ = cheerio.load(response.data);
    console.log('Successfully parsed HTML');
    
    // Find all draft pick tables
    const tables = $('table.table').get();
    console.log(`Found ${tables.length} team tables`);
    
    for (const table of tables) {
      const teamName = getTeamName($, table);
      console.log('\nProcessing team:', teamName);
      
      if (teamName) {
        try {
          // Get team ID from database
          const teamResult = await pool.query(
            'SELECT id FROM teams WHERE name = $1',
            [teamName]
          );
          
          if (teamResult.rows.length > 0) {
            const teamId = teamResult.rows[0].id;
            console.log('Found team ID:', teamId);
            
            // Delete existing picks for this team
            await pool.query(
              'DELETE FROM tradeable_picks WHERE team_id = $1',
              [teamId]
            );
            console.log('Deleted existing picks for team');
            
            const picks = parseDraftPicks($, table);
            console.log('Total picks found for team:', picks.length);
            
            // Process each pick
            for (const pick of picks) {
              try {
                // Add team_id
                pick.team_id = teamId;
                pick.original_team_id = teamId;
                
                // Calculate values
                if (pick.pick_number) {
                  pick.value = getPickValue(pick.pick_number);
                  pick.normalized_value = getNormalizedValue(pick.pick_number);
                } else {
                  pick.value = calculateAverageValue(pick.round, pick.pick_type);
                  pick.normalized_value = calculateAverageNormalizedValue(pick.round, pick.pick_type);
                }
                
                console.log('Final pick object before database insert:', pick);
                
                // Insert into database (no need for ON CONFLICT since we deleted old data)
                await pool.query(
                  `INSERT INTO tradeable_picks 
                   (team_id, original_team_id, season, round, pick_number, pick_type, 
                    protection_details, swap_details, value, normalized_value, is_tradeable)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                  [
                    pick.team_id,
                    pick.original_team_id,
                    pick.season,
                    pick.round,
                    pick.pick_number,
                    pick.pick_type,
                    pick.protection_details,
                    pick.swap_details,
                    pick.value,
                    pick.normalized_value,
                    pick.is_tradeable
                  ]
                );
                console.log('Successfully inserted pick');
              } catch (pickError) {
                console.error('Error processing pick:', pickError);
                console.error('Pick that caused error:', pick);
              }
            }
          } else {
            console.log('Team not found in database:', teamName);
          }
        } catch (teamError) {
          console.error('Error processing team:', teamName, teamError);
        }
      }
    }
    
    console.log('Draft picks data refresh completed');
  } catch (error) {
    console.error('Error refreshing draft picks:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response'
    });
    throw error;
  }
};

export { refreshDraftPicks }; 