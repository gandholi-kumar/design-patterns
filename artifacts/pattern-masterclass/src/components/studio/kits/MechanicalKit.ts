import type { Projection, Plan, SolidPaths, Plane } from '../../../lib/anatomy/iso-kit';
import {
  slabOf,
  cylinder,
  roundedPlan,
  corners,
  haloOf,
  ring,
  planOutline,
  insetPlan,
  knurl,
  coil,
  topTicks,
  radialTicks,
  iso,
} from '../../../lib/anatomy/iso-kit';

export interface BasePlateGeometry {
  halo: string;
  slab: SolidPaths;
  groove: string;
  feet: SolidPaths[];
  screws: string[];
}

export function buildBasePlate(
  plan: Plan,
  height = 12,
  footRadius = 7,
  projection: Projection
): BasePlateGeometry {
  const halo = haloOf(plan, -height - 5, 12, projection);
  const slab = slabOf(plan, -height, height, projection, 8, 1.6);
  const groove = planOutline(insetPlan(plan, 5), 0, projection);
  
  const footPositions = corners(plan, 18);
  const feet: SolidPaths[] = [];
  for (const [x, y] of footPositions) {
    feet.push(cylinder(x, y, footRadius, -height - 4, 4, projection, 24));
  }

  const screwPositions = corners(plan, 10);
  const screws: string[] = [];
  for (const [x, y] of screwPositions) {
    screws.push(ring(x, y, 2.2, 0, projection, 16));
  }

  return { halo, slab, groove, feet, screws };
}

export interface DialGaugeGeometry {
  caseSlab: SolidPaths;
  bezelBand: string;
  bezelRing: string;
  ticks: { minor: string; major: string };
  hub: string;
}

export function buildDialGauge(
  cx: number,
  cy: number,
  radius: number,
  z: number,
  depth: number,
  projection: Projection
): DialGaugeGeometry {
  const caseSlab = cylinder(cx, cy, radius, z, depth, projection, 48, 0.8);
  const top = z + depth;
  const bezelBand = knurl(cx, cy, radius, top - 3, top, 48, projection);
  const bezelRing = ring(cx, cy, radius - 2, top, projection, 48);
  
  const tickAngles: [number, number] = [0, 360];
  const minorTicks: string[] = [];
  const majorTicks: string[] = [];
  const steps = 36;
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const isMajor = i % 6 === 0;
    const len = isMajor ? 3.6 : 1.8;
    const r0 = radius - 3;
    const r1 = r0 - len;
    const p0: Plane = [cx + r0 * Math.cos(angle), cy + r0 * Math.sin(angle)];
    const p1: Plane = [cx + r1 * Math.cos(angle), cy + r1 * Math.sin(angle)];
    // projected ticks
    const seg = ring(p0[0], p0[1], 0.2, top, projection, 8);
    if (isMajor) majorTicks.push(seg);
    else minorTicks.push(seg);
  }

  const hub = ring(cx, cy, 1.8, top, projection, 16);
  return {
    caseSlab,
    bezelBand,
    bezelRing,
    ticks: { minor: minorTicks.join(''), major: majorTicks.join('') },
    hub,
  };
}

export function buildSpringRod(
  fromX: number,
  toX: number,
  y: number,
  z: number,
  rodRadius: number,
  coilRadius: number,
  turns: number,
  projection: Projection
): {
  rod: SolidPaths;
  coil: { back: string; front: string };
} {
  const length = toX - fromX;
  const rodPlan: Plan = { x: fromX, y: y - rodRadius, w: length, d: rodRadius * 2, r: rodRadius };
  const rod = slabOf(rodPlan, z - rodRadius, rodRadius * 2, projection, 6, 0.4);
  const coilPaths = coil(fromX + 4, toX - 4, [y, z], coilRadius, turns, 'x', projection);
  return { rod, coil: coilPaths };
}

export interface DiePressAssembly {
  leftPillar: SolidPaths;
  rightPillar: SolidPaths;
  leftBushing: SolidPaths;
  rightBushing: SolidPaths;
  crossbeam: SolidPaths;
  pistonCylinder: SolidPaths;
  pistonRod: SolidPaths;
  toolTurret: SolidPaths;
}

export function buildDiePressFrame(
  leftX: number,
  rightX: number,
  y: number,
  pillarRadius: number,
  height: number,
  pistonZ: number,
  toolheadZ: number,
  projection: Projection
): DiePressAssembly {
  const leftPillar = cylinder(leftX, y, pillarRadius, 0, height, projection, 24, 0.4);
  const rightPillar = cylinder(rightX, y, pillarRadius, 0, height, projection, 24, 0.4);

  const leftBushing = cylinder(leftX, y, pillarRadius + 2.5, toolheadZ, 10, projection, 24, 0.6);
  const rightBushing = cylinder(rightX, y, pillarRadius + 2.5, toolheadZ, 10, projection, 24, 0.6);

  const beamPlan: Plan = {
    x: leftX - pillarRadius - 4,
    y: y - pillarRadius - 4,
    w: rightX - leftX + (pillarRadius + 4) * 2,
    d: (pillarRadius + 4) * 2,
    r: 4,
  };
  const crossbeam = slabOf(beamPlan, height, 12, projection, 4, 0.8);

  // Central pneumatic cylinder mounted to crossbeam
  const pistonCylinder = cylinder(0, y, 16, height - 8, 22, projection, 32, 0.6);
  // Chrome piston rod sliding down to toolheadZ
  const pistonRod = cylinder(0, y, 6, toolheadZ + 8, height - toolheadZ - 12, projection, 24, 0.2);

  // Tool Turret slider block
  const turretPlan: Plan = {
    x: leftX + pillarRadius,
    y: y - 14,
    w: rightX - leftX - pillarRadius * 2,
    d: 28,
    r: 4,
  };
  const toolTurret = slabOf(turretPlan, toolheadZ, 12, projection, 4, 0.8);

  return {
    leftPillar,
    rightPillar,
    leftBushing,
    rightBushing,
    crossbeam,
    pistonCylinder,
    pistonRod,
    toolTurret,
  };
}

export interface EvPropulsionGeometry {
  batteryChassis: SolidPaths;
  coolingFins: SolidPaths[];
  highVoltageTerminal: SolidPaths;
  digitalScreen: SolidPaths;
  screenGlass: string;
}

export function buildEvPropulsion(
  batteryPlan: Plan,
  dashPlan: Plan,
  projection: Projection
): EvPropulsionGeometry {
  const batteryChassis = slabOf(batteryPlan, 0, 18, projection, 6, 0.8);

  const coolingFins: SolidPaths[] = [];
  for (let i = 0; i < 4; i++) {
    const finPlan: Plan = {
      x: batteryPlan.x + 8 + i * 18,
      y: batteryPlan.y + 4,
      w: 12,
      d: batteryPlan.d - 8,
      r: 2,
    };
    coolingFins.push(slabOf(finPlan, 18, 4, projection, 2, 0.2));
  }

  const highVoltageTerminal = cylinder(
    batteryPlan.x + batteryPlan.w - 12,
    batteryPlan.y + batteryPlan.d / 2,
    6,
    18,
    8,
    projection,
    16
  );

  const digitalScreen = slabOf(dashPlan, 30, 22, projection, 4, 0.4);
  const screenGlass = planOutline(insetPlan(dashPlan, 2), 52.5, projection, 4);

  return {
    batteryChassis,
    coolingFins,
    highVoltageTerminal,
    digitalScreen,
    screenGlass,
  };
}

export interface CombustionPropulsionGeometry {
  engineBlock: SolidPaths;
  cylinderHeads: SolidPaths[];
  exhaustPipes: string[];
  dualAnalogCluster: SolidPaths;
  leftDialRing: string;
  rightDialRing: string;
}

export function buildCombustionPropulsion(
  enginePlan: Plan,
  dashPlan: Plan,
  projection: Projection
): CombustionPropulsionGeometry {
  const engineBlock = slabOf(enginePlan, 0, 24, projection, 4, 1.2);

  const cylinderHeads: SolidPaths[] = [
    slabOf({ x: enginePlan.x + 4, y: enginePlan.y + 4, w: (enginePlan.w - 12) / 2, d: enginePlan.d - 8, r: 2 }, 24, 8, projection, 2, 0.4),
    slabOf({ x: enginePlan.x + 8 + (enginePlan.w - 12) / 2, y: enginePlan.y + 4, w: (enginePlan.w - 12) / 2, d: enginePlan.d - 8, r: 2 }, 24, 8, projection, 2, 0.4),
  ];

  // Exhaust manifold pipe curves
  const p1 = iso([enginePlan.x, enginePlan.y + 8, 12], projection);
  const p2 = iso([enginePlan.x - 14, enginePlan.y + 12, 4], projection);
  const p3 = iso([enginePlan.x, enginePlan.y + 24, 12], projection);
  const p4 = iso([enginePlan.x - 14, enginePlan.y + 28, 4], projection);
  const exhaustPipes = [
    `M${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]}`,
    `M${p3[0]} ${p3[1]} L${p4[0]} ${p4[1]}`,
  ];

  const dualAnalogCluster = slabOf(dashPlan, 30, 22, projection, 4, 0.6);
  const leftDialRing = ring(dashPlan.x + dashPlan.w * 0.3, dashPlan.y + dashPlan.d / 2, 9, 52.5, projection, 24);
  const rightDialRing = ring(dashPlan.x + dashPlan.w * 0.7, dashPlan.y + dashPlan.d / 2, 9, 52.5, projection, 24);

  return {
    engineBlock,
    cylinderHeads,
    exhaustPipes,
    dualAnalogCluster,
    leftDialRing,
    rightDialRing,
  };
}


