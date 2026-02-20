import { Player, Team } from '../types.ts';

/**
 * Gera times fixos.
 *
 * Regras:
 * - Máximo 7 por time
 * - Máximo 6 jogadores de linha
 * - Pode existir time sem goleiro
 * - Nunca improvisa goleiro
 */
export const generateFixedTeams = (confirmedPlayers: Player[]): Team[] => {
  const gks = confirmedPlayers.filter(p => p.position === 'Goleiro');
  const field = confirmedPlayers.filter(p => p.position !== 'Goleiro');

  const maxFieldPerTeam = 6;
  const maxPlayersPerTeam = 7;

  const totalPlayers = confirmedPlayers.length;
  const numTeams = Math.ceil(totalPlayers / maxPlayersPerTeam);

  const teams: Team[] = [];
  let gkIdx = 0;
  let fieldIdx = 0;

  for (let i = 0; i < numTeams; i++) {
    const teamPlayerIds: string[] = [];
    let fieldCount = 0;
    let hasGK = false;

    // 1️⃣ Tenta adicionar goleiro
    if (gkIdx < gks.length) {
      teamPlayerIds.push(gks[gkIdx].id);
      gkIdx++;
      hasGK = true;
    }

    // 2️⃣ Adiciona no máximo 6 jogadores de linha
    while (
      fieldIdx < field.length &&
      fieldCount < maxFieldPerTeam &&
      teamPlayerIds.length < maxPlayersPerTeam
    ) {
      teamPlayerIds.push(field[fieldIdx].id);
      fieldIdx++;
      fieldCount++;
    }

    teams.push({
      id: `team-${i + 1}`,
      name: `Time ${String.fromCharCode(65 + i)}`,
      playerIds: teamPlayerIds,
      hasGK,
      isComplete: hasGK && fieldCount === maxFieldPerTeam,
      consecutiveWins: 0,
      totalWins: 0
    });
  }

  return teams;
};
