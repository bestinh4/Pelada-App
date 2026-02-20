import { Player, Team } from '../types.ts';

export const generateFixedTeams = (confirmedPlayers: Player[]): Team[] => {
  const gks = confirmedPlayers.filter(p => p.position === 'Goleiro');
  const field = confirmedPlayers.filter(p => p.position !== 'Goleiro');

  const maxFieldPerTeam = 6;

  const teams: Team[] = [];
  let fieldIdx = 0;
  let teamIndex = 0;

  // =============================
  // 🔹 FASE 1 — TIMES COM GK
  // =============================
  const possibleTeamsWithGK = Math.min(
    gks.length,
    Math.floor(field.length / maxFieldPerTeam)
  );

  for (let i = 0; i < possibleTeamsWithGK; i++) {
    const teamPlayerIds: string[] = [];

    // 1 GK
    teamPlayerIds.push(gks[i].id);

    // 6 jogadores de linha
    for (let j = 0; j < maxFieldPerTeam; j++) {
      teamPlayerIds.push(field[fieldIdx].id);
      fieldIdx++;
    }

    teams.push({
      id: `team-${teamIndex + 1}`,
      name: `Time ${String.fromCharCode(65 + teamIndex)}`,
      playerIds: teamPlayerIds,
      hasGK: true,
      isComplete: true,
      consecutiveWins: 0,
      totalWins: 0
    });

    teamIndex++;
  }

  // =============================
  // 🔹 FASE 2 — TIMES SEM GK
  // =============================
  const remainingField = field.length - fieldIdx;
  const possibleTeamsWithoutGK = Math.floor(remainingField / maxFieldPerTeam);

  for (let i = 0; i < possibleTeamsWithoutGK; i++) {
    const teamPlayerIds: string[] = [];

    for (let j = 0; j < maxFieldPerTeam; j++) {
      teamPlayerIds.push(field[fieldIdx].id);
      fieldIdx++;
    }

    teams.push({
      id: `team-${teamIndex + 1}`,
      name: `Time ${String.fromCharCode(65 + teamIndex)}`,
      playerIds: teamPlayerIds,
      hasGK: false,
      isComplete: false,
      consecutiveWins: 0,
      totalWins: 0
    });

    teamIndex++;
  }

  return teams;
};
