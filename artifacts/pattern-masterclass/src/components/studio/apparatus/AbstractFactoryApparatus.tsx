import React, { useState } from 'react';
import type { Projection, Plan } from '../../../lib/anatomy/iso-kit';
import { iso } from '../../../lib/anatomy/iso-kit';
import { Plate } from '../../../lib/anatomy/Plate';
import { Solid, Line } from '../../../lib/anatomy/Solid';
import {
  buildSubnetPerimeter,
  buildCloudNodeCard,
  buildConduitPipes,
} from '../kits/EnterpriseKit';
import {
  buildUprightMonitor,
  buildFactorySpawnerTool,
} from '../kits/CanonicalKit';
import {
  buildEvPropulsion,
  buildCombustionPropulsion,
} from '../kits/MechanicalKit';
import { PerspectiveSwitch, type StudioPerspective } from '../PerspectiveSwitch';
import type { MethodDispatch } from '../CorrelationDock';
import {
  Zap,
  Cloud,
  Laptop,
  Car,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Database,
  Lock,
  Activity,
  Gauge,
  BatteryCharging,
} from 'lucide-react';

const P: Projection = {
  origin: [350, 220],
  scale: 1.45,
  azimuth: 45,
  elevation: 30,
};

export interface AbstractFactoryApparatusProps {
  perspective: StudioPerspective;
  onPerspectiveChange?: (p: StudioPerspective) => void;
  theme?: string;
  onDispatch: (dispatch: MethodDispatch) => void;
}

export function AbstractFactoryApparatus({
  perspective,
  onPerspectiveChange,
  theme = 'dark',
  onDispatch,
}: AbstractFactoryApparatusProps) {
  // -------------------------------------------------------------
  // Enterprise Cloud State: AWS vs GCP + Incompatibility Test
  // -------------------------------------------------------------
  const [cloudProvider, setCloudProvider] = useState<'aws' | 'gcp'>('aws');
  const [testCrossCloudMismatch, setTestCrossCloudMismatch] = useState(false);
  const [storageCapacity, setStorageCapacity] = useState(100);

  // -------------------------------------------------------------
  // Canonical Desktop State: macOS vs Windows (Upright Monitor)
  // -------------------------------------------------------------
  const [guiFamily, setGuiFamily] = useState<'win' | 'mac'>('mac');
  const [buttonPressed, setButtonPressed] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [spawnerActive, setSpawnerActive] = useState(false);

  // -------------------------------------------------------------
  // Generic Metaphor State: EV vs Combustion Vehicle Suite
  // -------------------------------------------------------------
  const [vehicleFamily, setVehicleFamily] = useState<'ev' | 'combustion'>('ev');
  const [accelerated, setAccelerated] = useState(false);

  // -------------------------------------------------------------
  // Enterprise Cloud Geometry
  // -------------------------------------------------------------
  const subnetPlan: Plan = { x: -145, y: -75, w: 290, d: 150, r: 10 };
  const subnet = React.useMemo(() => buildSubnetPerimeter(subnetPlan, -6, P), []);
  const computeCard = React.useMemo(
    () => buildCloudNodeCard({ x: -110, y: -45, w: 95, d: 85, r: 6 }, 0, 16, P),
    []
  );
  const storageCard = React.useMemo(
    () => buildCloudNodeCard({ x: 25, y: -45, w: 95, d: 85, r: 6 }, 0, 16, P),
    []
  );
  const cloudConduit = React.useMemo(
    () => buildConduitPipes([-15, -2, 16], [5, -2, 16], [25, -2, 16], 3, P),
    []
  );

  // -------------------------------------------------------------
  // Canonical Desktop Geometry (Upright Monitor Display)
  // -------------------------------------------------------------
  const uprightMonitor = React.useMemo(() => buildUprightMonitor(250, 135, 25, P), []);
  const spawnerTool = React.useMemo(
    () => buildFactorySpawnerTool(0, -10, spawnerActive ? 130 : 155, P),
    [spawnerActive]
  );

  // -------------------------------------------------------------
  // Generic Metaphor Geometry (Automotive Vehicle Suite)
  // -------------------------------------------------------------
  const evPropulsion = React.useMemo(
    () =>
      buildEvPropulsion(
        { x: -115, y: -45, w: 90, d: 90, r: 6 },
        { x: 15, y: -40, w: 100, d: 80, r: 6 },
        P
      ),
    []
  );
  const combustionPropulsion = React.useMemo(
    () =>
      buildCombustionPropulsion(
        { x: -115, y: -45, w: 90, d: 90, r: 6 },
        { x: 15, y: -40, w: 100, d: 80, r: 6 },
        P
      ),
    []
  );

  // -------------------------------------------------------------
  // Event Handlers
  // -------------------------------------------------------------
  const handleToggleCloud = (provider: 'aws' | 'gcp') => {
    setCloudProvider(provider);
    setTestCrossCloudMismatch(false);
    onDispatch({
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString(),
      caller: provider === 'aws' ? 'AwsResourceFactory' : 'GcpResourceFactory',
      method: 'createComputeInstance',
      status: 'ok',
      detail: `Instantiated ${provider === 'aws' ? 'Ec2Instance("t4g.xlarge Graviton3")' : 'ComputeEngine("n2-standard-4")'} on VPC subnet 10.0.0.0/16.`,
    });
    onDispatch({
      id: String(Date.now() + 1),
      timestamp: new Date().toLocaleTimeString(),
      caller: provider === 'aws' ? 'AwsResourceFactory' : 'GcpResourceFactory',
      method: 'createStorageBucket',
      status: 'ok',
      detail: `Instantiated ${provider === 'aws' ? 'S3Bucket("prod-media-assets", AES-256)' : 'GcsBucket("gcs-analytics-data", Multi-Regional)'} with matching IAM role.`,
    });
  };

  const handleToggleGui = (style: 'win' | 'mac') => {
    setGuiFamily(style);
    setSpawnerActive(true);
    setTimeout(() => setSpawnerActive(false), 450);
    onDispatch({
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString(),
      caller: style === 'win' ? 'WinFactory' : 'MacFactory',
      method: 'createButton',
      status: 'ok',
      detail: `Spawned native ${style === 'win' ? 'WinButton (Win32 HWND Fluent)' : 'MacButton (NSButton / AppKit Aqua)'}.`,
    });
    onDispatch({
      id: String(Date.now() + 1),
      timestamp: new Date().toLocaleTimeString(),
      caller: style === 'win' ? 'WinFactory' : 'MacFactory',
      method: 'createCheckbox',
      status: 'ok',
      detail: `Spawned native ${style === 'win' ? 'WinCheckbox (Checkmark Fluent)' : 'MacCheckbox (AppKit Blue Check)'}.`,
    });
  };

  const handleToggleVehicle = (family: 'ev' | 'combustion') => {
    setVehicleFamily(family);
    onDispatch({
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString(),
      caller: family === 'ev' ? 'ElectricVehicleFactory' : 'CombustionVehicleFactory',
      method: 'createPropulsionUnit',
      status: 'ok',
      detail: `Manufactured ${family === 'ev' ? '400V Lithium Battery Pack & Motor Inverter' : 'V8 Combustion Engine Block'}.`,
    });
    onDispatch({
      id: String(Date.now() + 1),
      timestamp: new Date().toLocaleTimeString(),
      caller: family === 'ev' ? 'ElectricVehicleFactory' : 'CombustionVehicleFactory',
      method: 'createCockpitDash',
      status: 'ok',
      detail: `Manufactured matching ${family === 'ev' ? 'Digital Touchscreen Cockpit Display' : 'Analog Gauge Instrument Cluster'}.`,
    });
  };

  const handleActionTrigger = () => {
    if (perspective === 'enterprise') {
      handleToggleCloud(cloudProvider === 'aws' ? 'gcp' : 'aws');
    } else if (perspective === 'canonical') {
      handleToggleGui(guiFamily === 'mac' ? 'win' : 'mac');
    } else {
      handleToggleVehicle(vehicleFamily === 'ev' ? 'combustion' : 'ev');
    }
  };

  // Projected 2D points for in-canvas hotspots
  const computePt = iso([-65, -5, 20], P);
  const storagePt = iso([70, -5, 20], P);
  const monitorCenterPt = iso([0, 0, 100], P);
  const vehicleLeftPt = iso([-65, 0, 20], P);
  const vehicleRightPt = iso([65, 0, 45], P);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 
        ===========================================================
        UNIFIED COMMAND TOOLBAR: Mode + Family Suite + Action Trigger
        ===========================================================
      */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/50 shadow-sm backdrop-blur-md">
        {/* 1. Perspective / Mode Selector */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:inline">
            1. Mode:
          </span>
          {onPerspectiveChange ? (
            <PerspectiveSwitch value={perspective} onChange={onPerspectiveChange} />
          ) : (
            <span className="text-xs font-semibold capitalize bg-muted px-2.5 py-1 rounded">
              {perspective}
            </span>
          )}
        </div>

        {/* 2. Family Suite Selector & 3. Action Trigger */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:inline">
            2. Family Suite:
          </span>

          {/* Enterprise Cloud Options */}
          {perspective === 'enterprise' && (
            <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-lg border border-border/30">
              <button
                type="button"
                onClick={() => handleToggleCloud('aws')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  cloudProvider === 'aws' && !testCrossCloudMismatch
                    ? 'bg-[#ff9900] text-black font-bold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <Cloud className="h-3 w-3" />
                <span>AWS Cloud Suite</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleCloud('gcp')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  cloudProvider === 'gcp' && !testCrossCloudMismatch
                    ? 'bg-[#4285F4] text-white font-bold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <Cloud className="h-3 w-3" />
                <span>GCP Cloud Suite</span>
              </button>
              <button
                type="button"
                onClick={() => setTestCrossCloudMismatch((v) => !v)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                  testCrossCloudMismatch
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                }`}
                title="Simulate illegal cross-cloud mismatch bug"
              >
                <AlertTriangle className="h-3 w-3" />
                <span>{testCrossCloudMismatch ? '❌ Cross-Cloud Bug Active' : '⚠️ Test Illegal Mix'}</span>
              </button>
            </div>
          )}

          {/* Canonical Desktop Options */}
          {perspective === 'canonical' && (
            <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-lg border border-border/30">
              <button
                type="button"
                onClick={() => handleToggleGui('mac')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  guiFamily === 'mac'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <Laptop className="h-3 w-3" />
                <span>macOS Suite (AppKit)</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleGui('win')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  guiFamily === 'win'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <Laptop className="h-3 w-3" />
                <span>Windows Suite (Fluent)</span>
              </button>
            </div>
          )}

          {/* Generic Metaphor Options (Automotive EV vs Gas) */}
          {perspective === 'generic' && (
            <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-lg border border-border/30">
              <button
                type="button"
                onClick={() => handleToggleVehicle('ev')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  vehicleFamily === 'ev'
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <BatteryCharging className="h-3 w-3" />
                <span>Electric EV Suite</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleVehicle('combustion')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  vehicleFamily === 'combustion'
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <Gauge className="h-3 w-3" />
                <span>Gas Combustion Suite</span>
              </button>
            </div>
          )}

          {/* 3. Action Trigger Button */}
          <button
            type="button"
            onClick={handleActionTrigger}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
            title="Switch family and instantiate matched products"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>
              {perspective === 'enterprise'
                ? '⚡ Swap Cloud Stack'
                : perspective === 'canonical'
                ? '⚡ Swap Desktop OS'
                : '⚡ Swap Vehicle Platform'}
            </span>
          </button>
        </div>
      </div>

      {/* 
        ===========================================================
        PERSPECTIVE 1: ENTERPRISE CLOUD (RECOGNIZABLE CLOUD TOPOLOGY)
        ===========================================================
      */}
      {perspective === 'enterprise' && (
        <Plate
          fig="FIG 01"
          title="ABSTRACT FACTORY / MULTI-CLOUD ARCHITECTURE TOPOLOGY"
          category="CREATIONAL"
          guidancePrompt={
            testCrossCloudMismatch
              ? '⚠️ WARNING: Mismatching an AWS EC2 instance with GCP Cloud Storage breaks IAM security context and incurs severe egress costs!'
              : '💡 Click "Test Illegal Mix" or toggle provider to see why Abstract Factory guarantees 100% matched cloud suites.'
          }
          telemetryHud={
            testCrossCloudMismatch
              ? '🔴 FATAL BUG: CROSS-CLOUD IAM AUTH FAILURE · EGRESS RATE: $0.09/GB · SECURITY VIOLATION: MIXED CLOUD'
              : `🟢 STATUS: SYNCHRONIZED SUITE · CLOUD: ${cloudProvider.toUpperCase()} · VPC: ISOLATED (10.0.0.0/16) · IAM: MATCHED`
          }
          readout={`FACTORY: ${cloudProvider === 'aws' ? 'AwsResourceFactory' : 'GcpResourceFactory'} · COMPUTE: ${cloudProvider === 'aws' ? 'EC2 t4g.xlarge' : 'GCE n2-standard'} · STORAGE: 100 GB`}
          theme={theme}
        >
          {/* Subnet Floor Boundary Ring */}
          <Solid paths={subnet.base} tone="lo" />
          <Line
            d={subnet.boundaryRing}
            tone={testCrossCloudMismatch ? 'red' : cloudProvider === 'aws' ? 'blue' : 'green'}
          />

          {/* Left Pedestal: Compute Card */}
          <Solid paths={computeCard.pedestal} tone="mid" />
          <Solid paths={computeCard.facePlate} tone="hi" lit={!testCrossCloudMismatch} />
          <Line
            d={computeCard.statusBorder}
            tone={testCrossCloudMismatch ? 'red' : cloudProvider === 'aws' ? 'blue' : 'green'}
          />
          <Solid paths={computeCard.terminalPort} tone="hi" lit />

          {/* Right Pedestal: Storage Card */}
          <Solid paths={storageCard.pedestal} tone="mid" />
          <Solid
            paths={storageCard.facePlate}
            tone={testCrossCloudMismatch ? 'lo' : 'hi'}
            lit={!testCrossCloudMismatch}
          />
          <Line
            d={storageCard.statusBorder}
            tone={testCrossCloudMismatch ? 'red' : cloudProvider === 'aws' ? 'blue' : 'green'}
          />
          <Solid paths={storageCard.terminalPort} tone="hi" lit />

          {/* Internal VPC Network Conduit Bus */}
          <Line
            d={cloudConduit.path}
            tone={testCrossCloudMismatch ? 'red' : cloudProvider === 'aws' ? 'blue' : 'green'}
            flow={!testCrossCloudMismatch}
          />
          {cloudConduit.collars.map((c, i) => (
            <Solid key={i} paths={c} tone="lo" />
          ))}

          {/* Detailed In-Canvas Architectural Cards (Rendered cleanly on top of pedestals) */}
          <g className="select-none">
            {/* Compute Instance Card (Left) */}
            <g transform={`translate(${computePt[0] - 75}, ${computePt[1] - 60})`}>
              <rect
                width="150"
                height="80"
                rx="8"
                fill="#0d1117"
                stroke={cloudProvider === 'aws' ? '#ff9900' : '#4285F4'}
                strokeWidth="1.5"
                opacity="0.96"
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
              />
              {/* Header */}
              <rect
                width="150"
                height="22"
                rx="8"
                fill={cloudProvider === 'aws' ? '#ff990022' : '#4285F422'}
              />
              <text x="10" y="15" fill={cloudProvider === 'aws' ? '#ff9900' : '#4285F4'} fontSize="11" fontFamily="sans-serif" fontWeight="bold">
                {cloudProvider === 'aws' ? '⚡ AWS EC2 Instance' : '⚡ GCP Compute Engine'}
              </text>
              {/* Specs */}
              <text x="10" y="38" fill="#e2e8f0" fontSize="10" fontFamily="monospace" fontWeight="semibold">
                Type: {cloudProvider === 'aws' ? 't4g.xlarge (ARM)' : 'n2-standard-4'}
              </text>
              <text x="10" y="52" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                CPU: 14% · RAM: 8/16 GB
              </text>
              <text x="10" y="66" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="bold">
                🟢 RUNNING · IP: 10.0.1.42
              </text>
            </g>

            {/* Storage Bucket Card (Right) */}
            <g transform={`translate(${storagePt[0] - 75}, ${storagePt[1] - 60})`}>
              <rect
                width="150"
                height="80"
                rx="8"
                fill="#0d1117"
                stroke={testCrossCloudMismatch ? '#ef4444' : cloudProvider === 'aws' ? '#ff9900' : '#4285F4'}
                strokeWidth="1.5"
                opacity="0.96"
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
              />
              {/* Header */}
              <rect
                width="150"
                height="22"
                rx="8"
                fill={testCrossCloudMismatch ? '#ef444422' : cloudProvider === 'aws' ? '#ff990022' : '#4285F422'}
              />
              <text x="10" y="15" fill={testCrossCloudMismatch ? '#ef4444' : cloudProvider === 'aws' ? '#ff9900' : '#4285F4'} fontSize="11" fontFamily="sans-serif" fontWeight="bold">
                {testCrossCloudMismatch
                  ? '⚠️ GCP Storage (Wrong Cloud!)'
                  : cloudProvider === 'aws'
                  ? '🪣 AWS S3 Bucket'
                  : '🪣 GCP Cloud Storage'}
              </text>
              {/* Specs */}
              <text x="10" y="38" fill="#e2e8f0" fontSize="10" fontFamily="monospace" fontWeight="semibold">
                Bucket: {testCrossCloudMismatch ? 'gcs-external-data' : cloudProvider === 'aws' ? 'prod-media-assets' : 'gcs-analytics-data'}
              </text>
              <text x="10" y="52" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                Capacity: 100 GB Standard-IA
              </text>
              <text x="10" y="66" fill={testCrossCloudMismatch ? '#ef4444' : '#38bdf8'} fontSize="9" fontFamily="monospace" fontWeight="bold">
                {testCrossCloudMismatch ? '❌ IAM AUTH REJECTED' : '🔒 AWS KMS (AES-256)'}
              </text>
            </g>

            {/* In-Canvas Labeled Badges */}
            <g transform={`translate(${computePt[0] - 65}, ${computePt[1] + 32})`}>
              <rect width="130" height="20" rx="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1" opacity="0.95" />
              <text x="65" y="14" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                🏷️ ProductA: Compute
              </text>
            </g>

            <g transform={`translate(${storagePt[0] - 65}, ${storagePt[1] + 32})`}>
              <rect width="130" height="20" rx="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1" opacity="0.95" />
              <text x="65" y="14" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                🏷️ ProductB: Storage
              </text>
            </g>

            {/* Incompatibility Warning Banner (if active) */}
            {testCrossCloudMismatch && (
              <g transform="translate(190, 80)">
                <rect width="320" height="42" rx="6" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" opacity="0.98" />
                <text x="160" y="18" fill="#fca5a5" fontSize="11" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                  ❌ FATAL MISMATCH: Incompatible Cloud APIs!
                </text>
                <text x="160" y="32" fill="#fecaca" fontSize="9.5" fontFamily="sans-serif" textAnchor="middle">
                  AWS EC2 cannot authenticate with GCP bucket. Abstract Factory fixes this!
                </text>
              </g>
            )}
          </g>
        </Plate>
      )}

      {/* 
        ===========================================================
        PERSPECTIVE 2: CANONICAL DESKTOP (UPRIGHT VERTICAL MONITOR)
        ===========================================================
      */}
      {perspective === 'canonical' && (
        <Plate
          fig="FIG 01"
          title={`ABSTRACT FACTORY / UPRIGHT VERTICAL ${guiFamily.toUpperCase()} MONITOR DISPLAY`}
          category="CREATIONAL"
          guidancePrompt="Viewed vertically like a real computer monitor screen! Click [ OK ] or the Checkbox inside the monitor."
          telemetryHud={`STATUS: SYNCHRONIZED GUI · PLATFORM: ${guiFamily === 'mac' ? 'Apple macOS (AppKit)' : 'Microsoft Windows (Win32 Fluent)'} · BUTTON: ${buttonPressed ? 'PRESSED' : 'NORMAL'} · CHECKBOX: ${checkboxChecked ? 'CHECKED' : 'UNCHECKED'}`}
          readout={`FACTORY: ${guiFamily === 'mac' ? 'MacFactory' : 'WinFactory'} · DISPLAY: 24" UPRIGHT · VTABLE: DISPATCHED`}
          theme={theme}
        >
          {/* Monitor Stand Foot & Neck */}
          <Solid paths={uprightMonitor.standBase} tone="mid" />
          <Solid paths={uprightMonitor.standNeck} tone="lo" />

          {/* Upright Monitor Outer Bezel */}
          <Solid paths={uprightMonitor.monitorFrame} tone="hi" />

          {/* Power LED on Monitor Chin */}
          <circle
            cx={uprightMonitor.powerLed[0]}
            cy={uprightMonitor.powerLed[1]}
            r={2}
            fill="#10b981"
            className="animate-pulse"
          />

          {/* Overhead Factory Spawner Arm */}
          <Solid paths={spawnerTool.overheadArm} tone="hi" />
          <Solid paths={spawnerTool.spawnerHead} tone="mid" lit={spawnerActive} />
          {spawnerActive && <Line d={spawnerTool.emitterBeam} tone="blue" flow />}

          {/* Upright Monitor Display Pane (facing viewer directly like a computer screen!) */}
          <g className="select-none" transform={`translate(${monitorCenterPt[0] - 110}, ${monitorCenterPt[1] - 70})`}>
            {/* Monitor Screen Glass Backdrop */}
            <rect
              width="220"
              height="130"
              rx="6"
              fill={guiFamily === 'mac' ? '#1c1c1e' : '#18181b'}
              stroke={guiFamily === 'mac' ? '#3a3a3c' : '#27272a'}
              strokeWidth="1.5"
            />

            {/* Desktop OS Window Chrome inside the monitor */}
            <g transform="translate(10, 10)">
              {/* Window Box */}
              <rect
                width="200"
                height="110"
                rx="6"
                fill={guiFamily === 'mac' ? '#2c2c2e' : '#202024'}
                stroke={guiFamily === 'mac' ? '#0a84ff55' : '#0078d455'}
                strokeWidth="1.2"
                filter="drop-shadow(0 4px 10px rgba(0,0,0,0.6))"
              />

              {/* Titlebar */}
              <rect
                width="200"
                height="22"
                rx="6"
                fill={guiFamily === 'mac' ? '#3a3a3c' : '#2d2d30'}
              />

              {/* macOS Traffic Lights vs Windows Controls */}
              {guiFamily === 'mac' ? (
                <g transform="translate(8, 7)">
                  <circle cx="4" cy="4" r="3.5" fill="#ff5f56" stroke="#e0443e" strokeWidth="0.5" />
                  <circle cx="14" cy="4" r="3.5" fill="#ffbd2e" stroke="#dea123" strokeWidth="0.5" />
                  <circle cx="24" cy="4" r="3.5" fill="#27c93f" stroke="#1aab29" strokeWidth="0.5" />
                  <text x="95" y="8" fill="#ffffff" fontSize="9" fontFamily="sans-serif" fontWeight="semibold" textAnchor="middle">
                    macOS Preferences
                  </text>
                </g>
              ) : (
                <g transform="translate(8, 5)">
                  <text x="10" y="9" fill="#e4e4e7" fontSize="9" fontFamily="sans-serif" fontWeight="semibold">
                    System Settings — Win32
                  </text>
                  <g transform="translate(155, 0)">
                    <text x="0" y="9" fill="#a1a1aa" fontSize="9" fontFamily="monospace">_</text>
                    <text x="12" y="9" fill="#a1a1aa" fontSize="9" fontFamily="monospace">□</text>
                    <text x="24" y="9" fill="#ef4444" fontSize="9" fontFamily="monospace">✕</text>
                  </g>
                </g>
              )}

              {/* Window Inner Content: Dialog Prompt */}
              <text x="15" y="42" fill="#f4f4f5" fontSize="10" fontFamily="sans-serif" fontWeight="medium">
                Export Project Assets:
              </text>

              {/* Product A: Native Button Widget */}
              <g
                className="cursor-pointer"
                transform="translate(15, 52)"
                onClick={() => {
                  setButtonPressed((v) => !v);
                  onDispatch({
                    id: String(Date.now()),
                    timestamp: new Date().toLocaleTimeString(),
                    caller: guiFamily === 'mac' ? 'MacButton' : 'WinButton',
                    method: 'onClick',
                    status: 'ok',
                    detail: `Dispatched native click on ${guiFamily === 'mac' ? 'macOS Aqua [ OK ]' : 'Win32 Fluent [ Submit ]'}.`,
                  });
                }}
              >
                <rect
                  width="75"
                  height="24"
                  rx={guiFamily === 'mac' ? '12' : '4'}
                  fill={
                    buttonPressed
                      ? guiFamily === 'mac'
                        ? '#0058b0'
                        : '#005a9e'
                      : guiFamily === 'mac'
                      ? '#007aff'
                      : '#0078d4'
                  }
                  stroke={guiFamily === 'mac' ? '#5ac8fa' : '#2b88d8'}
                  strokeWidth="1"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))"
                />
                <text
                  x="37.5"
                  y="16"
                  fill="#ffffff"
                  fontSize="10"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {guiFamily === 'mac' ? '[  OK  ]' : '[ Submit ]'}
                </text>
              </g>

              {/* Product B: Native Checkbox Widget */}
              <g
                className="cursor-pointer"
                transform="translate(100, 52)"
                onClick={() => {
                  setCheckboxChecked((v) => !v);
                  onDispatch({
                    id: String(Date.now()),
                    timestamp: new Date().toLocaleTimeString(),
                    caller: guiFamily === 'mac' ? 'MacCheckbox' : 'WinCheckbox',
                    method: 'toggle',
                    status: 'ok',
                    detail: `Updated checkbox state to ${!checkboxChecked ? 'CHECKED' : 'UNCHECKED'}.`,
                  });
                }}
              >
                <rect
                  width="18"
                  height="18"
                  rx={guiFamily === 'mac' ? '4' : '2'}
                  fill={checkboxChecked ? (guiFamily === 'mac' ? '#007aff' : '#0078d4') : '#27272a'}
                  stroke={checkboxChecked ? '#5ac8fa' : '#52525b'}
                  strokeWidth="1"
                />
                {checkboxChecked && (
                  <text x="9" y="13" fill="#ffffff" fontSize="11" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                    ✓
                  </text>
                )}
                <text x="25" y="13" fill="#e4e4e7" fontSize="9" fontFamily="sans-serif">
                  {guiFamily === 'mac' ? 'Auto-Save' : 'Telemetry'}
                </text>
              </g>

              {/* Window Footer Status */}
              <text x="15" y="96" fill="#a1a1aa" fontSize="8" fontFamily="monospace">
                Toolkit: {guiFamily === 'mac' ? 'AppKit / Cocoa' : 'Win32 / Fluent UI'}
              </text>
            </g>
          </g>

          {/* In-Canvas Labeled Badges */}
          <g className="pointer-events-none select-none">
            <g transform={`translate(${monitorCenterPt[0] - 120}, ${monitorCenterPt[1] + 75})`}>
              <rect width="115" height="20" rx="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1" opacity="0.95" />
              <text x="57" y="14" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                🏷️ ProductA: Button
              </text>
            </g>

            <g transform={`translate(${monitorCenterPt[0] + 5}, ${monitorCenterPt[1] + 75})`}>
              <rect width="125" height="20" rx="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1" opacity="0.95" />
              <text x="62" y="14" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                🏷️ ProductB: Checkbox
              </text>
            </g>
          </g>
        </Plate>
      )}

      {/* 
        ===========================================================
        PERSPECTIVE 3: GENERIC METAPHOR (AUTOMOTIVE VEHICLE FACTORY)
        ===========================================================
      */}
      {perspective === 'generic' && (
        <Plate
          fig="FIG 01"
          title={`ABSTRACT FACTORY / AUTOMOTIVE VEHICLE PROPULSION FACTORY`}
          category="CREATIONAL"
          guidancePrompt={
            vehicleFamily === 'ev'
              ? '⚡ ELECTRIC VEHICLE SUITE: 400V Battery Pack paired with Digital Touchscreen Cockpit Dash. Notice how an analog tachometer cannot fit here!'
              : '🔥 COMBUSTION VEHICLE SUITE: V8 Engine Block paired with Dual Analog Needle Gauges.'
          }
          telemetryHud={`STATUS: MATCHED VEHICLE PLATFORM · SUITE: ${vehicleFamily === 'ev' ? 'ELECTRIC VEHICLE (EV)' : 'COMBUSTION GAS (V8)'} · VOLTAGE/RPM: ${vehicleFamily === 'ev' ? '400V DC · 88 kWh' : '4,200 RPM · 8.4:1 RATIO'}`}
          readout={`FACTORY: ${vehicleFamily === 'ev' ? 'ElectricVehicleFactory' : 'CombustionVehicleFactory'} · PROPULSION: ACTIVE · COCKPIT: SYNCED`}
          theme={theme}
        >
          {vehicleFamily === 'ev' ? (
            // Electric EV Suite
            <>
              {/* Product A: 400V Lithium Battery Pack & Inverter */}
              <Solid paths={evPropulsion.batteryChassis} tone="hi" lit />
              {evPropulsion.coolingFins.map((fin, i) => (
                <Solid key={i} paths={fin} tone="mid" />
              ))}
              <Solid paths={evPropulsion.highVoltageTerminal} tone="hi" lit />

              {/* Product B: Digital Glass Touchscreen Cockpit Dash */}
              <Solid paths={evPropulsion.digitalScreen} tone="hi" lit />
              <Line d={evPropulsion.screenGlass} tone="blue" />

              {/* Realistic EV Touchscreen Graphics (Speedometer & Battery Gauge) */}
              <g className="select-none pointer-events-none" transform={`translate(${vehicleRightPt[0] - 50}, ${vehicleRightPt[1] - 30})`}>
                <rect width="100" height="60" rx="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1.2" opacity="0.95" />
                <text x="50" y="15" fill="#38bdf8" fontSize="9" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                  DIGITAL COCKPIT
                </text>
                <text x="50" y="34" fill="#ffffff" fontSize="16" fontFamily="sans-serif" fontWeight="extrabold" textAnchor="middle">
                  88 <tspan fontSize="9" fill="#94a3b8">MPH</tspan>
                </text>
                <text x="50" y="50" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  ⚡ BATTERY: 88% · 284 MI
                </text>
              </g>

              {/* Battery Pack Technical Graphics */}
              <g className="select-none pointer-events-none" transform={`translate(${vehicleLeftPt[0] - 50}, ${vehicleLeftPt[1] - 15})`}>
                <rect width="100" height="30" rx="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1" opacity="0.9" />
                <text x="50" y="14" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  400V LITHIUM PACK
                </text>
                <text x="50" y="24" fill="#10b981" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  CELLS: 4x MODULES · OK
                </text>
              </g>
            </>
          ) : (
            // Combustion Gas Suite
            <>
              {/* Product A: V8 Combustion Engine Block */}
              <Solid paths={combustionPropulsion.engineBlock} tone="mid" />
              {combustionPropulsion.cylinderHeads.map((head, i) => (
                <Solid key={i} paths={head} tone="hi" />
              ))}
              {combustionPropulsion.exhaustPipes.map((pipe, i) => (
                <Line key={i} d={pipe} tone="lit" />
              ))}

              {/* Product B: Dual Analog Gauge Instrument Cluster */}
              <Solid paths={combustionPropulsion.dualAnalogCluster} tone="lo" />
              <Line d={combustionPropulsion.leftDialRing} tone="lit" />
              <Line d={combustionPropulsion.rightDialRing} tone="lit" />

              {/* Realistic Analog Tachometer & Speedometer Dials */}
              <g className="select-none pointer-events-none" transform={`translate(${vehicleRightPt[0] - 55}, ${vehicleRightPt[1] - 32})`}>
                <rect width="110" height="64" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1.2" opacity="0.95" />
                {/* Left Dial: Tachometer */}
                <circle cx="28" cy="30" r="18" fill="#090d16" stroke="#a1a1aa" strokeWidth="1" />
                <line x1="28" y1="30" x2="38" y2="20" stroke="#ef4444" strokeWidth="1.5" />
                <text x="28" y="44" fill="#e4e4e7" fontSize="7" fontFamily="monospace" textAnchor="middle">4200 RPM</text>

                {/* Right Dial: Speedometer */}
                <circle cx="82" cy="30" r="18" fill="#090d16" stroke="#a1a1aa" strokeWidth="1" />
                <line x1="82" y1="30" x2="92" y2="24" stroke="#ef4444" strokeWidth="1.5" />
                <text x="82" y="44" fill="#e4e4e7" fontSize="7" fontFamily="monospace" textAnchor="middle">85 MPH</text>

                <text x="55" y="58" fill="#f59e0b" fontSize="7" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                  ANALOG GAUGES
                </text>
              </g>

              {/* Engine Block Technical Graphics */}
              <g className="select-none pointer-events-none" transform={`translate(${vehicleLeftPt[0] - 50}, ${vehicleLeftPt[1] - 15})`}>
                <rect width="100" height="30" rx="4" fill="#090d16" stroke="#f59e0b" strokeWidth="1" opacity="0.9" />
                <text x="50" y="14" fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  V8 ENGINE BLOCK
                </text>
                <text x="50" y="24" fill="#e4e4e7" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  TWIN MANIFOLD · 6.2L
                </text>
              </g>
            </>
          )}

          {/* In-Canvas Labeled Badges */}
          <g className="pointer-events-none select-none">
            <g transform={`translate(${vehicleLeftPt[0] - 70}, ${vehicleLeftPt[1] + 28})`}>
              <rect width="140" height="20" rx="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1" opacity="0.95" />
              <text x="70" y="14" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                🏷️ ProductA: PropulsionUnit
              </text>
            </g>

            <g transform={`translate(${vehicleRightPt[0] - 65}, ${vehicleRightPt[1] + 38})`}>
              <rect width="130" height="20" rx="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1" opacity="0.95" />
              <text x="65" y="14" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                🏷️ ProductB: CockpitDash
              </text>
            </g>
          </g>
        </Plate>
      )}
    </div>
  );
}
