export interface NodeData {
  name: string;
  cpu: number;
  ram: number;
  temp: number;
  online: boolean;
  git_commits_24h?: number;
}

function getFunnyFact(nodes: NodeData[], commits: string[]) {
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

import { FUNNY_FACT_PROBABILITY } from './constants';

export function getInsight(nodes: NodeData[], commits: string[]) {
  const onlineNodes = nodes.filter(n => n.online);
  const offlineNodes = nodes.filter(n => !n.online);
  const highLoadNode = onlineNodes.find(n => n.cpu > 75 || n.ram > 80 || n.temp > 80);
  const totalCommits = commits.length;

  // 1/3 chance to show a "Cool Fact" instead of a status report
  if (Math.random() > FUNNY_FACT_PROBABILITY && nodes.length > 0) {
    return getFunnyFact(nodes, commits);
  }

  if (offlineNodes.length > 0) {
    const random = BENGAL_PERSONALITY.DEGRADED[Math.floor(Math.random() * BENGAL_PERSONALITY.DEGRADED.length)];
    return random.replace('{name}', offlineNodes[0].name);
  }

  if (highLoadNode) {
    const random = BENGAL_PERSONALITY.STRESSED[Math.floor(Math.random() * BENGAL_PERSONALITY.STRESSED.length)];
    return random.replace('{name}', highLoadNode.name)
                 .replace('{cpu}', highLoadNode.cpu.toString())
                 .replace('{temp}', highLoadNode.temp.toString());
  }

  if (totalCommits > 0) {
    const random = BENGAL_PERSONALITY.PRODUCTIVE[Math.floor(Math.random() * BENGAL_PERSONALITY.PRODUCTIVE.length)];
    return random.replace('{count}', totalCommits.toString());
  }

  return BENGAL_PERSONALITY.IDLE[Math.floor(Math.random() * BENGAL_PERSONALITY.IDLE.length)];
}
