# PRD: Interactive Pattern Studio (Rich Machine Anatomy & Unified UX) — v2.0

**Document ID:** PRD-2026-004-v2  
**Feature Slug:** `pattern-studio-anatomy`  
**Status:** In Active Implementation  
**Author:** Antigravity Agent  
**Created:** 2026-10-24 | **Revised:** 2026-10-24  
**Scope:** Complete Production Scope — Full 23 Gang of Four Patterns across 3 selectable perspectives (`generic`, `canonical`, `enterprise`), powered by the Anatomy isometric vector engine with **detailed, recognizable physical machine anatomy** (no generic slabs or plain blocks).

---

## 1. Executive Summary & Core Philosophy

The **Pattern Studio** (`/simulators`) is an interactive architectural laboratory where **"The object *is* the explanation"**. 

Instead of abstract UML boxes or bare geometric slabs with ambiguous bumps, every design pattern is realized as a **rich, recognizable machine, desktop workstation, or cloud topology** with 30–80 purposeful parts:
- **Pillars, bushings, pistons, and springs** for mechanical metaphors.
- **Authentic window frames, titlebars, traffic lights, and labeled buttons** (`[ OK ]`, `[✓ Auto-Save]`) for desktop canonical models.
- **Illuminated 19" server racks, sliding compute blades, glowing S3 storage canisters, and fiber optic conduits** for enterprise cloud architectures.

Physical interactions directly illuminate method dispatch traces, class participants, and call stack execution frames in a synchronized **Interactive Inspector**.

---

## 2. UI/UX Interface Redesign & Architectural Layout

```text
+-------------------------------------------------------------------------------------------------------------------------------+
| UNIFIED COMMAND BAR (Everything aligned in one clean, natural left-to-right eye path)                                         |
|                                                                                                                               |
| [ 1. PERSPECTIVE ]                                 [ 2. FAMILY VARIANT ]                      [ 3. ACTION TRIGGER ]           |
| (•) ⚙️ Metaphor   ( ) 💻 Canonical   ( ) ☁️ Cloud   | [ AWS Suite (EC2 + S3)* ] [ GCP Suite ]  | [ ⚡ Provision Family Stack ] |
+--------------------------------------------------------------------------------+----------------------------------------------+
| MAIN ISOMETRIC CANVAS (70% Width, Perfectly Centered, Vibrant Contrast)        | INTERACTIVE INSPECTOR DOCK (30% Width)       |
|                                                                                | (Full Height, Matching Canvas, 14px Type)    |
| +----------------------------------------------------------------------------+ |                                              |
| | 💡 GUIDANCE: Click any node or toggle family to watch matched suite build. | | [Tabs: ⚡ Live Event Trace (3) | 🏛️ GoF Roles] |
| |                                                                            | |                                              |
| |                                                                            | | CONCEPT IN A NUTSHELL:                       |
| |           [ 🏷️ AbstractProductA ]            [ 🏷️ AbstractProductB ]       | | "Abstract Factory guarantees you never mix   |
| |           +---------------------+           +---------------------+        | |  AWS EC2 compute with GCP Cloud Storage,     |
| |           |  19" SERVER RACK    |           | S3 STORAGE CANISTER |        | |  preventing fatal cross-cloud failures."     |
| |           |  - Status LEDs      |           | - Laser Sight Rings |        | |                                              |
| |           |  - Labeled EC2 Blade|====(bus)==> - 100 GB Data Port  |        | | LIVE METHOD CALL TRACE: (Readable 14px/12px) |
| |           |    [m6g.xlarge]     |           |   (Pulsing blue)    |        | | [16:42:01] AwsFactory.createCompute()        |
| |           +---------------------+           +---------------------+        | |   -> new Ec2Instance("m6g.xlarge")   [OK]     |
| |                     \                            /                         | | [16:42:01] AwsFactory.createStorage()        |
| |               +----------------------------------------+                   | |   -> new S3Bucket("100GB-standard")  [OK]     |
| |               |    SHARED VPC SUBNET BUS CONDUIT       |                   | |                                              |
| |               +----------------------------------------+                   | | GOF PARTICIPANTS & MAPPINGS:                 |
| |                                                                            | | • AbstractFactory : CloudResourceFactory     |
| | +-- HIGH-CONTRAST TELEMETRY STATUS HUD ----------------------------------+ | | • ConcreteFactory : AwsResourceFactory       |
| | | 🟢 STATUS: PROVISIONED · REGION: US-EAST-1 · COMPUTE: ACTIVE · 100GB    | | | • Product A       : ComputeInstance (EC2)   |
| | +------------------------------------------------------------------------+ | | • Product B       : StorageBucket (S3)      |
| +----------------------------------------------------------------------------+ |                                              |
|                                                                                | [ < Button: Open in Code Playground > ]      |
+--------------------------------------------------------------------------------+----------------------------------------------+
```

---

## 3. Intuitive Machine Anatomy Standards per Perspective

### 3.1 Generic Metaphor Perspective: *Vehicle / Automotive Assembly Factory*
Replaces confusing machining tooling with an universally understood real-world family concept:
- **Electric Vehicle (EV) Propulsion Suite (`ElectricVehicleFactory`)**:
  - `ProductA` (**Electric Battery & Inverter Motor**): High-voltage lithium battery pack with glowing blue energy cells, voltage readout (`400V DC`), and high-speed charging port.
  - `ProductB` (**Digital Glass Cockpit Dash**): Wide capacitive glass touchscreen displaying digital speedometer, battery percentage (`88%`), and range gauge.
- **Combustion Gas Propulsion Suite (`CombustionVehicleFactory`)**:
  - `ProductA` (**V8 Combustion Engine Block**): Heavy-duty cast iron engine block with exhaust manifold pipes, air intake filter, and serpentine drive belt.
  - `ProductB` (**Analog Dial Instrument Cluster**): Brushed aluminum dash featuring dual analog round dials (mechanical needle RPM tachometer and circular speedometer).
- **The Core Educational Lesson**:
  - It is immediately obvious to any learner why an analog tachometer cable or gasoline carburetor cannot be installed into a high-voltage lithium battery chassis. The Abstract Factory guarantees family consistency.

### 3.2 Canonical Desktop Perspective: *Upright Vertical Desktop Monitor Screen*
Oriented upright facing the user as a real computer display monitor (avoiding flat-on-desk confusion):
- **Physical Monitor Shell**:
  - Sleek modern display bezel with an aluminum desktop stand and subtle green power LED.
- **Upright Application Window**:
  - *macOS Mode*: Authentic macOS frosted titlebar with Apple traffic light buttons (Red, Yellow, Green), title `macOS AppKit Dialog`, rounded aqua blue pill button **`[  OK  ]`**, and rounded checkbox **`[ ✓  Auto-Save Preferences  ]`**.
  - *Windows Mode*: Windows Fluent dark mica frame with Win32 minimize, maximize, and `[ ✕ ]` close buttons, title `Win32 Fluent Dialog`, beveled dark button **`[  Submit  ]`**, and square checkbox **`[ ✓  Enable Telemetry  ]`**.
- **Factory Orchestration Header**:
  - Shows `MacFactory` or `WinFactory` dispatching native UI component constructors directly onto the display screen.

### 3.3 Enterprise Cloud Perspective: *Recognizable Cloud Architecture Topology*
Transformed from ambiguous gray slabs into an instantly recognizable, high-fidelity Cloud Architecture Topology:
- **Isolated Virtual Private Cloud (VPC) Boundary**:
  - Visual subnet container with high-contrast network boundary line (`10.0.0.0/16`).
- **AWS Cloud Stack (`AwsResourceFactory`)**:
  - *Compute Card*: AWS EC2 virtual server (`t4g.xlarge Graviton3`), CPU utilization meter (`14%`), RAM gauge (`8/16 GB`), and private IP (`10.0.1.42`).
  - *Storage Card*: AWS S3 storage canister (`prod-media-assets-bucket`), storage capacity meter (`100 GB Standard`), and AES-256 KMS encryption badge.
  - *Internal Network*: High-speed VPC connection bus with animated packet flow.
- **GCP Cloud Stack (`GcpResourceFactory`)**:
  - *Compute Card*: Google Compute Engine (`n2-standard-4`), CPU meter (`22%`), and internal IP (`10.128.0.2`).
  - *Storage Card*: Google Cloud Storage bucket (`gcs-analytics-storage`, `100 GB Multi-Regional`).
- **Cross-Cloud Incompatibility Guard**:
  - Clear visual explanation showing why Abstract Factory prevents catastrophic cross-cloud mistakes (e.g. attempting to link an EC2 instance to a GCP Storage Bucket causes IAM authentication failure and massive cross-cloud egress fees).


---

## 4. UI/UX Improvements & Standards

1. **Unified Command Bar**: All perspective selectors, variant chips, and action buttons live in one cohesive top bar directly above the canvas.
2. **Standardized Typography**:
   - Headings: `text-sm` (14px) font-semibold with good tracking.
   - Body & Explanations: `text-sm` (14px) font-sans leading-relaxed.
   - Code & Method Traces: `text-xs` (12px) font-mono with vibrant status tags (`[OK]`, `[DISPATCHED]`).
3. **Full-Height Inspector**: Dock dynamically fills the height of the main stage, eliminating dead space.
4. **Direct In-Canvas Labeled Badges**: Components have readable technical labels (`🏷️ AbstractProductA`, `🏷️ AbstractProductB`) with hover highlights.
5. **High-Contrast Telemetry Status HUD**: Prominently located across the bottom of the canvas.

---

## 5. Visual Aesthetics, Themes & Interactive Hotspots

### 5.1 Color Tokens & Material Finishes
- **Mechanical Machine**:
  - Bed / Anvil: Heavy cast iron (`#24272e` dark / `#e2e4e9` light) with 0.6px contrast bevels.
  - Guide Pillars: Dual polished steel cylinders with high specular highlights (`#94a3b8`).
  - Pneumatic Cylinder & Dial: Industrial blue or graphite body with brass pressure ring and needle.
  - Stamped Workpiece: Anodized aluminum with real laser-cut voids.
- **Desktop Workstation**:
  - Window Frame: Frosted mica (`#1e2028` dark / `#f3f4f6` light) with subtle 1px border.
  - Controls: Authentic Apple macOS aqua pill button with white text and Windows 11 Fluent checkmark.
- **Cloud Enclosure**:
  - Server Rack: 19-inch steel enclosure (`#161922` dark / `#eceef2` light) with ventilation slits and numbered rack unit (U) hash marks.
  - Blade & LEDs: Metallic blade face with glowing green/amber pulse LEDs (`#10b981`, `#f59e0b`).
  - S3 Canister: Cyberpunk-style cylindrical canister with glowing laser blue rings (`#38bdf8`) and readable storage capacity readout.

### 5.2 In-Canvas Interactive Hotspot Badges
Every key GoF participant rendered in SVG canvas has a floating pill badge:
- `🏷️ AbstractFactory`: Root factory head or multi-cloud orchestrator.
- `🏷️ AbstractProductA`: Primary output (Compute Blade / Dialog Button / Hex Die).
- `🏷️ AbstractProductB`: Secondary output (Storage Canister / Checkbox / Round Die).
Hovering or clicking any badge highlights the matching GoF role and method call in the **Correlation Dock**.

---

## 6. Verification & Quality Gates

- **Strict TypeScript checking**: Zero `any` types; monorepo typecheck `npm run typecheck` passes with exit code 0.
- **Zero Visual Clipping**: Dynamic depth-sorting (`depthOf()`) ensures sliding blades, moving pistons, and floating windows maintain correct isometric occlusion.
- **Full Theme Parity**: Tested and verified across Dark Mode (`#0b0b0b`) and Light Mode (`#fbfbfa`).
- **Responsive Layout**: Desktop canvas (70%) + Inspector Dock (30%) flex gracefully down to tablet/mobile stacked views.
