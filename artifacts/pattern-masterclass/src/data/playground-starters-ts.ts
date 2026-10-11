import type { ProjectFile } from '../components/PlaygroundFileTabs';

/**
 * Curated modular multi-file TypeScript projects for all 23 GoF design patterns.
 * Every pattern contains:
 * - `index.ts` (Entry ⭐) importing and executing domain components.
 * - Dedicated abstraction and implementation modules.
 */
export const CURATED_TS_PROJECTS: Record<string, ProjectFile[]> = {
  // 1. Factory Method
  'factory-method': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { WindowsDialog, WebDialog } from './dialog';

console.log("=== TypeScript Factory Method Pattern Demo ===");

console.log("\\n[1] Rendering Desktop Dialog:");
const winDialog = new WindowsDialog();
winDialog.render();

console.log("\\n[2] Rendering Web Dialog:");
const webDialog = new WebDialog();
webDialog.render();
`,
    },
    {
      id: 'dialog-ts',
      name: 'dialog.ts',
      content: `import { Button, WindowsButton, HtmlButton } from './button';

export abstract class Dialog {
  abstract createButton(): Button;

  render(): void {
    const okButton = this.createButton();
    okButton.onClick(() => console.log("Dialog action: Click handler executed."));
    okButton.render();
  }
}

export class WindowsDialog extends Dialog {
  createButton(): Button {
    return new WindowsButton();
  }
}

export class WebDialog extends Dialog {
  createButton(): Button {
    return new HtmlButton();
  }
}
`,
    },
    {
      id: 'button-ts',
      name: 'button.ts',
      content: `export interface Button {
  render(): void;
  onClick(handler: () => void): void;
}

export class WindowsButton implements Button {
  render(): void {
    console.log("[Windows] Native win32 button rendered.");
  }
  onClick(handler: () => void): void {
    handler();
  }
}

export class HtmlButton implements Button {
  render(): void {
    console.log("[Web] HTML5 <button> rendered in DOM.");
  }
  onClick(handler: () => void): void {
    handler();
  }
}
`,
    },
  ],

  // 2. Abstract Factory
  'abstract-factory': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { GUIFactory, WinFactory, MacFactory } from './factories';

console.log("=== TypeScript Abstract Factory Pattern Demo ===");

function renderUI(factory: GUIFactory, platformName: string): void {
  console.log(\`\\n--- Creating Family for \${platformName} ---\`);
  const button = factory.createButton();
  const checkbox = factory.createCheckbox();
  button.paint();
  checkbox.paint();
}

renderUI(new WinFactory(), "Windows OS");
renderUI(new MacFactory(), "macOS Aqua");
`,
    },
    {
      id: 'factories-ts',
      name: 'factories.ts',
      content: `import { Button, Checkbox, WinButton, WinCheckbox, MacButton, MacCheckbox } from './components';

export interface GUIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}

export class WinFactory implements GUIFactory {
  createButton(): Button {
    return new WinButton();
  }
  createCheckbox(): Checkbox {
    return new WinCheckbox();
  }
}

export class MacFactory implements GUIFactory {
  createButton(): Button {
    return new MacButton();
  }
  createCheckbox(): Checkbox {
    return new MacCheckbox();
  }
}
`,
    },
    {
      id: 'components-ts',
      name: 'components.ts',
      content: `export interface Button {
  paint(): void;
}

export interface Checkbox {
  paint(): void;
}

export class WinButton implements Button {
  paint(): void {
    console.log("[Windows] Painted Windows themed 3D button.");
  }
}

export class WinCheckbox implements Checkbox {
  paint(): void {
    console.log("[Windows] Painted Windows square checkbox.");
  }
}

export class MacButton implements Button {
  paint(): void {
    console.log("[macOS] Painted rounded Aqua button.");
  }
}

export class MacCheckbox implements Checkbox {
  paint(): void {
    console.log("[macOS] Painted macOS smooth toggle checkbox.");
  }
}
`,
    },
  ],

  // 3. Builder
  'builder': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { ConcreteHouseBuilder, Director } from './builder';

console.log("=== TypeScript Builder Pattern Demo ===");

const builder = new ConcreteHouseBuilder();
const director = new Director();

console.log("\\n[1] Constructing Luxury Villa:");
director.buildLuxuryVilla(builder);
const villa = builder.getResult();
console.log(villa.describe());

builder.reset();
console.log("\\n[2] Constructing Minimal Cabin:");
director.buildMinimalCabin(builder);
const cabin = builder.getResult();
console.log(cabin.describe());
`,
    },
    {
      id: 'builder-ts',
      name: 'builder.ts',
      content: `import { House } from './house';

export interface HouseBuilder {
  reset(): void;
  setWalls(count: number): void;
  setDoors(count: number): void;
  setWindows(count: number): void;
  setRoof(type: string): void;
  setPool(hasPool: boolean): void;
  getResult(): House;
}

export class ConcreteHouseBuilder implements HouseBuilder {
  private house = new House();

  reset(): void {
    this.house = new House();
  }
  setWalls(count: number): void {
    this.house.walls = count;
  }
  setDoors(count: number): void {
    this.house.doors = count;
  }
  setWindows(count: number): void {
    this.house.windows = count;
  }
  setRoof(type: string): void {
    this.house.roof = type;
  }
  setPool(hasPool: boolean): void {
    this.house.hasPool = hasPool;
  }
  getResult(): House {
    return this.house;
  }
}

export class Director {
  buildLuxuryVilla(builder: HouseBuilder): void {
    builder.setWalls(8);
    builder.setDoors(4);
    builder.setWindows(12);
    builder.setRoof("Spanish Terracotta");
    builder.setPool(true);
  }

  buildMinimalCabin(builder: HouseBuilder): void {
    builder.setWalls(4);
    builder.setDoors(1);
    builder.setWindows(2);
    builder.setRoof("Pine Wood Shingles");
    builder.setPool(false);
  }
}
`,
    },
    {
      id: 'house-ts',
      name: 'house.ts',
      content: `export class House {
  walls = 0;
  doors = 0;
  windows = 0;
  roof = "None";
  hasPool = false;

  describe(): string {
    return \`House Specs: \${this.walls} walls, \${this.doors} doors, \${this.windows} windows, roof: "\${this.roof}", pool: \${this.hasPool ? 'YES' : 'NO'}\`;
  }
}
`,
    },
  ],

  // 4. Prototype
  'prototype': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { Circle, Rectangle } from './concrete-shapes';

console.log("=== TypeScript Prototype Pattern Demo ===");

const circle1 = new Circle(10, 20, "Crimson", 15);
const circle2 = circle1.clone();
circle2.x = 55; // customize cloned instance

const rect1 = new Rectangle(5, 5, "Navy Blue", 40, 25);
const rect2 = rect1.clone();
rect2.color = "Goldenrod";

console.log("Original Circle:", circle1.describe());
console.log("Cloned Circle:  ", circle2.describe());
console.log("Original Rect:  ", rect1.describe());
console.log("Cloned Rect:    ", rect2.describe());
console.log("\\nIndependent instance verified:", circle1 !== circle2);
`,
    },
    {
      id: 'shape-ts',
      name: 'shape.ts',
      content: `export abstract class Shape {
  constructor(public x: number, public y: number, public color: string) {}

  abstract clone(): Shape;
  abstract describe(): string;
}
`,
    },
    {
      id: 'concrete-shapes-ts',
      name: 'concrete-shapes.ts',
      content: `import { Shape } from './shape';

export class Circle extends Shape {
  constructor(x: number, y: number, color: string, public radius: number) {
    super(x, y, color);
  }

  clone(): Circle {
    return new Circle(this.x, this.y, this.color, this.radius);
  }

  describe(): string {
    return \`Circle at (\${this.x}, \${this.y}) with radius=\${this.radius}, color=\${this.color}\`;
  }
}

export class Rectangle extends Shape {
  constructor(x: number, y: number, color: string, public width: number, public height: number) {
    super(x, y, color);
  }

  clone(): Rectangle {
    return new Rectangle(this.x, this.y, this.color, this.width, this.height);
  }

  describe(): string {
    return \`Rectangle at (\${this.x}, \${this.y}) [\${this.width}x\${this.height}], color=\${this.color}\`;
  }
}
`,
    },
  ],

  // 5. Singleton
  'singleton': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { DatabaseConnection } from './database';

console.log("=== TypeScript Singleton Pattern Demo ===");

const db1 = DatabaseConnection.getInstance();
db1.query("SELECT * FROM users;");

const db2 = DatabaseConnection.getInstance();
db2.query("UPDATE accounts SET balance = balance + 100 WHERE id = 1;");

console.log("\\nVerifying singleton instance identity:");
console.log("db1 === db2:", db1 === db2);
console.log("Total queries executed through singleton:", db2.getQueryCount());
`,
    },
    {
      id: 'database-ts',
      name: 'database.ts',
      content: `export class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;
  private queryCount = 0;

  private constructor() {
    console.log("[DatabaseConnection] Initializing master connection pool...");
  }

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  query(sql: string): void {
    this.queryCount++;
    console.log(\`[DB Query #\${this.queryCount}]: \${sql}\`);
  }

  getQueryCount(): number {
    return this.queryCount;
  }
}
`,
    },
  ],

  // 6. Adapter
  'adapter': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { PaymentProcessor } from './payment-processor';
import { LegacyBankService } from './legacy-bank';
import { BankAdapter } from './bank-adapter';

console.log("=== TypeScript Adapter Pattern Demo ===");

const legacyBank = new LegacyBankService();
const adapter: PaymentProcessor = new BankAdapter(legacyBank);

console.log("\\nProcessing standard modern JSON payment transaction:");
adapter.processPayment("ACC-98214", 450.0);
`,
    },
    {
      id: 'payment-processor-ts',
      name: 'payment-processor.ts',
      content: `export interface PaymentProcessor {
  processPayment(accountNumber: string, amount: number): void;
}
`,
    },
    {
      id: 'legacy-bank-ts',
      name: 'legacy-bank.ts',
      content: `export class LegacyBankService {
  executeXmlTransaction(xmlPayload: string): void {
    console.log("[LegacyBankService] Ingesting XML wire transfer:");
    console.log(xmlPayload);
    console.log("[LegacyBankService] Transaction settled via SWIFT.");
  }
}
`,
    },
    {
      id: 'bank-adapter-ts',
      name: 'bank-adapter.ts',
      content: `import { PaymentProcessor } from './payment-processor';
import { LegacyBankService } from './legacy-bank';

export class BankAdapter implements PaymentProcessor {
  constructor(private legacyBank: LegacyBankService) {}

  processPayment(accountNumber: string, amount: number): void {
    const xml = \`<transfer><account>\${accountNumber}</account><amount>\${amount}</amount></transfer>\`;
    console.log(\`[BankAdapter] Converting JSON arguments to legacy XML...\`);
    this.legacyBank.executeXmlTransaction(xml);
  }
}
`,
    },
  ],

  // 7. Bridge
  'bridge': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { TvDevice, RadioDevice } from './device';
import { RemoteControl, AdvancedRemoteControl } from './remote';

console.log("=== TypeScript Bridge Pattern Demo ===");

console.log("\\n[1] Basic Remote with Smart TV:");
const tv = new TvDevice();
const basicRemote = new RemoteControl(tv);
basicRemote.togglePower();
basicRemote.volumeUp();

console.log("\\n[2] Advanced Remote with Radio:");
const radio = new RadioDevice();
const advancedRemote = new AdvancedRemoteControl(radio);
advancedRemote.togglePower();
advancedRemote.mute();
`,
    },
    {
      id: 'device-ts',
      name: 'device.ts',
      content: `export interface Device {
  isEnabled(): boolean;
  enable(): void;
  disable(): void;
  getVolume(): number;
  setVolume(percent: number): void;
}

export class TvDevice implements Device {
  private on = false;
  private volume = 30;

  isEnabled(): boolean { return this.on; }
  enable(): void { this.on = true; console.log("[TV] Screen powered ON."); }
  disable(): void { this.on = false; console.log("[TV] Screen powered OFF."); }
  getVolume(): number { return this.volume; }
  setVolume(percent: number): void {
    this.volume = percent;
    console.log(\`[TV] Audio volume set to \${this.volume}%\`);
  }
}

export class RadioDevice implements Device {
  private on = false;
  private volume = 15;

  isEnabled(): boolean { return this.on; }
  enable(): void { this.on = true; console.log("[Radio] Tuner tuned in."); }
  disable(): void { this.on = false; console.log("[Radio] Tuner powered down."); }
  getVolume(): number { return this.volume; }
  setVolume(percent: number): void {
    this.volume = percent;
    console.log(\`[Radio] FM volume set to \${this.volume}%\`);
  }
}
`,
    },
    {
      id: 'remote-ts',
      name: 'remote.ts',
      content: `import { Device } from './device';

export class RemoteControl {
  constructor(protected device: Device) {}

  togglePower(): void {
    if (this.device.isEnabled()) {
      this.device.disable();
    } else {
      this.device.enable();
    }
  }

  volumeUp(): void {
    this.device.setVolume(this.device.getVolume() + 10);
  }
}

export class AdvancedRemoteControl extends RemoteControl {
  mute(): void {
    console.log("[AdvancedRemote] Quick Mute button triggered.");
    this.device.setVolume(0);
  }
}
`,
    },
  ],

  // 8. Composite
  'composite': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { FileItem } from './file-item';
import { FolderItem } from './folder-item';

console.log("=== TypeScript Composite Pattern Demo ===");

const root = new FolderItem("root");
const docs = new FolderItem("Documents");
const images = new FolderItem("Images");

docs.add(new FileItem("resume.pdf", 120));
docs.add(new FileItem("budget.xlsx", 350));
images.add(new FileItem("avatar.png", 800));

root.add(docs);
root.add(images);
root.add(new FileItem("config.json", 15));

console.log("\\nDirectory Tree Structure:");
root.print();

console.log(\`\\nTotal Composite Size: \${root.getSize()} KB\`);
`,
    },
    {
      id: 'fs-item-ts',
      name: 'fs-item.ts',
      content: `export interface FileSystemItem {
  getName(): string;
  getSize(): number;
  print(indent?: string): void;
}
`,
    },
    {
      id: 'file-item-ts',
      name: 'file-item.ts',
      content: `import { FileSystemItem } from './fs-item';

export class FileItem implements FileSystemItem {
  constructor(private name: string, private sizeKb: number) {}

  getName(): string { return this.name; }
  getSize(): number { return this.sizeKb; }
  print(indent = ""): void {
    console.log(\`\${indent}📄 \${this.name} (\${this.sizeKb} KB)\`);
  }
}
`,
    },
    {
      id: 'folder-item-ts',
      name: 'folder-item.ts',
      content: `import { FileSystemItem } from './fs-item';

export class FolderItem implements FileSystemItem {
  private children: FileSystemItem[] = [];

  constructor(private name: string) {}

  add(item: FileSystemItem): void {
    this.children.push(item);
  }

  getName(): string { return this.name; }

  getSize(): number {
    return this.children.reduce((sum, item) => sum + item.getSize(), 0);
  }

  print(indent = ""): void {
    console.log(\`\${indent}📁 [\${this.name}/]\`);
    for (const child of this.children) {
      child.print(indent + "  ");
    }
  }
}
`,
    },
  ],

  // 9. Decorator
  'decorator': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { SimpleCoffee } from './coffee';
import { MilkDecorator, SugarDecorator } from './coffee-decorators';

console.log("=== TypeScript Decorator Pattern Demo ===");

let coffee = new SimpleCoffee();
console.log(\`Order: \${coffee.getDescription()} = $\${coffee.getCost().toFixed(2)}\`);

coffee = new MilkDecorator(coffee);
console.log(\`Order: \${coffee.getDescription()} = $\${coffee.getCost().toFixed(2)}\`);

coffee = new SugarDecorator(coffee);
console.log(\`Order: \${coffee.getDescription()} = $\${coffee.getCost().toFixed(2)}\`);
`,
    },
    {
      id: 'coffee-ts',
      name: 'coffee.ts',
      content: `export interface Coffee {
  getCost(): number;
  getDescription(): string;
}

export class SimpleCoffee implements Coffee {
  getCost(): number { return 2.5; }
  getDescription(): string { return "Espresso Roast"; }
}
`,
    },
    {
      id: 'coffee-decorators-ts',
      name: 'coffee-decorators.ts',
      content: `import { Coffee } from './coffee';

export abstract class CoffeeDecorator implements Coffee {
  constructor(protected decoratedCoffee: Coffee) {}

  getCost(): number {
    return this.decoratedCoffee.getCost();
  }
  getDescription(): string {
    return this.decoratedCoffee.getDescription();
  }
}

export class MilkDecorator extends CoffeeDecorator {
  getCost(): number { return super.getCost() + 0.75; }
  getDescription(): string { return super.getDescription() + " + Steamed Oat Milk"; }
}

export class SugarDecorator extends CoffeeDecorator {
  getCost(): number { return super.getCost() + 0.25; }
  getDescription(): string { return super.getDescription() + " + Organic Raw Sugar"; }
}
`,
    },
  ],

  // 10. Facade
  'facade': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { HomeTheaterFacade } from './home-theater-facade';

console.log("=== TypeScript Facade Pattern Demo ===");

const homeTheater = new HomeTheaterFacade();

console.log("\\n--- Movie Night Starting ---");
homeTheater.watchMovie("Interstellar");

console.log("\\n--- Movie Night Ending ---");
homeTheater.endMovie();
`,
    },
    {
      id: 'subsystems-ts',
      name: 'subsystems.ts',
      content: `export class Amplifier {
  on(): void { console.log("[Amplifier] Surround sound 7.1 turned ON."); }
  setVolume(level: number): void { console.log(\`[Amplifier] Volume adjusted to \${level}\`); }
  off(): void { console.log("[Amplifier] Audio system turned OFF."); }
}

export class Projector {
  on(): void { console.log("[Projector] 4K HDR laser turned ON."); }
  wideScreenMode(): void { console.log("[Projector] Aspect ratio set to 2.39:1 widescreen."); }
  off(): void { console.log("[Projector] Laser turned OFF."); }
}

export class TheaterLights {
  dim(percent: number): void { console.log(\`[TheaterLights] Dimmed ambient lighting to \${percent}%\`); }
  on(): void { console.log("[TheaterLights] Ambient lights restored to 100%"); }
}
`,
    },
    {
      id: 'home-theater-facade-ts',
      name: 'home-theater-facade.ts',
      content: `import { Amplifier, Projector, TheaterLights } from './subsystems';

export class HomeTheaterFacade {
  private amp = new Amplifier();
  private projector = new Projector();
  private lights = new TheaterLights();

  watchMovie(movieTitle: string): void {
    console.log(\`[Facade] Initializing cinema mode for "\${movieTitle}"...\`);
    this.lights.dim(10);
    this.projector.on();
    this.projector.wideScreenMode();
    this.amp.on();
    this.amp.setVolume(20);
    console.log(\`[Facade] Playing "\${movieTitle}". Enjoy the show!\`);
  }

  endMovie(): void {
    console.log("[Facade] Shutting down home cinema...");
    this.amp.off();
    this.projector.off();
    this.lights.on();
  }
}
`,
    },
  ],

  // 11. Flyweight
  'flyweight': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { TreeTypeFactory } from './tree-type';
import { Tree } from './tree';

console.log("=== TypeScript Flyweight Pattern Demo ===");

const trees: Tree[] = [];
const factory = new TreeTypeFactory();

// Planting 5 forest trees sharing 2 intrinsic types
trees.push(new Tree(10, 20, factory.getTreeType("Oak", "DarkGreen", "Rough")));
trees.push(new Tree(15, 25, factory.getTreeType("Oak", "DarkGreen", "Rough")));
trees.push(new Tree(30, 40, factory.getTreeType("Pine", "Emerald", "Needle")));
trees.push(new Tree(35, 45, factory.getTreeType("Pine", "Emerald", "Needle")));
trees.push(new Tree(50, 60, factory.getTreeType("Oak", "DarkGreen", "Rough")));

console.log("\\nRendering Forest:");
for (const tree of trees) {
  tree.draw();
}

console.log(\`\\nFlyweight cache pool size: \${factory.getPoolCount()} intrinsic types shared among \${trees.length} trees.\`);
`,
    },
    {
      id: 'tree-type-ts',
      name: 'tree-type.ts',
      content: `export class TreeType {
  constructor(public name: string, public color: string, public texture: string) {}

  draw(x: number, y: number): void {
    console.log(\`[TreeType: \${this.name}] Drew at coordinates (\${x}, \${y}) with color \${this.color}.\`);
  }
}

export class TreeTypeFactory {
  private cache = new Map<string, TreeType>();

  getTreeType(name: string, color: string, texture: string): TreeType {
    const key = \`\${name}_\${color}_\${texture}\`;
    let type = this.cache.get(key);
    if (!type) {
      type = new TreeType(name, color, texture);
      this.cache.set(key, type);
      console.log(\`[Factory] Created new shared TreeType flyweight: "\${name}"\`);
    }
    return type;
  }

  getPoolCount(): number {
    return this.cache.size;
  }
}
`,
    },
    {
      id: 'tree-ts',
      name: 'tree.ts',
      content: `import { TreeType } from './tree-type';

export class Tree {
  constructor(public x: number, public y: number, private type: TreeType) {}

  draw(): void {
    this.type.draw(this.x, this.y);
  }
}
`,
    },
  ],

  // 12. Proxy
  'proxy': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { RealVideoService } from './video-service';
import { CachingVideoProxy } from './caching-proxy';

console.log("=== TypeScript Proxy Pattern Demo ===");

const realService = new RealVideoService();
const proxy = new CachingVideoProxy(realService);

console.log("\\n[1] First request (Cache Miss - loads from remote):");
console.log(proxy.getVideo("design-patterns-101"));

console.log("\\n[2] Second request (Cache Hit - returns immediately):");
console.log(proxy.getVideo("design-patterns-101"));
`,
    },
    {
      id: 'video-service-ts',
      name: 'video-service.ts',
      content: `export interface VideoService {
  getVideo(videoId: string): string;
}

export class RealVideoService implements VideoService {
  getVideo(videoId: string): string {
    console.log(\`[RealVideoService] Fetching heavy video stream for "\${videoId}" across CDN network...\`);
    return \`[Video Data for \${videoId}]\`;
  }
}
`,
    },
    {
      id: 'caching-proxy-ts',
      name: 'caching-proxy.ts',
      content: `import { VideoService } from './video-service';

export class CachingVideoProxy implements VideoService {
  private cache = new Map<string, string>();

  constructor(private realService: VideoService) {}

  getVideo(videoId: string): string {
    if (this.cache.has(videoId)) {
      console.log(\`[Proxy] Cache hit for video "\${videoId}". Bypassing remote service.\`);
      return this.cache.get(videoId)!;
    }

    const data = this.realService.getVideo(videoId);
    this.cache.set(videoId, data);
    return data;
  }
}
`,
    },
  ],

  // 13. Chain of Responsibility
  'chain-of-responsibility': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { AuthHandler, RateLimitHandler, ValidationHandler } from './middleware-handlers';

console.log("=== TypeScript Chain of Responsibility Pattern Demo ===");

const auth = new AuthHandler();
const rateLimit = new RateLimitHandler();
const validation = new ValidationHandler();

// Form the processing pipeline
auth.setNext(rateLimit).setNext(validation);

console.log("\\n[1] Processing valid request:");
console.log("Pipeline result:", auth.handle({ token: "SECRET_AUTH_TOKEN", payload: "Valid Body", requestCount: 1 }));

console.log("\\n[2] Processing unauthenticated request:");
console.log("Pipeline result:", auth.handle({ token: "", payload: "Valid Body", requestCount: 1 }));
`,
    },
    {
      id: 'handler-ts',
      name: 'handler.ts',
      content: `export interface RequestData {
  token: string;
  payload: string;
  requestCount: number;
}

export abstract class Handler {
  private nextHandler: Handler | null = null;

  setNext(handler: Handler): Handler {
    this.nextHandler = handler;
    return handler;
  }

  handle(req: RequestData): boolean {
    if (this.nextHandler) {
      return this.nextHandler.handle(req);
    }
    return true;
  }
}
`,
    },
    {
      id: 'middleware-handlers-ts',
      name: 'middleware-handlers.ts',
      content: `import { Handler, RequestData } from './handler';

export class AuthHandler extends Handler {
  handle(req: RequestData): boolean {
    if (!req.token || req.token !== "SECRET_AUTH_TOKEN") {
      console.log("[AuthHandler] ✕ Authentication failed: Invalid token.");
      return false;
    }
    console.log("[AuthHandler] ✓ User token verified.");
    return super.handle(req);
  }
}

export class RateLimitHandler extends Handler {
  handle(req: RequestData): boolean {
    if (req.requestCount > 5) {
      console.log("[RateLimitHandler] ✕ Request rejected: Rate limit exceeded.");
      return false;
    }
    console.log("[RateLimitHandler] ✓ Rate limit within quota.");
    return super.handle(req);
  }
}

export class ValidationHandler extends Handler {
  handle(req: RequestData): boolean {
    if (!req.payload || req.payload.length === 0) {
      console.log("[ValidationHandler] ✕ Payload validation failed: Empty body.");
      return false;
    }
    console.log("[ValidationHandler] ✓ Request payload is valid.");
    return super.handle(req);
  }
}
`,
    },
  ],

  // 14. Command
  'command': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { Light, LightOnCommand, DimLightCommand, RemoteInvoker } from './device-commands';

console.log("=== TypeScript Command Pattern Demo ===");

const livingRoomLight = new Light();
const remote = new RemoteInvoker();

const turnOn = new LightOnCommand(livingRoomLight);
const dim = new DimLightCommand(livingRoomLight);

console.log("\\n[1] Executing Turn ON:");
remote.executeCommand(turnOn);

console.log("\\n[2] Executing Dim Command:");
remote.executeCommand(dim);

console.log("\\n[3] Triggering Undo:");
remote.undo();

console.log("\\n[4] Triggering Undo again:");
remote.undo();
`,
    },
    {
      id: 'command-ts',
      name: 'command.ts',
      content: `export interface Command {
  execute(): void;
  undo(): void;
}
`,
    },
    {
      id: 'device-commands-ts',
      name: 'device-commands.ts',
      content: `import { Command } from './command';

export class Light {
  turnOn(): void { console.log("[Light] Turned ON at 100% brightness."); }
  turnOff(): void { console.log("[Light] Turned OFF completely."); }
  dim(): void { console.log("[Light] Dimmed to 30% ambient glow."); }
}

export class LightOnCommand implements Command {
  constructor(private light: Light) {}
  execute(): void { this.light.turnOn(); }
  undo(): void { this.light.turnOff(); }
}

export class DimLightCommand implements Command {
  constructor(private light: Light) {}
  execute(): void { this.light.dim(); }
  undo(): void { this.light.turnOn(); }
}

export class RemoteInvoker {
  private history: Command[] = [];

  executeCommand(cmd: Command): void {
    cmd.execute();
    this.history.push(cmd);
  }

  undo(): void {
    const cmd = this.history.pop();
    if (cmd) {
      console.log("[Invoker] Undoing last command:");
      cmd.undo();
    } else {
      console.log("[Invoker] Nothing to undo.");
    }
  }
}
`,
    },
  ],

  // 15. Iterator
  'iterator': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { NotificationCollection } from './notification-feed';

console.log("=== TypeScript Iterator Pattern Demo ===");

const feed = new NotificationCollection();
feed.add("Alert: Server memory high (85%)");
feed.add("Notice: Security patch deployed");
feed.add("Info: Weekly backup completed");

console.log("\\nIterating through notification feed sequentially:");
const iterator = feed.createIterator();
while (iterator.hasNext()) {
  const item = iterator.next();
  console.log(\`› \${item}\`);
}
`,
    },
    {
      id: 'iterator-interface-ts',
      name: 'iterator-interface.ts',
      content: `export interface Iterator<T> {
  hasNext(): boolean;
  next(): T;
}

export interface IterableCollection<T> {
  createIterator(): Iterator<T>;
}
`,
    },
    {
      id: 'notification-feed-ts',
      name: 'notification-feed.ts',
      content: `import { Iterator, IterableCollection } from './iterator-interface';

export class NotificationIterator implements Iterator<string> {
  private position = 0;

  constructor(private items: string[]) {}

  hasNext(): boolean {
    return this.position < this.items.length;
  }

  next(): string {
    if (!this.hasNext()) throw new Error("Iterator out of bounds");
    const item = this.items[this.position];
    this.position++;
    return item;
  }
}

export class NotificationCollection implements IterableCollection<string> {
  private items: string[] = [];

  add(notification: string): void {
    this.items.push(notification);
  }

  createIterator(): Iterator<string> {
    return new NotificationIterator(this.items);
  }
}
`,
    },
  ],

  // 16. Mediator
  'mediator': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { ControlTower } from './mediator';
import { CommercialFlight, CargoFlight } from './aircraft';

console.log("=== TypeScript Mediator Pattern Demo ===");

const tower = new ControlTower();
const boeing = new CommercialFlight("Boeing 787", tower);
const airbus = new CargoFlight("Airbus A330F", tower);

tower.register(boeing);
tower.register(airbus);

console.log("\\n[1] Boeing requests landing clearance:");
boeing.send("Runway clear? Preparing final landing descent.");

console.log("\\n[2] Airbus responds:");
airbus.send("Hold position! Holding on taxiway Bravo.");
`,
    },
    {
      id: 'mediator-ts',
      name: 'mediator.ts',
      content: `import type { Aircraft } from './aircraft';

export interface AirTrafficMediator {
  sendMessage(message: string, sender: Aircraft): void;
}

export class ControlTower implements AirTrafficMediator {
  private planes: Aircraft[] = [];

  register(plane: Aircraft): void {
    this.planes.push(plane);
  }

  sendMessage(message: string, sender: Aircraft): void {
    for (const plane of this.planes) {
      if (plane !== sender) {
        plane.receive(message, sender.callsign);
      }
    }
  }
}
`,
    },
    {
      id: 'aircraft-ts',
      name: 'aircraft.ts',
      content: `import type { AirTrafficMediator } from './mediator';

export abstract class Aircraft {
  constructor(public callsign: string, protected tower: AirTrafficMediator) {}

  abstract send(msg: string): void;
  abstract receive(msg: string, from: string): void;
}

export class CommercialFlight extends Aircraft {
  send(msg: string): void {
    console.log(\`[\${this.callsign}] Broadcasting: "\${msg}"\`);
    this.tower.sendMessage(msg, this);
  }
  receive(msg: string, from: string): void {
    console.log(\`[\${this.callsign}] Received transmission from \${from}: "\${msg}"\`);
  }
}

export class CargoFlight extends Aircraft {
  send(msg: string): void {
    console.log(\`[\${this.callsign}] Broadcasting: "\${msg}"\`);
    this.tower.sendMessage(msg, this);
  }
  receive(msg: string, from: string): void {
    console.log(\`[\${this.callsign}] Received transmission from \${from}: "\${msg}"\`);
  }
}
`,
    },
  ],

  // 17. Memento
  'memento': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { TextEditor } from './text-editor';
import { HistoryCaretaker } from './editor-memento';

console.log("=== TypeScript Memento Pattern Demo ===");

const editor = new TextEditor();
const history = new HistoryCaretaker();

editor.type("First draft sentence.");
history.push(editor.save());

editor.type(" Second paragraph added.");
history.push(editor.save());

editor.type(" Unwanted modification!");
console.log("Current content:", editor.getContent());

console.log("\\n[1] Undoing last modification:");
const memento1 = history.pop();
if (memento1) editor.restore(memento1);
console.log("Content after Undo:", editor.getContent());

console.log("\\n[2] Undoing to first draft:");
const memento2 = history.pop();
if (memento2) editor.restore(memento2);
console.log("Content after second Undo:", editor.getContent());
`,
    },
    {
      id: 'text-editor-ts',
      name: 'text-editor.ts',
      content: `import { EditorMemento } from './editor-memento';

export class TextEditor {
  private content = "";

  type(words: string): void {
    this.content += words;
  }

  getContent(): string {
    return this.content;
  }

  save(): EditorMemento {
    return new EditorMemento(this.content);
  }

  restore(memento: EditorMemento): void {
    this.content = memento.getState();
  }
}
`,
    },
    {
      id: 'editor-memento-ts',
      name: 'editor-memento.ts',
      content: `export class EditorMemento {
  constructor(private readonly state: string) {}

  getState(): string {
    return this.state;
  }
}

export class HistoryCaretaker {
  private mementos: EditorMemento[] = [];

  push(memento: EditorMemento): void {
    this.mementos.push(memento);
  }

  pop(): EditorMemento | null {
    return this.mementos.pop() || null;
  }
}
`,
    },
  ],

  // 18. Observer
  'observer': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { Publisher } from './publisher';
import { EmailSubscriber, SmsSubscriber } from './subscribers';

console.log("=== TypeScript Observer Pattern Demo ===");

const newsPublisher = new Publisher();
const alice = new EmailSubscriber("alice@example.com");
const bob = new SmsSubscriber("+1-555-0199");

newsPublisher.subscribe(alice);
newsPublisher.subscribe(bob);

console.log("\\n--- Broadcasting Breaking News ---");
newsPublisher.notify("Major software update 2.0 released!");

newsPublisher.unsubscribe(bob);

console.log("\\n--- Broadcasting Follow-up News ---");
newsPublisher.notify("Maintenance scheduled for midnight.");
`,
    },
    {
      id: 'publisher-ts',
      name: 'publisher.ts',
      content: `import type { Subscriber } from './subscribers';

export class Publisher {
  private subscribers: Subscriber[] = [];

  subscribe(s: Subscriber): void {
    this.subscribers.push(s);
  }

  unsubscribe(s: Subscriber): void {
    this.subscribers = this.subscribers.filter(sub => sub !== s);
  }

  notify(message: string): void {
    for (const subscriber of this.subscribers) {
      subscriber.update(message);
    }
  }
}
`,
    },
    {
      id: 'subscribers-ts',
      name: 'subscribers.ts',
      content: `export interface Subscriber {
  update(message: string): void;
}

export class EmailSubscriber implements Subscriber {
  constructor(private email: string) {}

  update(message: string): void {
    console.log(\`[Email to \${this.email}]: \${message}\`);
  }
}

export class SmsSubscriber implements Subscriber {
  constructor(private phone: string) {}

  update(message: string): void {
    console.log(\`[SMS to \${this.phone}]: \${message}\`);
  }
}
`,
    },
  ],

  // 19. State
  'state': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { VendingMachine } from './vending-machine';

console.log("=== TypeScript State Pattern Demo ===");

const machine = new VendingMachine();

console.log("\\n[1] Insert coin & select item:");
machine.insertCoin();
machine.selectItem();

console.log("\\n[2] Attempt select without coin:");
machine.selectItem();
`,
    },
    {
      id: 'vending-state-ts',
      name: 'vending-state.ts',
      content: `import type { VendingMachine } from './vending-machine';

export interface VendingState {
  insertCoin(machine: VendingMachine): void;
  selectItem(machine: VendingMachine): void;
}

export class ReadyState implements VendingState {
  insertCoin(machine: VendingMachine): void {
    console.log("[ReadyState] Coin inserted successfully.");
    machine.setState(new HasCoinState());
  }

  selectItem(_machine: VendingMachine): void {
    console.log("[ReadyState] Please insert a coin first.");
  }
}

export class HasCoinState implements VendingState {
  insertCoin(_machine: VendingMachine): void {
    console.log("[HasCoinState] Coin already present.");
  }

  selectItem(machine: VendingMachine): void {
    console.log("[HasCoinState] Dispensing premium soda...");
    machine.setState(new ReadyState());
  }
}
`,
    },
    {
      id: 'vending-machine-ts',
      name: 'vending-machine.ts',
      content: `import { VendingState, ReadyState } from './vending-state';

export class VendingMachine {
  private state: VendingState = new ReadyState();

  setState(state: VendingState): void {
    this.state = state;
  }

  insertCoin(): void {
    this.state.insertCoin(this);
  }

  selectItem(): void {
    this.state.selectItem(this);
  }
}
`,
    },
  ],

  // 20. Strategy
  'strategy': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { Navigator } from './navigator';
import { DrivingStrategy, WalkingStrategy, PublicTransitStrategy } from './strategy';

console.log("=== TypeScript Strategy Pattern Demo ===");

const nav = new Navigator(new DrivingStrategy());
nav.planRoute("Central Station", "Airport");

nav.setStrategy(new PublicTransitStrategy());
nav.planRoute("Central Station", "Airport");

nav.setStrategy(new WalkingStrategy());
nav.planRoute("Museum", "Art Gallery");
`,
    },
    {
      id: 'strategy-ts',
      name: 'strategy.ts',
      content: `export interface RouteStrategy {
  buildRoute(start: string, end: string): void;
}

export class DrivingStrategy implements RouteStrategy {
  buildRoute(start: string, end: string): void {
    console.log(\`[Driving] Fastest highway route from "\${start}" to "\${end}": 24 mins via I-90.\`);
  }
}

export class PublicTransitStrategy implements RouteStrategy {
  buildRoute(start: string, end: string): void {
    console.log(\`[Transit] Subway Line 2 + Bus 41 from "\${start}" to "\${end}": 38 mins.\`);
  }
}

export class WalkingStrategy implements RouteStrategy {
  buildRoute(start: string, end: string): void {
    console.log(\`[Walking] Scenic pedestrian walkway from "\${start}" to "\${end}": 15 mins.\`);
  }
}
`,
    },
    {
      id: 'navigator-ts',
      name: 'navigator.ts',
      content: `import { RouteStrategy } from './strategy';

export class Navigator {
  constructor(private strategy: RouteStrategy) {}

  setStrategy(strategy: RouteStrategy): void {
    this.strategy = strategy;
  }

  planRoute(start: string, end: string): void {
    this.strategy.buildRoute(start, end);
  }
}
`,
    },
  ],

  // 21. Template Method
  'template-method': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { PdfDataMiner, CsvDataMiner } from './concrete-miners';

console.log("=== TypeScript Template Method Pattern Demo ===");

console.log("\\n[1] Mining PDF Document:");
const pdfMiner = new PdfDataMiner();
pdfMiner.mine("financial-report.pdf");

console.log("\\n[2] Mining CSV Data Table:");
const csvMiner = new CsvDataMiner();
csvMiner.mine("customer-metrics.csv");
`,
    },
    {
      id: 'data-miner-ts',
      name: 'data-miner.ts',
      content: `export abstract class DataMiner {
  /**
   * The Template Method defines the skeleton algorithm sequence.
   */
  mine(filePath: string): void {
    this.openFile(filePath);
    const raw = this.extractData();
    const parsed = this.parseData(raw);
    this.analyze(parsed);
    this.closeFile(filePath);
  }

  protected openFile(path: string): void {
    console.log(\`[BaseMiner] File opened: \${path}\`);
  }

  protected abstract extractData(): string;
  protected abstract parseData(raw: string): string[];

  protected analyze(data: string[]): void {
    console.log(\`[BaseMiner] Analyzed \${data.length} records. Insights generated.\`);
  }

  protected closeFile(path: string): void {
    console.log(\`[BaseMiner] File closed safely: \${path}\`);
  }
}
`,
    },
    {
      id: 'concrete-miners-ts',
      name: 'concrete-miners.ts',
      content: `import { DataMiner } from './data-miner';

export class PdfDataMiner extends DataMiner {
  protected extractData(): string {
    console.log("[PdfMiner] Extracting text streams via OCR rasterizer...");
    return "PAGE_1,PAGE_2,PAGE_3";
  }

  protected parseData(raw: string): string[] {
    console.log("[PdfMiner] Parsing PDF font dictionaries...");
    return raw.split(",");
  }
}

export class CsvDataMiner extends DataMiner {
  protected extractData(): string {
    console.log("[CsvMiner] Reading comma-separated row buffer...");
    return "row1,row2,row3,row4";
  }

  protected parseData(raw: string): string[] {
    console.log("[CsvMiner] Tokenizing CSV table lines...");
    return raw.split(",");
  }
}
`,
    },
  ],

  // 22. Visitor
  'visitor': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { ParagraphElement, HeadingElement } from './document-elements';
import { JsonExportVisitor, XmlExportVisitor } from './visitor';

console.log("=== TypeScript Visitor Pattern Demo ===");

const elements = [
  new HeadingElement("GoF Design Patterns", 1),
  new ParagraphElement("A masterclass on software architecture."),
];

console.log("\\n--- Exporting Document as JSON ---");
const jsonVisitor = new JsonExportVisitor();
for (const el of elements) {
  el.accept(jsonVisitor);
}

console.log("\\n--- Exporting Document as XML ---");
const xmlVisitor = new XmlExportVisitor();
for (const el of elements) {
  el.accept(xmlVisitor);
}
`,
    },
    {
      id: 'visitor-ts',
      name: 'visitor.ts',
      content: `import type { ParagraphElement, HeadingElement } from './document-elements';

export interface DocumentVisitor {
  visitParagraph(p: ParagraphElement): void;
  visitHeading(h: HeadingElement): void;
}

export class JsonExportVisitor implements DocumentVisitor {
  visitHeading(h: HeadingElement): void {
    console.log(\`JSON: { "type": "heading", "level": \${h.level}, "text": "\${h.text}" }\`);
  }
  visitParagraph(p: ParagraphElement): void {
    console.log(\`JSON: { "type": "paragraph", "content": "\${p.content}" }\`);
  }
}

export class XmlExportVisitor implements DocumentVisitor {
  visitHeading(h: HeadingElement): void {
    console.log(\`XML:  <h\${h.level}>\${h.text}</h\${h.level}>\`);
  }
  visitParagraph(p: ParagraphElement): void {
    console.log(\`XML:  <p>\${p.content}</p>\`);
  }
}
`,
    },
    {
      id: 'document-elements-ts',
      name: 'document-elements.ts',
      content: `import type { DocumentVisitor } from './visitor';

export interface DocumentElement {
  accept(visitor: DocumentVisitor): void;
}

export class HeadingElement implements DocumentElement {
  constructor(public text: string, public level: number) {}

  accept(visitor: DocumentVisitor): void {
    visitor.visitHeading(this);
  }
}

export class ParagraphElement implements DocumentElement {
  constructor(public content: string) {}

  accept(visitor: DocumentVisitor): void {
    visitor.visitParagraph(this);
  }
}
`,
    },
  ],

  // 23. Interpreter
  'interpreter': [
    {
      id: 'index-ts',
      name: 'index.ts',
      isEntryPoint: true,
      content: `import { NumberExpression, AddExpression, SubtractExpression } from './math-expressions';

console.log("=== TypeScript Interpreter Pattern Demo ===");

// Represent expression: (10 + 5) - (2 + 3)
const expr = new SubtractExpression(
  new AddExpression(new NumberExpression(10), new NumberExpression(5)),
  new AddExpression(new NumberExpression(2), new NumberExpression(3))
);

console.log("Expression: (10 + 5) - (2 + 3)");
console.log("Evaluated Result:", expr.interpret());
`,
    },
    {
      id: 'expression-ts',
      name: 'expression.ts',
      content: `export interface Expression {
  interpret(): number;
}
`,
    },
    {
      id: 'math-expressions-ts',
      name: 'math-expressions.ts',
      content: `import { Expression } from './expression';

export class NumberExpression implements Expression {
  constructor(private value: number) {}
  interpret(): number {
    return this.value;
  }
}

export class AddExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}
  interpret(): number {
    return this.left.interpret() + this.right.interpret();
  }
}

export class SubtractExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}
  interpret(): number {
    return this.left.interpret() - this.right.interpret();
  }
}
`,
    },
  ],
};
