// Sample pool of reflective messages. In production, all 564 would be stored here
// or fetched from a database. For demonstration, we cycle through a curated set.

const POOL = [
  "A clareza não chega quando força — chega quando escuta. Dê-se permissão para parar antes de avançar.",
  "Aquilo que evita é também aquilo que o ensina. Olhe sem julgamento e veja o que essa situação tem para lhe revelar.",
  "Confie no tempo das coisas. Nem tudo o que é importante acontece à velocidade que deseja.",
  "Não tem de ter todas as respostas hoje. Basta dar o próximo passo honesto.",
  "O silêncio também é uma resposta. Por vezes, a mais sábia.",
  "A pessoa que precisa de cuidar primeiro é aquela que vê no espelho. Comece por aí.",
  "Aquilo que procura fora de si já existe, em silêncio, dentro de si. Pare. Escute.",
  "A intuição fala baixo. O medo grita. Aprenda a distinguir as duas vozes.",
  "Mudar de ideias não é fraqueza — é sinal de que continua a observar com atenção.",
  "O que parece um obstáculo pode ser uma redirecção. Esteja aberto à possibilidade.",
  "Antes de decidir, pergunte: 'Estou a escolher por amor ou por medo?'",
  "Há valor em recomeçar. Recomeçar não é perder o que foi feito — é honrar o que aprendeu.",
  "Confie. Mesmo quando não consegue ver o caminho inteiro.",
  "Nem todas as portas que se fecham são perdas. Algumas são protecções.",
  "Permita-se sentir antes de querer resolver. Sentir já é metade do caminho.",
];

export function getMessageForNumber(n: number): string {
  // Deterministic mapping so the same number always returns the same message in this demo.
  const index = ((n - 1) % POOL.length + POOL.length) % POOL.length;
  return POOL[index];
}

export const TOTAL_MESSAGES = 564;
