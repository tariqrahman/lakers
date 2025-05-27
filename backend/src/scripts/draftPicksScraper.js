import axios from "axios";
import * as cheerio from "cheerio";
import { Pool } from "pg";

const BASE_URL = "https://basketball.realgm.com/nba/draft/future_drafts/team";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const parsePickNumber = (text) => {
  const match = text.match(/#(\d+)/);
  return match ? parseInt(match[1]) : null;
};

const determinePickType = (text) => {
  if (
    text.includes("Least favorable") ||
    text.includes("LF") ||
    text.includes("least favorable") ||
    text.includes("less favorable")
  ) {
    return "SWAP_LF";
  }
  if (
    text.includes("Most favorable") ||
    text.includes("MF") ||
    text.includes("most favorable") ||
    text.includes("more favorable")
  ) {
    return "SWAP_MF";
  }
  if (
    text.includes("second most favorable") ||
    text.includes("two most favorable")
  ) {
    return "SWAP_MF"; // Treat as most favorable for simplicity
  }
  if (text.includes("third most favorable")) {
    return "SWAP_MF"; // Treat as most favorable for simplicity
  }

  if (text.includes("swap")) return "SWAP"; // Generic swap if we can't determine LF/MF
  if (text.includes("protected")) return "PROTECTED";

  if (text.match(/\b[A-Z]{3}\b/)) {
    return "ACQUIRED";
  }

  if (text.includes("Own")) return "OWN";

  return "ACQUIRED";
};

const parseDraftPicks = ($, table) => {
  const picks = [];

  $(table)
    .find("tr")
    .each((_, row) => {
      if ($(row).find("th").length > 0) return;

      const year = $(row).find("td:nth-child(1)").text().trim();
      const firstRound = $(row).find("td:nth-child(2)").text().trim();
      const secondRound = $(row).find("td:nth-child(3)").text().trim();

      console.log("\nProcessing row:", { year, firstRound, secondRound });

      if (year) {
        // Parse first round picks
        if (firstRound) {
          const firstRoundPicks = parsePickDetails(firstRound, 1, year);
          console.log("First round picks parsed:", firstRoundPicks);
          picks.push(...firstRoundPicks);
        }

        // Parse second round picks
        if (secondRound) {
          const secondRoundPicks = parsePickDetails(secondRound, 2, year);
          console.log("Second round picks parsed:", secondRoundPicks);
          picks.push(...secondRoundPicks);
        }
      }
    });

  return picks;
};

const parsePickDetails = (pickText, round, year) => {
  const picks = [];

  const pickTexts = pickText
    .split(";")
    .map((text) => text.trim())
    .filter((text) => text);

  for (const text of pickTexts) {
    if (/^to /i.test(text)) {
      continue;
    }

    const pickType = determinePickType(text);
    const pickNumber = parsePickNumber(text);

    if (!pickNumber && !pickType.startsWith("SWAP") && pickType !== "OWN") {
      console.log(
        "Skipping pick without number, not a swap, and not OWN:",
        text
      );
      continue;
    }

    const pick = {
      season: parseInt(year),
      round,
      pick_type: pickType,
      is_tradeable: true,
    };

    if (pickNumber) {
      pick.pick_number = pickNumber;
    }

    if (pickType === "ACQUIRED") {
      const teamMatch = text.match(/([A-Z]{3})/);
      if (teamMatch) {
        pick.original_team = teamMatch[1];
        console.log("Found original team:", pick.original_team);
      }
    }

    if (pickType.startsWith("SWAP")) {
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

const getTeamName = ($, table) => {
  const headerText = $(table).prevAll("h2").first().text().trim();
  return headerText.replace(" Future NBA Draft Picks", "");
};

const getPickValue = (pickNumber) => {
  const valueMap = {
    1: 4000,
    2: 3100,
    3: 2670,
    4: 2410,
    5: 2240,
    6: 2110,
    7: 2000,
    8: 1910,
    9: 1830,
    10: 1720,
    11: 1600,
    12: 1500,
    13: 1400,
    14: 1320,
    15: 1240,
    16: 1180,
    17: 1130,
    18: 1080,
    19: 1030,
    20: 980,
    21: 920,
    22: 860,
    23: 800,
    24: 750,
    25: 700,
    26: 660,
    27: 620,
    28: 570,
    29: 520,
    30: 470,
    31: 360,
    32: 350,
    33: 330,
    34: 320,
    35: 300,
    36: 290,
    37: 280,
    38: 270,
    39: 250,
    40: 240,
    41: 230,
    42: 220,
    43: 210,
    44: 200,
    45: 190,
    46: 180,
    47: 170,
    48: 160,
    49: 150,
    50: 140,
    51: 130,
    52: 120,
    53: 110,
    54: 100,
    55: 90,
    56: 90,
    57: 80,
    58: 70,
    59: 60,
    60: 50,
  };
  return valueMap[pickNumber] || 0;
};

const getNormalizedValue = (pickNumber) => {
  const normalizedMap = {
    1: 100.0,
    2: 77.5,
    3: 66.75,
    4: 60.25,
    5: 56.0,
    6: 52.75,
    7: 50.0,
    8: 47.75,
    9: 45.75,
    10: 43.0,
    11: 40.0,
    12: 37.5,
    13: 35.0,
    14: 33.0,
    15: 31.0,
    16: 29.5,
    17: 28.25,
    18: 27.0,
    19: 25.75,
    20: 24.5,
    21: 23.0,
    22: 21.5,
    23: 20.0,
    24: 18.75,
    25: 17.5,
    26: 16.5,
    27: 15.5,
    28: 14.25,
    29: 13.0,
    30: 11.75,
    31: 9.0,
    32: 8.75,
    33: 8.25,
    34: 8.0,
    35: 7.5,
    36: 7.25,
    37: 7.0,
    38: 6.75,
    39: 6.25,
    40: 6.0,
    41: 5.75,
    42: 5.5,
    43: 5.25,
    44: 5.0,
    45: 4.75,
    46: 4.5,
    47: 4.25,
    48: 4.0,
    49: 3.75,
    50: 3.5,
    51: 3.25,
    52: 3.0,
    53: 2.75,
    54: 2.5,
    55: 2.25,
    56: 2.25,
    57: 2.0,
    58: 1.75,
    59: 1.5,
    60: 1.25,
  };
  return normalizedMap[pickNumber] || 0;
};

const calculateAverageValue = (round, pickType) => {
  if (round === 1) {
    if (pickType === "SWAP_LF") {
      return getPickValue(20);
    }
    if (pickType === "SWAP_MF") {
      return getPickValue(10);
    }
  }

  const start = round === 1 ? 1 : 31;
  const end = round === 1 ? 30 : 60;
  let sum = 0;
  for (let i = start; i <= end; i++) {
    sum += getPickValue(i);
  }
  return sum / (end - start + 1);
};

const calculateAverageNormalizedValue = (round, pickType) => {
  if (round === 1) {
    if (pickType === "SWAP_LF") {
      return getNormalizedValue(20);
    }
    if (pickType === "SWAP_MF") {
      return getNormalizedValue(10);
    }
  }

  const start = round === 1 ? 1 : 31;
  const end = round === 1 ? 30 : 60;
  let sum = 0;
  for (let i = start; i <= end; i++) {
    sum += getNormalizedValue(i);
  }
  return sum / (end - start + 1);
};

const refreshDraftPicks = async () => {
  try {
    const response = await axios.get(BASE_URL);

    const $ = cheerio.load(response.data);

    const tables = $("table.table").get();

    for (const table of tables) {
      const teamName = getTeamName($, table);

      if (teamName) {
        try {
          const teamResult = await pool.query(
            "SELECT id FROM teams WHERE name = $1",
            [teamName]
          );

          if (teamResult.rows.length > 0) {
            const teamId = teamResult.rows[0].id;
            console.log("Found team ID:", teamId);

            await pool.query("DELETE FROM tradeable_picks WHERE team_id = $1", [
              teamId,
            ]);

            const picks = parseDraftPicks($, table);

            for (const pick of picks) {
              try {
                pick.team_id = teamId;
                pick.original_team_id = teamId;

                if (pick.pick_number) {
                  pick.value = getPickValue(pick.pick_number);
                  pick.normalized_value = getNormalizedValue(pick.pick_number);
                } else {
                  pick.value = calculateAverageValue(
                    pick.round,
                    pick.pick_type
                  );
                  pick.normalized_value = calculateAverageNormalizedValue(
                    pick.round,
                    pick.pick_type
                  );
                }

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
                    pick.is_tradeable,
                  ]
                );
              } catch (pickError) {}
            }
          } else {
          }
        } catch (teamError) {}
      }
    }
  } catch (error) {
    throw error;
  }
};

export { refreshDraftPicks };
