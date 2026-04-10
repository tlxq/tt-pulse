export interface NodeData {
  name: string;
  cpu: number;
  ram: number;
  temp: number;
  online: boolean;
  git_commits_24h?: number;
}

export type Guardian = 'texas' | 'gosta';

// ── Texas (Bengal) — direct, engaged, urgent ─────────────────────────────────

function getTexasFunnyFact(nodes: NodeData[], commits: string[]) {
  const totalCpu = nodes.reduce((acc, n) => acc + n.cpu, 0);
  const avgRam = nodes.length > 0 ? Math.round(nodes.reduce((acc, n) => acc + n.ram, 0) / nodes.length) : 0;
  const avgCpu = nodes.length > 0 ? Math.round(totalCpu / nodes.length) : 0;
  const maxTemp = nodes.length > 0 ? Math.max(...nodes.map(n => n.temp)) : 0;
  const totalCommits = commits.length;
  const activeCount = nodes.filter(n => n.online).length;
  const nodeCount = nodes.length;
  const topNode = [...nodes].sort((a, b) => (b.git_commits_24h || 0) - (a.git_commits_24h || 0))[0];
  const topName = topNode?.name ?? 'none';
  const topCommits = topNode?.git_commits_24h ?? 0;

  const facts = [
    `Cluster report: ${totalCpu}% combined CPU load across ${nodeCount} stations. Heavy work — or someone left a browser open.`,
    `RAM average: ${avgRam}%. ${avgRam > 70 ? 'Getting cozy up there.' : 'Plenty of room to hunt.'}`,
    `${totalCommits} commits today. ${totalCommits === 0 ? 'Rest day, apparently.' : "The pack's productivity confirmed."}`,
    `Thermal scan: max ${maxTemp}°C. ${maxTemp > 75 ? 'Warm — fan curves might need attention.' : 'All within tolerance.'}`,
    `${activeCount}/${nodeCount} nodes online. ${activeCount === nodeCount ? 'Full pack. Good.' : 'Someone is sleeping on the job.'}`,
    `Top station: ${topName} with ${topCommits} commits. I watched every single push.`,
    `CPU average: ${avgCpu}%. ${avgCpu > 60 ? 'Solid effort.' : 'Light day. Systems coasting.'}`,
  ];

  return facts[Math.floor(Math.random() * facts.length)];
}

const BENGAL_PERSONALITY = {
  STRESSED: [
    "⚠ {name}: CPU {cpu}%, {temp}°C — locked on. Check top processes now.",
    "Alert — {name} thermal-spiking at {temp}°C and {cpu}% CPU load. Not playing around.",
    "Grrr. {name} maxing out — {cpu}% CPU, {ram}% RAM. Something's hunting this machine.",
  ],
  PRODUCTIVE: [
    "Logged: {count} commits across all stations. Today's hunt is going well — keep it moving.",
    "Prrrrt — {count} pushes. Velocity is strong. I've marked every single one.",
    "{count} commits. All stations contributing. The code harvest is real today.",
  ],
  IDLE: [
    "All stations nominal. CPU avg {avgCpu}%, RAM avg {avgRam}%. Quiet enough for a nap — but I'm watching.",
    "Nothing alarming. {activeCount}/{nodeCount} nodes online, all under load threshold. Monitoring pulse: steady.",
    "Systems at rest. {avgCpu}% avg CPU across {nodeCount} stations. I'll keep the high ground warm.",
  ],
  DEGRADED: [
    "⚠ {name} has gone dark — connection lost. Needs investigating.",
    "Station {name} is offline. {activeCount} of {nodeCount} nodes reporting. Tracking the gap.",
    "Lost contact with {name}. {activeCount}/{nodeCount} active. Eyes open.",
  ]
};

// ── Gösta (Devon Rex) — dry precision, mild contempt ─────────────────────────

function getGostaFunnyFact(nodes: NodeData[], commits: string[]) {
  const totalCpu = nodes.reduce((acc, n) => acc + n.cpu, 0);
  const avgRam = nodes.length > 0 ? Math.round(nodes.reduce((acc, n) => acc + n.ram, 0) / nodes.length) : 0;
  const avgCpu = nodes.length > 0 ? Math.round(totalCpu / nodes.length) : 0;
  const maxTemp = nodes.length > 0 ? Math.max(...nodes.map(n => n.temp)) : 0;
  const totalCommits = commits.length;
  const activeCount = nodes.filter(n => n.online).length;
  const nodeCount = nodes.length;
  const topNode = [...nodes].sort((a, b) => (b.git_commits_24h || 0) - (a.git_commits_24h || 0))[0];
  const topName = topNode?.name ?? 'undetermined';
  const topCommits = topNode?.git_commits_24h ?? 0;

  const facts = [
    `CPU aggregate: ${totalCpu}%. I'll let you calculate the efficiency ratio — you may not find it comforting.`,
    `${totalCommits} commits today. I have inspected each one. The quality varies.`,
    `RAM average: ${avgRam}%. ${avgRam > 75 ? 'Not a crisis. Merely inelegant.' : 'Within acceptable parameters. For now.'}`,
    `Peak temperature: ${maxTemp}°C. The hardware is attempting to keep up. I sympathise, marginally.`,
    `${activeCount} of ${nodeCount} nodes reporting. ${activeCount < nodeCount ? 'One is conspicuously absent. I have opinions.' : 'Full complement. As it should be.'}`,
    `Top station: ${topName}. ${topCommits} commits. I have formed an opinion about this workload distribution.`,
    `CPU average: ${avgCpu}%. ${avgCpu < 30 ? 'Underutilised, if you ask me.' : avgCpu > 70 ? 'Strained, but functional.' : 'Mediocre. Consistent with expectations.'}`,
  ];

  return facts[Math.floor(Math.random() * facts.length)];
}

const GOSTA_PERSONALITY = {
  STRESSED: [
    "{name} at {cpu}% CPU, {temp}°C. Excessive, as usual. The processes presumably know what they are doing.",
    "I observe {name} in a state of elevated resource consumption — {cpu}% CPU. Disorderly, but noted.",
    "Thermal event on {name}: {temp}°C. I disapprove. {cpu}% CPU is also not ideal. The report is complimentary.",
  ],
  PRODUCTIVE: [
    "{count} commits. Logged, catalogued, filed. The studio functions. I take no credit — nor do I assign any.",
    "Output: {count} commits across {nodeCount} stations. Acceptable. I neither applaud nor condemn.",
    "{count} pushes. The velocity is, I concede, not embarrassing. You may continue.",
  ],
  IDLE: [
    "All {nodeCount} stations nominal. CPU avg {avgCpu}%, RAM avg {avgRam}%. Order is maintained.",
    "Quiet. {activeCount}/{nodeCount} nodes online, all within thresholds. This is how things should be.",
    "Nothing requires my intervention. CPU avg {avgCpu}%. I shall observe from my ledge.",
  ],
  DEGRADED: [
    "{name} is absent from the network. {activeCount} of {nodeCount} remain. Irritating, though unsurprising.",
    "Station {name} has gone dark. I noted the anomaly. Fixing it is, however, your problem.",
    "The perimeter is compromised — {name} offline. {activeCount}/{nodeCount} active. I am displeased.",
  ]
};

// ── Shared logic ──────────────────────────────────────────────────────────────

import { FUNNY_FACT_PROBABILITY } from './constants';

export function getInsight(nodes: NodeData[], commits: string[], guardian: Guardian = 'texas') {
  const onlineNodes = nodes.filter(n => n.online);
  const offlineNodes = nodes.filter(n => !n.online);
  const highLoadNode = onlineNodes.find(n => n.cpu > 75 || n.ram > 80 || n.temp > 80);
  const totalCommits = commits.length;

  const avgCpu = onlineNodes.length > 0
    ? Math.round(onlineNodes.reduce((acc, n) => acc + n.cpu, 0) / onlineNodes.length)
    : 0;
  const avgRam = onlineNodes.length > 0
    ? Math.round(onlineNodes.reduce((acc, n) => acc + n.ram, 0) / onlineNodes.length)
    : 0;
  const activeCount = onlineNodes.length;
  const nodeCount = nodes.length;

  const personality = guardian === 'gosta' ? GOSTA_PERSONALITY : BENGAL_PERSONALITY;
  const getFunnyFact = guardian === 'gosta' ? getGostaFunnyFact : getTexasFunnyFact;

  // 1/3 chance to show a "Cool Fact" instead of a status report
  if (Math.random() > FUNNY_FACT_PROBABILITY && nodes.length > 0) {
    return getFunnyFact(nodes, commits);
  }

  if (offlineNodes.length > 0) {
    const random = personality.DEGRADED[Math.floor(Math.random() * personality.DEGRADED.length)];
    return random
      .replace('{name}', offlineNodes[0].name)
      .replace('{activeCount}', activeCount.toString())
      .replace('{nodeCount}', nodeCount.toString());
  }

  if (highLoadNode) {
    const random = personality.STRESSED[Math.floor(Math.random() * personality.STRESSED.length)];
    return random
      .replace('{name}', highLoadNode.name)
      .replace('{cpu}', highLoadNode.cpu.toString())
      .replace('{temp}', highLoadNode.temp.toString())
      .replace('{ram}', highLoadNode.ram.toString());
  }

  if (totalCommits > 0) {
    const random = personality.PRODUCTIVE[Math.floor(Math.random() * personality.PRODUCTIVE.length)];
    return random
      .replace('{count}', totalCommits.toString())
      .replace('{nodeCount}', nodeCount.toString());
  }

  const random = personality.IDLE[Math.floor(Math.random() * personality.IDLE.length)];
  return random
    .replace('{avgCpu}', avgCpu.toString())
    .replace('{avgRam}', avgRam.toString())
    .replace('{activeCount}', activeCount.toString())
    .replace('{nodeCount}', nodeCount.toString());
}
