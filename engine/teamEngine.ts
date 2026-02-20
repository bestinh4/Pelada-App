import { Player, Team } from '../types.ts';

export const generateFixedTeams = (confirmedPlayers: Player[]): Team[] => {
  const gks = confirmedPlayers.filter(p => p.position === 'Goleiro');
  const field = confirmedPlayers.filter(p => p.position !== 'Goleiro');

  const maxFieldPerTeam = 6;
  const maxTeamsByField = Math.ceil(field.length / maxFieldPerTeam);

  const teams: Team[] = [];

  let fieldIdx = 0;
  let gkIdx = 0;

  for (let i = 0; i < maxTeamsByField; i++) {
    const teamPlayerIds: string[] = [];

    // adiciona até 6 jogadores de linha
    for (let j = 0; j < maxFieldPerTeam && fieldIdx < field.length; j++) {
      teamPlayerIds.push(field[fieldIdx].id);
      fieldIdx++;
    }

    // adiciona goleiro apenas se existir
    if (gkIdx < gks.length) {
      teamPlayerIds.unshift(gks[gkIdx].id); // GK sempre primeiro
      gkIdx++;
    }

    teams.push({
      id: `team-${i + 1}`,
      name: `Time ${String.fromCharCode(65 + i)}`,
      playerIds: teamPlayerIds,
      hasGK: i < gks.length,
      isComplete: teamPlayerIds.length === 7,
      consecutiveWins: 0,
      totalWins: 0
    });
  }

  return teams;
};
