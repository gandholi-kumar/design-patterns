import type { Projection, Plan, SolidPaths } from '../../../lib/anatomy/iso-kit';
import { slabOf, planOutline, insetPlan, lineOnTop, ring, iso } from '../../../lib/anatomy/iso-kit';

export interface IsoWindowGeometry {
  frame: SolidPaths;
  titleBar: SolidPaths;
  contentPane: string;
  buttons: { x: number; y: number; r: number }[];
}

export function buildIsoWindow(
  plan: Plan,
  z: number,
  style: 'win' | 'mac',
  projection: Projection
): IsoWindowGeometry {
  const frameHeight = 6;
  const frame = slabOf(plan, z, frameHeight, projection, style === 'mac' ? 8 : 2, 0.8);
  
  // Title bar slab
  const titlePlan: Plan = {
    x: plan.x + 2,
    y: plan.y + 2,
    w: plan.w - 4,
    d: 14,
    r: style === 'mac' ? 6 : 1,
  };
  const titleBar = slabOf(titlePlan, z + frameHeight, 1.2, projection, style === 'mac' ? 6 : 2, 0.2);

  // Content pane outline
  const panePlan = insetPlan(plan, 6);
  panePlan.d -= 14;
  panePlan.y += 14;
  const contentPane = planOutline(panePlan, z + frameHeight, projection, 4);

  // Window control buttons
  const buttons = style === 'mac'
    ? [
        { x: plan.x + 8, y: plan.y + 8, r: 2.2 },
        { x: plan.x + 15, y: plan.y + 8, r: 2.2 },
        { x: plan.x + 22, y: plan.y + 8, r: 2.2 },
      ]
    : [
        { x: plan.x + plan.w - 8, y: plan.y + 8, r: 2 },
        { x: plan.x + plan.w - 16, y: plan.y + 8, r: 2 },
      ];

  return { frame, titleBar, contentPane, buttons };
}

export interface IsoButtonGeometry {
  slab: SolidPaths;
  highlight: string;
  pressed: SolidPaths;
}

export function buildIsoButton(
  plan: Plan,
  z: number,
  height = 4,
  style: 'win' | 'mac' = 'mac',
  projection: Projection
): IsoButtonGeometry {
  const slab = slabOf(plan, z, height, projection, style === 'mac' ? 6 : 1, 0.6);
  const pressed = slabOf(plan, z, height * 0.4, projection, style === 'mac' ? 6 : 1, 0.2);
  const highlight = lineOnTop([plan.x + 2, plan.y + 2], [plan.x + plan.w - 2, plan.y + 2], z + height, projection);
  return { slab, highlight, pressed };
}

export interface HeapObjectGeometry {
  box: SolidPaths;
  header: SolidPaths;
  divider: string;
}

export function buildHeapObject(
  className: string,
  plan: Plan,
  z: number,
  height = 18,
  projection: Projection
): HeapObjectGeometry {
  const box = slabOf(plan, z, height, projection, 4, 0.8);
  const headerPlan: Plan = { x: plan.x + 1, y: plan.y + 1, w: plan.w - 2, d: 10, r: 2 };
  const header = slabOf(headerPlan, z + height, 1.4, projection, 4, 0.2);
  const divider = lineOnTop([plan.x + 2, plan.y + 12], [plan.x + plan.w - 2, plan.y + 12], z + height, projection);
  return { box, header, divider };
}

export interface FactorySpawnerToolGeometry {
  overheadArm: SolidPaths;
  spawnerHead: SolidPaths;
  emitterBeam: string;
}

export function buildFactorySpawnerTool(
  cx: number,
  cy: number,
  z: number,
  projection: Projection
): FactorySpawnerToolGeometry {
  const armPlan: Plan = { x: cx - 20, y: cy - 6, w: 40, d: 12, r: 3 };
  const overheadArm = slabOf(armPlan, z + 20, 6, projection, 3, 0.4);

  const headPlan: Plan = { x: cx - 12, y: cy - 12, w: 24, d: 24, r: 4 };
  const spawnerHead = slabOf(headPlan, z + 8, 12, projection, 4, 0.8);

  const pTop = iso([cx, cy, z + 8], projection);
  const pBottom = iso([cx, cy, z - 10], projection);
  const emitterBeam = `M${pTop[0]} ${pTop[1]} L${pBottom[0]} ${pBottom[1]}`;

  return { overheadArm, spawnerHead, emitterBeam };
}

export interface UprightMonitorGeometry {
  standBase: SolidPaths;
  standNeck: SolidPaths;
  monitorFrame: SolidPaths;
  screenGlass: string;
  powerLed: [number, number];
}

export function buildUprightMonitor(
  width = 240,
  height = 130,
  zOffset = 30,
  projection: Projection
): UprightMonitorGeometry {
  // Stand base on desk
  const standBasePlan: Plan = { x: -45, y: -25, w: 90, d: 50, r: 8 };
  const standBase = slabOf(standBasePlan, 0, 4, projection, 6, 0.4);

  // Vertical monitor stand neck
  const neckPlan: Plan = { x: -14, y: -10, w: 28, d: 20, r: 4 };
  const standNeck = slabOf(neckPlan, 4, zOffset + 20, projection, 4, 0.4);

  // Monitor frame (thin depth d: 14, tall height)
  const framePlan: Plan = {
    x: -width / 2,
    y: -8,
    w: width,
    d: 16,
    r: 6,
  };
  const monitorFrame = slabOf(framePlan, zOffset, height, projection, 4, 0.8);

  // Screen display front pane
  const innerPlan: Plan = {
    x: framePlan.x + 6,
    y: framePlan.y + 1,
    w: framePlan.w - 12,
    d: 4,
    r: 4,
  };
  const screenGlass = planOutline(innerPlan, zOffset + height - 2, projection, 4);

  const powerPt = iso([0, framePlan.y + framePlan.d, zOffset + 2], projection);

  return {
    standBase,
    standNeck,
    monitorFrame,
    screenGlass,
    powerLed: powerPt,
  };
}


