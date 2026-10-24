import React, { useState } from 'react';
import type { Projection, Plan } from '../../../lib/anatomy/iso-kit';
import { Plate } from '../../../lib/anatomy/Plate';
import { Solid, Line } from '../../../lib/anatomy/Solid';
import { buildBasePlate, buildDialGauge } from '../kits/MechanicalKit';
import { buildServerRack, buildConduitPipes } from '../kits/EnterpriseKit';
import { buildIsoWindow } from '../kits/CanonicalKit';
import type { StudioPerspective } from '../PerspectiveSwitch';
import type { MethodDispatch } from '../CorrelationDock';

const P: Projection = {
  origin: [360, 220],
  scale: 1.5,
  azimuth: 45,
  elevation: 30,
};

export interface StrategyApparatusProps {
  perspective: StudioPerspective;
  theme?: string;
  onDispatch: (dispatch: MethodDispatch) => void;
}

export function StrategyApparatus({
  perspective,
  theme = 'dark',
  onDispatch,
}: StrategyApparatusProps) {
  // Strategy index: 0, 1, or 2
  const [strategyIndex, setStrategyIndex] = useState(0);
  const [traversing, setTraversing] = useState(false);
  const [carriagePosition, setCarriagePosition] = useState(0);

  // Generic Metaphor Geometry: Gantry Carriage & Rails
  const basePlan: Plan = { x: -160, y: -70, w: 320, d: 140, r: 8 };
  const basePlate = React.useMemo(() => buildBasePlate(basePlan, 10, 7, P), []);
  const tachometer = React.useMemo(() => buildDialGauge(110, -20, 22, 0, 10, P), []);

  // Enterprise Cloud Geometry: Load Balancer & Server Targets
  const lbPlan: Plan = { x: -140, y: -50, w: 70, d: 60, r: 4 };
  const loadBalancerRack = React.useMemo(() => buildServerRack(lbPlan, 0, 50, 2, P), []);
  const targetA = React.useMemo(() => buildServerRack({ x: 30, y: -70, w: 60, d: 45, r: 3 }, 0, 40, 2, P), []);
  const targetB = React.useMemo(() => buildServerRack({ x: 30, y: -10, w: 60, d: 45, r: 3 }, 0, 40, 2, P), []);
  const targetC = React.useMemo(() => buildServerRack({ x: 30, y: 50, w: 60, d: 45, r: 3 }, 0, 40, 2, P), []);
  const busConduitA = React.useMemo(() => buildConduitPipes([-70, -20, 15], [-20, -50, 15], [30, -50, 15], 2, P), []);
  const busConduitB = React.useMemo(() => buildConduitPipes([-70, -20, 15], [-20, 10, 15], [30, 10, 15], 2, P), []);
  const busConduitC = React.useMemo(() => buildConduitPipes([-70, -20, 15], [-20, 70, 15], [30, 70, 15], 2, P), []);

  // Canonical Desktop Geometry: GPS Route Map Window
  const mapPlan: Plan = { x: -130, y: -70, w: 260, d: 140, r: 6 };
  const mapWindow = React.useMemo(() => buildIsoWindow(mapPlan, 0, 'mac', P), []);

  const strategies = perspective === 'enterprise'
    ? [
        { name: 'RoundRobinStrategy', label: 'Round Robin', desc: 'Distributes requests sequentially 1:1 across cluster.' },
        { name: 'LeastConnectionsStrategy', label: 'Least Connections', desc: 'Routes traffic to the node with lowest active sessions.' },
        { name: 'IpHashStrategy', label: 'IP Hash', desc: 'Consistently maps client IP hash to target server.' },
      ]
    : perspective === 'canonical'
    ? [
        { name: 'FastestRouteStrategy', label: 'Fastest Highway', desc: 'Maximizes speed limits via interstate CA-101.' },
        { name: 'ScenicRouteStrategy', label: 'Scenic Coast', desc: 'Prioritizes tourist viewpoints along Highway 1.' },
        { name: 'LowTollStrategy', label: 'Low-Toll Inland', desc: 'Avoids bridge tolls via state route CA-152.' },
      ]
    : [
        { name: 'OverdrivePlanetaryGear', label: 'Planetary Overdrive', desc: 'High gear ratio 4.2:1 for rapid traverse.' },
        { name: 'WormReductionDrive', label: 'Worm Reduction', desc: 'High torque ratio 24:1 for precision cutting.' },
        { name: 'StepperRatchetCartridge', label: 'Stepper Ratchet', desc: 'Fixed indexed displacement of 2.5mm per cycle.' },
      ];

  const handleSelectStrategy = (index: number) => {
    setStrategyIndex(index);
    const selected = strategies[index]!;
    onDispatch({
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString(),
      caller: 'NavigatorContext',
      method: 'setStrategy',
      status: 'ok',
      detail: `Swapped active algorithm to ${selected.name} (${selected.label}).`,
    });
  };

  const handleExecute = () => {
    setTraversing(true);
    setCarriagePosition((p) => (p >= 80 ? 0 : p + 40));
    setTimeout(() => setTraversing(false), 900);

    const selected = strategies[strategyIndex]!;
    onDispatch({
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString(),
      caller: selected.name,
      method: 'executeAlgorithm',
      status: 'ok',
      detail: `Executed plan: ${selected.desc}`,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Controls Bar */}
      <div className="flex items-center justify-between px-2 py-1 bg-muted/20 rounded-md border border-border/30 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground font-medium text-[11px]">Select Strategy:</span>
          {strategies.map((s, i) => (
            <button
              key={s.name}
              type="button"
              onClick={() => handleSelectStrategy(i)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                strategyIndex === i
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleExecute}
          className="px-3 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20"
        >
          Execute Algorithm
        </button>
      </div>

      {/* Main Perspective Plate */}
      {perspective === 'generic' && (
        <Plate
          fig="FIG 03"
          title="STRATEGY / GANTRY CARRIAGE WITH SWAPPABLE TRANSMISSION GEARBOXES"
          category="BEHAVIORAL"
          hint="Click strategy buttons to swap gear cartridge · Click 'Execute' to traverse gantry carriage"
          readout={`ACTIVE GEARBOX: ${strategies[strategyIndex]!.name} · RATIO: ${strategyIndex === 0 ? '4.2:1' : strategyIndex === 1 ? '24:1' : '1:1 STEP'} · STATUS: ${traversing ? 'TRAVERSING' : 'READY'}`}
          theme={theme}
        >
          <Solid paths={basePlate.slab} tone="mid" halo />
          <Line d={basePlate.groove} tone="faint" />
          {basePlate.feet.map((f, i) => (
            <Solid key={i} paths={f} tone="lo" />
          ))}

          {/* Gantry Moving Carriage */}
          <g
            className="transition-transform duration-700"
            transform={`translate(${carriagePosition * 1.2}, ${carriagePosition * 0.4})`}
          >
            <Solid paths={tachometer.caseSlab} tone="hi" lit={traversing} />
            <Line d={tachometer.bezelRing} tone="lit" />
          </g>
        </Plate>
      )}

      {perspective === 'enterprise' && (
        <Plate
          fig="FIG 03"
          title="STRATEGY / CLOUD INGRESS LOAD BALANCER DISPATCH ALGORITHMS"
          category="BEHAVIORAL"
          hint="Click strategy buttons to change routing policy · Watch request packets balance to targets"
          readout={`POLICY: ${strategies[strategyIndex]!.name} · TARGET NODES: 3 PODS · INGRESS FLOW: ${traversing ? 'DISPATCHING' : 'IDLE'}`}
          theme={theme}
        >
          {/* Load Balancer Gateway */}
          <Solid paths={loadBalancerRack.basePlate} tone="lo" />
          <Solid paths={loadBalancerRack.chassis} tone="hi" lit={traversing}>
            {loadBalancerRack.bays.map((bay, i) => (
              <Solid key={i} paths={bay} tone="mid" />
            ))}
          </Solid>

          {/* Conduit Routing Pipes */}
          <Line d={busConduitA.path} tone="blue" flow={traversing && strategyIndex === 0} />
          <Line d={busConduitB.path} tone="green" flow={traversing && (strategyIndex === 1 || strategyIndex === 0)} />
          <Line d={busConduitC.path} tone="red" flow={traversing && strategyIndex === 2} />

          {/* Target Cluster Server Nodes */}
          <Solid paths={targetA.chassis} tone="mid" lit={strategyIndex === 0 && traversing} />
          <Solid paths={targetB.chassis} tone="mid" lit={strategyIndex === 1 && traversing} />
          <Solid paths={targetC.chassis} tone="mid" lit={strategyIndex === 2 && traversing} />
        </Plate>
      )}

      {perspective === 'canonical' && (
        <Plate
          fig="FIG 03"
          title="STRATEGY / GPS ROUTE CALCULATOR WITH PLUGGABLE ROUTE ALGORITHMS"
          category="BEHAVIORAL"
          hint="Select algorithm (Highway vs Scenic vs Inland) · Navigator executes route calculation"
          readout={`ROUTE STRATEGY: ${strategies[strategyIndex]!.name} · DISTANCE: ${strategyIndex === 0 ? '92 miles (Highway)' : strategyIndex === 1 ? '118 miles (Scenic)' : '104 miles (Inland)'} · TOLL: ${strategyIndex === 2 ? '$0.00' : '$7.50'}`}
          theme={theme}
        >
          <Solid paths={mapWindow.frame} tone="mid" />
          <Solid paths={mapWindow.titleBar} tone="hi" />
          <Line d={mapWindow.contentPane} tone="faint" />

          {/* Render Route Waypoint Trace */}
          <g transform={`translate(${carriagePosition}, 0)`}>
            <circle cx="360" cy="220" r="6" fill={strategyIndex === 0 ? '#3e63dd' : strategyIndex === 1 ? '#30a46c' : '#f59e0b'} />
          </g>
        </Plate>
      )}
    </div>
  );
}
