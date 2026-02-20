import { Player, Team } from '../types.ts';

/**
 * Regras:
 * - Máximo 7 jogadores por time (1 GK + 6 linha)
 * - Se não houver GK disponível:
 *      → time entra com no máximo 6 jogadores de linha
 * - Nunca improvisa goleiro
 */
export const generateFixedTeams = (confirmedPlayers: Player[]): Team[] => {
  const gks = confirmedPlayers.filter(p => p.position === 'Goleiro');
  const field = confirmedPlayers.filter(p => p.position !== 'Goleiro');

  const maxFieldPerTeam = 6;

  const teams: Team[] = [];

  let gkIdx = 0;
  let fieldIdx = 0;
  let teamIndex = 0;

  while (fieldIdx < field.length || gkIdx < gks.length) {

    const teamPlayerIds: string[] = [];
    let hasGK = false;
    let fieldCount = 0;

    // 🔹 Verifica se ainda tem goleiro disponível
    if (gkIdx < gks.length) {
      teamPlayerIds.push(gks[gkIdx].id);
      gkIdx++;
      hasGK = true;
    }

    // 🔹 Define limite total do time
    const maxPlayersThisTeam = hasGK ? 7 : 6;

    // 🔹 Adiciona no máximo 6 jogadores de linha
    while (
      fieldIdx < field.length &&
      fieldCount < maxFieldPerTeam &&
      teamPlayerIds.length < maxPlayersThisTeam
    ) {
      teamPlayerIds.push(field[fieldIdx].id);
      fieldIdx++;
      fieldCount++;
    }

    // Se o time ficou vazio (caso extremo), interrompe
    if (teamPlayerIds.length === 0) break;

    teams.push({
      id: `team-${teamIndex + 1}`,
      name: `Time ${String.fromCharCode(65 + teamIndex)}`,
      playerIds: teamPlayerIds,
      hasGK,
      isComplete: hasGK && fieldCount === 6,
      consecutiveWins: 0,
      totalWins: 0
    });

    teamIndex++;
  }

  return teams;
};
