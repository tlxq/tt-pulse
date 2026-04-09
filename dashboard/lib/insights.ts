export interface NodeData {
  name: string;
  cpu: number;
  ram: number;
  temp: number;
  online: boolean;
  git_commits_24h?: number;
}

export type Guardian = 'texas' | 'gosta';

// ── Texas (Bengal) — excitable, chaotic energy ───────────────────────────────

function getTexasFunnyFact(nodes: NodeData[], commits: string[]) {
  const totalCpu = nodes.reduce((acc, n) => acc + n.cpu, 0);
  const avgRam = nodes.length > 0 ? Math.round(nodes.reduce((acc, n) => acc + n.ram, 0) / nodes.length) : 0;
  const maxTemp = nodes.length > 0 ? Math.max(...nodes.map(n => n.temp)) : 0;
  const totalCommits = commits.length;
  const highLoadNode = nodes.find(n => n.cpu > 70);
  const mostCommits = Math.max(...nodes.map(n => n.git_commits_24h || 0));

  const facts = [
    `Fun fact: At ${totalCpu}% total CPU, we have enough raw power to simulate a small galaxy... or at least run Chrome with 4 tabs open.`,
    `Data alert: The family's average RAM usage is ${avgRam}%. We're officially using more memory than the Apollo 11 moon landing.`,
    `Hustle report: ${totalCommits} conquests recently. If code were coffee, we'd be vibrating at a cellular level by now.`,
    `Mascot observation: ${highLoadNode ? highLoadNode.name : 'The cluster'} is purring quite loudly. I suspect some heavy-duty math is happening.`,
    `Efficiency check: With ${mostCommits} logs on our top station, we're out-pacing a caffeinated squirrel on a deadline.`,
    `Thermal update: We've hit ${maxTemp}°C on our hottest node. Radiating enough heat to keep my Bengal paws warm all winter!`,
    `Network whisper: Our latency is so low, I can practically see the bits moving before they even decide where to go.`
  ];

  return facts[Math.floor(Math.random() * facts.length)];
}

const BENGAL_PERSONALITY = {
  STRESSED: [
    "Hiss! Someone's pouncing on those tasks! Station {name} is getting quite warm at {temp}°C.",
    "My whiskers are twitching! {name} is pushing {cpu}% CPU. That's a lot of hunting!",
    "Grrr... heavy lifting detected. I'm watching the thermal levels ({temp}°C) closely, Human."
  ],
  PRODUCTIVE: [
    "Prrrrt! {count} commits secured. The code harvest is looking magnificent today.",
    "I see fresh logs! The family is marking the digital landscape with pure productivity.",
    "Magnificent! Your momentum is legendary. I've noted every single one of those {count} updates."
  ],
  IDLE: [
    "The studio is quiet. I'll take the high ground and monitor the resting pulse.",
    "Purrr... serene levels across the stations. A perfect time for some digital grooming.",
    "All systems nominal. I'm just here for the server-rack warmth and the occasional data packet."
  ],
  DEGRADED: [
    "Mrow? A station has gone to sleep. I've lost the scent of the connection.",
    "The link is tangled. I'm batting at the wires, but {name} remains silent.",
    "A gap in our lineup! I'll stay on high alert until the full pack returns."
  ]
};

// ── Gösta (Devon Rex) — dry, sardonic, dignified ─────────────────────────────

function getGostaFunnyFact(nodes: NodeData[], commits: string[]) {
  const totalCpu = nodes.reduce((acc, n) => acc + n.cpu, 0);
  const avgRam = nodes.length > 0 ? Math.round(nodes.reduce((acc, n) => acc + n.ram, 0) / nodes.length) : 0;
  const maxTemp = nodes.length > 0 ? Math.max(...nodes.map(n => n.temp)) : 0;
  const totalCommits = commits.length;

  const facts = [
    `I note that total CPU consumption stands at ${totalCpu}%. Acceptable, I suppose. I've seen higher from humans trying to open a spreadsheet.`,
    `Average RAM at ${avgRam}%. One could describe this as efficient. I prefer "not embarrassing."`,
    `${totalCommits} commits. I have catalogued each one from my ledge. You are welcome.`,
    `Peak temperature: ${maxTemp}°C. I myself maintain a dignified warmth at all times. The machines are merely attempting to keep up.`,
    `I have conducted a thorough inspection of all metrics. They are, as I suspected, mediocre. Yet somehow... improving.`,
    `From my vantage point, I observe the studio hums along adequately. I shall refrain from further commentary at this time.`,
    `The data suggests productivity. I neither confirm nor deny having predicted this outcome from the beginning.`
  ];

  return facts[Math.floor(Math.random() * facts.length)];
}

const GOSTA_PERSONALITY = {
  STRESSED: [
    "I see {name} is straining at {cpu}% CPU. How... pedestrian. I'll observe from a safe distance.",
    "Elevated temperatures on {name}. {temp}°C. I disapprove of excess, in all its forms.",
    "The workload appears substantial. One notes this without particular alarm, merely mild disdain."
  ],
  PRODUCTIVE: [
    "{count} commits. Adequate output. Don't expect me to be impressed — though I may be, marginally.",
    "Work has been committed. I've noted it from my ledge. You may proceed.",
    "I see {count} fresh logs. The studio produces. I tolerate the noise, for now."
  ],
  IDLE: [
    "The studio is blessedly quiet. Finally, some decorum. I shall observe from my ledge.",
    "All metrics at rest. As they should be. I have always said: stillness is underrated.",
    "Nothing of consequence is happening. This is, broadly speaking, my preference."
  ],
  DEGRADED: [
    "A station has gone dark. Regrettably, {name} has chosen absence. I disapprove.",
    "{name} is silent. I find this both irritating and unsurprising.",
    "The perimeter has a gap. I've noted it. Fixing it is, apparently, your responsibility."
  ]
};

// ── Shared logic ──────────────────────────────────────────────────────────────

import { FUNNY_FACT_PROBABILITY } from './constants';

export function getInsight(nodes: NodeData[], commits: string[], guardian: Guardian = 'texas') {
  const onlineNodes = nodes.filter(n => n.online);
  const offlineNodes = nodes.filter(n => !n.online);
  const highLoadNode = onlineNodes.find(n => n.cpu > 75 || n.ram > 80 || n.temp > 80);
  const totalCommits = commits.length;

  const personality = guardian === 'gosta' ? GOSTA_PERSONALITY : BENGAL_PERSONALITY;
  const getFunnyFact = guardian === 'gosta' ? getGostaFunnyFact : getTexasFunnyFact;

  // 1/3 chance to show a "Cool Fact" instead of a status report
  if (Math.random() > FUNNY_FACT_PROBABILITY && nodes.length > 0) {
    return getFunnyFact(nodes, commits);
  }

  if (offlineNodes.length > 0) {
    const random = personality.DEGRADED[Math.floor(Math.random() * personality.DEGRADED.length)];
    return random.replace('{name}', offlineNodes[0].name);
  }

  if (highLoadNode) {
    const random = personality.STRESSED[Math.floor(Math.random() * personality.STRESSED.length)];
    return random
      .replace('{name}', highLoadNode.name)
      .replace('{cpu}', highLoadNode.cpu.toString())
      .replace('{temp}', highLoadNode.temp.toString());
  }

  if (totalCommits > 0) {
    const random = personality.PRODUCTIVE[Math.floor(Math.random() * personality.PRODUCTIVE.length)];
    return random.replace('{count}', totalCommits.toString());
  }

  return personality.IDLE[Math.floor(Math.random() * personality.IDLE.length)];
}
