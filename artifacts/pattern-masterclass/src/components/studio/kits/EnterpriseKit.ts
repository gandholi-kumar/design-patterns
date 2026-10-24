import type { Projection, Plan, SolidPaths, Plane } from '../../../lib/anatomy/iso-kit';
import {
  slabOf,
  cylinder,
  planOutline,
  insetPlan,
  dotGrid,
  segment,
  rise,
  sideArc,
  knurl,
  iso,
  ring,
} from '../../../lib/anatomy/iso-kit';

export interface ServerRackGeometry {
  chassis: SolidPaths;
  bays: SolidPaths[];
  frontRails: string[];
  statusLeds: { x: number; y: number; z: number }[];
  basePlate: SolidPaths;
}

export function buildServerRack(
  plan: Plan,
  z: number,
  height: number,
  bayCount = 4,
  projection: Projection
): ServerRackGeometry {
  const basePlan = insetPlan(plan, -4);
  const basePlate = slabOf(basePlan, z, 4, projection, 4, 0.8);
  const chassis = slabOf(plan, z + 4, height, projection, 4, 1.2);

  const bayHeight = Math.floor((height - 16) / bayCount);
  const bays: SolidPaths[] = [];
  const statusLeds: { x: number; y: number; z: number }[] = [];
  const frontRails: string[] = [];

  for (let i = 0; i < bayCount; i++) {
    const bayZ = z + 8 + i * bayHeight;
    const bayPlan: Plan = {
      x: plan.x + 4,
      y: plan.y + 4,
      w: plan.w - 8,
      d: plan.d - 8,
      r: 1.5,
    };
    bays.push(slabOf(bayPlan, bayZ, bayHeight - 3, projection, 2, 0.4));

    // LED status light on the left rack ear
    statusLeds.push({
      x: plan.x + 2,
      y: plan.y + plan.d - 2,
      z: bayZ + bayHeight * 0.5,
    });

    // Front rack unit tick hash
    const p1 = iso([plan.x + 1, plan.y + plan.d, bayZ], projection);
    const p2 = iso([plan.x + 3, plan.y + plan.d, bayZ], projection);
    frontRails.push(`M${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]}`);
  }

  return { chassis, bays, frontRails, statusLeds, basePlate };
}

export interface StorageCanisterGeometry {
  cylinderBody: SolidPaths;
  rimCollar: SolidPaths;
  sightRings: string[];
  dataPort: SolidPaths;
  laserMeter: string;
}

export function buildStorageCanister(
  cx: number,
  cy: number,
  radius: number,
  z: number,
  height: number,
  projection: Projection
): StorageCanisterGeometry {
  const cylinderBody = cylinder(cx, cy, radius, z, height, projection, 36, 0.8);
  const rimCollar = cylinder(cx, cy, radius + 2, z + height - 5, 5, projection, 36, 0.4);
  
  // Multiple glowing sight rings
  const sightRings = [
    sideArc(cx, cy, radius + 0.3, z + height * 0.35, projection, 24),
    sideArc(cx, cy, radius + 0.3, z + height * 0.65, projection, 24),
  ];
  
  const dataPort = cylinder(cx, cy + radius - 3, 3.5, z + height, 4, projection, 16);
  const laserMeter = ring(cx, cy, radius * 0.65, z + height + 0.5, projection, 24);

  return { cylinderBody, rimCollar, sightRings, dataPort, laserMeter };
}

export interface ConduitLineGeometry {
  path: string;
  collars: SolidPaths[];
}

export function buildConduitPipes(
  from: [number, number, number],
  mid: [number, number, number],
  to: [number, number, number],
  radius = 2.4,
  projection: Projection
): ConduitLineGeometry {
  const seg1 = segment(from, mid, projection);
  const seg2 = segment(mid, to, projection);
  const path = `${seg1}${seg2}`;

  const collars = [
    cylinder(from[0], from[1], radius + 1.2, from[2] - 1, 3, projection, 16),
    cylinder(mid[0], mid[1], radius + 1.2, mid[2] - 1, 3, projection, 16),
    cylinder(to[0], to[1], radius + 1.2, to[2] - 1, 3, projection, 16),
  ];

  return { path, collars };
}

export function buildSubnetPerimeter(
  plan: Plan,
  z: number,
  projection: Projection
): { base: SolidPaths; boundaryRing: string } {
  const base = slabOf(plan, z, 3, projection, 8, 0.6);
  const boundaryRing = planOutline(insetPlan(plan, 4), z + 3.2, projection, 8);
  return { base, boundaryRing };
}

export interface CloudNodeCardGeometry {
  pedestal: SolidPaths;
  facePlate: SolidPaths;
  statusBorder: string;
  terminalPort: SolidPaths;
}

export function buildCloudNodeCard(
  plan: Plan,
  z: number,
  height = 14,
  projection: Projection
): CloudNodeCardGeometry {
  const pedestal = slabOf(plan, z, height, projection, 4, 0.8);
  const facePlan: Plan = {
    x: plan.x + 2,
    y: plan.y + 2,
    w: plan.w - 4,
    d: plan.d - 4,
    r: 3,
  };
  const facePlate = slabOf(facePlan, z + height, 2, projection, 3, 0.2);
  const statusBorder = planOutline(facePlan, z + height + 2.2, projection, 3);
  const terminalPort = cylinder(plan.x + plan.w / 2, plan.y + plan.d - 4, 3, z + height + 2, 3, projection, 16);

  return { pedestal, facePlate, statusBorder, terminalPort };
}


