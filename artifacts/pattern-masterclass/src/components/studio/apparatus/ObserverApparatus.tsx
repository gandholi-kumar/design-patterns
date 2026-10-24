import React, { useState } from 'react';
import type { Projection, Plan } from '../../../lib/anatomy/iso-kit';
import { Plate } from '../../../lib/anatomy/Plate';
import { Solid, Line } from '../../../lib/anatomy/Solid';
import { buildBasePlate, buildDialGauge, buildSpringRod } from '../kits/MechanicalKit';
import { buildServerRack, buildStorageCanister, buildConduitPipes } from '../kits/EnterpriseKit';
import { buildIsoWindow, buildIsoButton } from '../kits/CanonicalKit';
import type { StudioPerspective } from '../PerspectiveSwitch';
import type { MethodDispatch } from '../CorrelationDock';

const P: Projection = {
  origin: [360, 220],
  scale: 1.5,
  azimuth: 45,
  elevation: 30,
};

export interface ObserverApparatusProps {
  perspective: StudioPerspective;
  theme?: string;
  onDispatch: (dispatch: MethodDispatch) => void;
}

export function ObserverApparatus({
  perspective,
  theme = 'dark',
  onDispatch,
}: ObserverApparatusProps) {
  // Common event state
  const [activeStations, setActiveStations] = useState<[boolean, boolean, boolean]>([true, true, true]);
  const [pulseCount, setPulseCount] = useState(0);
  const [pulseActive, setPulseActive] = useState(false);

  // Generic Metaphor Geometry: Pneumatic Annunciator Rig
  const basePlan: Plan = { x: -160, y: -80, w: 320, d: 160, r: 8 };
  const basePlate = React.useMemo(() => buildBasePlate(basePlan, 12, 8, P), []);
  const dialA = React.useMemo(() => buildDialGauge(-100, 30, 24, 0, 10, P), []);
  const dialB = React.useMemo(() => buildDialGauge(0, 30, 24, 0, 10, P), []);
  const dialC = React.useMemo(() => buildDialGauge(100, 30, 24, 0, 10, P), []);
  const plunger = React.useMemo(() => buildSpringRod(-40, 40, -40, 20, 4, 8, 5, P), []);

  // Enterprise Cloud Geometry: EventBridge & Microservices
  const brokerPlan: Plan = { x: -40, y: -60, w: 80, d: 60, r: 4 };
  const brokerRack = React.useMemo(() => buildServerRack(brokerPlan, -5, 60, 2, P), []);
  const serviceA = React.useMemo(() => buildStorageCanister(-110, 20, 20, 0, 40, P), []);
  const serviceB = React.useMemo(() => buildStorageCanister(0, 40, 20, 0, 40, P), []);
  const serviceC = React.useMemo(() => buildStorageCanister(110, 20, 20, 0, 40, P), []);
  const conduitA = React.useMemo(() => buildConduitPipes([-20, -30, 10], [-60, 0, 10], [-110, 20, 10], 2, P), []);
  const conduitB = React.useMemo(() => buildConduitPipes([0, -30, 10], [0, 0, 10], [0, 40, 10], 2, P), []);
  const conduitC = React.useMemo(() => buildConduitPipes([20, -30, 10], [60, 0, 10], [110, 20, 10], 2, P), []);

  // Canonical Desktop Geometry: Stock Ticker Windows
  const tickerPlan: Plan = { x: -130, y: -70, w: 260, d: 50, r: 4 };
  const tickerWindow = React.useMemo(() => buildIsoWindow(tickerPlan, 0, 'mac', P), []);
  const chartAPlan: Plan = { x: -130, y: 0, w: 80, d: 70, r: 4 };
  const chartWindowA = React.useMemo(() => buildIsoWindow(chartAPlan, 0, 'mac', P), []);
  const chartBPlan: Plan = { x: -40, y: 0, w: 80, d: 70, r: 4 };
  const chartWindowB = React.useMemo(() => buildIsoWindow(chartBPlan, 0, 'mac', P), []);
  const chartCPlan: Plan = { x: 50, y: 0, w: 80, d: 70, r: 4 };
  const chartWindowC = React.useMemo(() => buildIsoWindow(chartCPlan, 0, 'mac', P), []);

  const handleToggleStation = (index: 0 | 1 | 2, name: string) => {
    setActiveStations((prev) => {
      const next: [boolean, boolean, boolean] = [...prev];
      next[index] = !next[index];
      const isAttached = next[index];
      onDispatch({
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString(),
        caller: 'Subject (EventPublisher)',
        method: isAttached ? 'attach' : 'detach',
        status: isAttached ? 'ok' : 'blocked',
        detail: `${isAttached ? 'Subscribed' : 'Unsubscribed'} Observer: ${name}.`,
      });
      return next;
    });
  };

  const handleFireEvent = () => {
    setPulseCount((c) => c + 1);
    setPulseActive(true);
    setTimeout(() => setPulseActive(false), 800);

    const subscribers = perspective === 'enterprise'
      ? ['EmailService', 'InventoryService', 'LedgerService']
      : perspective === 'canonical'
      ? ['OverviewChart', 'VolumeChart', 'MovingAverageChart']
      : ['AnnunciatorStationA', 'AnnunciatorStationB', 'AnnunciatorStationC'];

    onDispatch({
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString(),
      caller: 'OrderService',
      method: 'notifyObservers',
      status: 'ok',
      detail: `Fanned out event to ${activeStations.filter(Boolean).length} registered observers.`,
    });

    subscribers.forEach((sub, i) => {
      if (activeStations[i]) {
        setTimeout(() => {
          onDispatch({
            id: String(Date.now() + i + 10),
            timestamp: new Date().toLocaleTimeString(),
            caller: sub,
            method: 'update',
            status: 'ok',
            detail: `Received event notification #${pulseCount + 1}.`,
          });
        }, 150 * (i + 1));
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Controls Bar */}
      <div className="flex items-center justify-between px-2 py-1 bg-muted/20 rounded-md border border-border/30 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFireEvent}
            className="px-3 py-1 rounded text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
          >
            {perspective === 'enterprise'
              ? 'Publish Order Event'
              : perspective === 'canonical'
              ? 'Tick Stock Price ($)'
              : 'Depress Central Plunger'}
          </button>
          <span className="text-muted-foreground text-[11px]">
            Subscribers: {activeStations.filter(Boolean).length}/3 active
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {['Sub 1', 'Sub 2', 'Sub 3'].map((name, i) => (
            <button
              key={name}
              type="button"
              onClick={() => handleToggleStation(i as 0 | 1 | 2, name)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                activeStations[i]
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                  : 'bg-muted/40 text-muted-foreground border border-border/30'
              }`}
            >
              {name}: {activeStations[i] ? 'Attached' : 'Detached'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Perspective Plate */}
      {perspective === 'generic' && (
        <Plate
          fig="FIG 01"
          title="OBSERVER / INTERLOCKED PNEUMATIC TELEGRAPH & ANNUNCIATOR RIG"
          category="BEHAVIORAL"
          hint="Click 'Depress Plunger' to pump pressure wave · Toggle station valves to attach/detach"
          readout={`PULSES: ${pulseCount} · ACTIVE STATIONS: ${activeStations.filter(Boolean).length}/3 · LINE PRESSURE: ${pulseActive ? '4.8 BAR' : '1.2 BAR'}`}
          theme={theme}
        >
          {/* Base Plate */}
          <Solid paths={basePlate.slab} tone="mid" halo />
          <Line d={basePlate.groove} tone="faint" />
          {basePlate.feet.map((f, i) => (
            <Solid key={i} paths={f} tone="lo" />
          ))}

          {/* Central Plunger Assembly */}
          <g className="cursor-pointer" onClick={handleFireEvent}>
            <Solid paths={plunger.rod} tone="hi" lit={pulseActive} />
            <Line d={plunger.coil.back} tone="lo" />
            <Line d={plunger.coil.front} tone="mid" />
          </g>

          {/* Receiving Station Dials */}
          <g className="cursor-pointer" onClick={() => handleToggleStation(0, 'Station A')}>
            <Solid paths={dialA.caseSlab} tone="mid" lit={activeStations[0] && pulseActive} />
            <Line d={dialA.bezelRing} tone={activeStations[0] ? 'hi' : 'faint'} />
          </g>

          <g className="cursor-pointer" onClick={() => handleToggleStation(1, 'Station B')}>
            <Solid paths={dialB.caseSlab} tone="mid" lit={activeStations[1] && pulseActive} />
            <Line d={dialB.bezelRing} tone={activeStations[1] ? 'hi' : 'faint'} />
          </g>

          <g className="cursor-pointer" onClick={() => handleToggleStation(2, 'Station C')}>
            <Solid paths={dialC.caseSlab} tone="mid" lit={activeStations[2] && pulseActive} />
            <Line d={dialC.bezelRing} tone={activeStations[2] ? 'hi' : 'faint'} />
          </g>
        </Plate>
      )}

      {perspective === 'enterprise' && (
        <Plate
          fig="FIG 01"
          title="OBSERVER / CLOUD EVENTBRIDGE TOPIC & MICROSERVICE FAN-OUT"
          category="BEHAVIORAL"
          hint="Click 'Publish Order Event' · Notice events route only to active subscriber microservices"
          readout={`EVENT TOPIC: order.created · SUBSCRIBERS: ${activeStations.filter(Boolean).length}/3 · DISPATCH: ${pulseActive ? 'FANNING OUT' : 'IDLE'}`}
          theme={theme}
        >
          {/* Central Message Broker Rack */}
          <Solid paths={brokerRack.basePlate} tone="lo" />
          <Solid paths={brokerRack.chassis} tone="hi" lit={pulseActive}>
            {brokerRack.bays.map((bay, i) => (
              <Solid key={i} paths={bay} tone="mid" />
            ))}
          </Solid>

          {/* Subscriber Conduits */}
          {activeStations[0] && <Line d={conduitA.path} tone="blue" flow={pulseActive} />}
          {activeStations[1] && <Line d={conduitB.path} tone="green" flow={pulseActive} />}
          {activeStations[2] && <Line d={conduitC.path} tone="red" flow={pulseActive} />}

          {/* Subscriber Microservices */}
          <g className="cursor-pointer" onClick={() => handleToggleStation(0, 'EmailService')}>
            <Solid paths={serviceA.cylinderBody} tone="mid" lit={activeStations[0] && pulseActive} />
            <Solid paths={serviceA.rimCollar} tone="lo" />
          </g>

          <g className="cursor-pointer" onClick={() => handleToggleStation(1, 'InventoryService')}>
            <Solid paths={serviceB.cylinderBody} tone="mid" lit={activeStations[1] && pulseActive} />
            <Solid paths={serviceB.rimCollar} tone="lo" />
          </g>

          <g className="cursor-pointer" onClick={() => handleToggleStation(2, 'LedgerService')}>
            <Solid paths={serviceC.cylinderBody} tone="mid" lit={activeStations[2] && pulseActive} />
            <Solid paths={serviceC.rimCollar} tone="lo" />
          </g>
        </Plate>
      )}

      {perspective === 'canonical' && (
        <Plate
          fig="FIG 01"
          title="OBSERVER / STOCK TICKER PUBLISHER & MULTIPLE CHART MONITORS"
          category="BEHAVIORAL"
          hint="Click 'Tick Stock Price' · Registered chart windows receive updated price coordinates"
          readout={`TICKER: NASDAQ · SUBSCRIBER WINDOWS: ${activeStations.filter(Boolean).length}/3 · LAST TICK: $${(142.5 + pulseCount * 0.75).toFixed(2)}`}
          theme={theme}
        >
          {/* Main Publisher Window */}
          <Solid paths={tickerWindow.frame} tone="hi" lit={pulseActive} />
          <Solid paths={tickerWindow.titleBar} tone="mid" />
          <Line d={tickerWindow.contentPane} tone="faint" />

          {/* Subscriber Chart Windows */}
          <g className="cursor-pointer" onClick={() => handleToggleStation(0, 'OverviewChart')}>
            <Solid paths={chartWindowA.frame} tone="mid" lit={activeStations[0] && pulseActive} />
            <Solid paths={chartWindowA.titleBar} tone={activeStations[0] ? 'hi' : 'lo'} />
          </g>

          <g className="cursor-pointer" onClick={() => handleToggleStation(1, 'VolumeChart')}>
            <Solid paths={chartWindowB.frame} tone="mid" lit={activeStations[1] && pulseActive} />
            <Solid paths={chartWindowB.titleBar} tone={activeStations[1] ? 'hi' : 'lo'} />
          </g>

          <g className="cursor-pointer" onClick={() => handleToggleStation(2, 'MovingAvgChart')}>
            <Solid paths={chartWindowC.frame} tone="mid" lit={activeStations[2] && pulseActive} />
            <Solid paths={chartWindowC.titleBar} tone={activeStations[2] ? 'hi' : 'lo'} />
          </g>
        </Plate>
      )}
    </div>
  );
}
