import type { DomainVariant } from '../pattern-types';

export const CANONICAL_DATA: Record<string, DomainVariant> = {
  'factory-method': {
    title: 'Cross-Platform UI Dialog & Logistics Fleet',
    scenario: 'Logistics management app with Sea and Road freight transport, or Cross-Platform GUI dialogs rendering Windows and Web buttons.',
    problem: 'Directly calling concrete constructors couples client code to specific classes (e.g. Truck or WindowsButton), making extension for new types impossible without modifying existing code.',
    solution: 'Replace direct constructor calls with a special factory method. Subclasses override the factory method to return different concrete products that share a common interface.',
    whenToUse: [
      'Use when you do not know beforehand the exact types and dependencies of the objects your code should work with.',
      'Use when you want to provide users of your library or framework with a way to extend its internal components.',
      'Use when you want to save system resources by reusing existing objects instead of rebuilding them each time.',
    ],
    whenNotToUse: [
      'Avoid when object creation is simple, fixed, and unlikely to ever require subclass extension.',
      'Think twice if introducing the pattern results in a proliferation of small creator subclasses for trivial variations.',
    ],
    asciiShape: `Client ──► Dialog.render()
             │
             ▼
        createButton() [Factory Method]
             │
       ┌─────┴─────┐
       ▼           ▼
WindowsDialog   WebDialog
       │           │
       ▼           ▼
WindowsButton   HTMLButton`,
    typeScript: {
      fileName: 'Dialog.ts',
      explanation: 'Base Dialog defines createButton() factory method; WindowsDialog and WebDialog return platform-specific button products.',
      code: `interface Button {
  render(): void;
  onClick(handler: () => void): void;
}

class WindowsButton implements Button {
  render() { console.log("[Windows] Rendered native button widget."); }
  onClick(fn: () => void) { console.log("[Windows] Hooked Win32 click listener."); fn(); }
}

class HTMLButton implements Button {
  render() { console.log("[Web] Rendered <button class='btn'>."); }
  onClick(fn: () => void) { console.log("[Web] Hooked DOM event listener."); fn(); }
}

abstract class Dialog {
  // Factory Method
  abstract createButton(): Button;

  render() {
    const okButton = this.createButton();
    okButton.onClick(() => console.log("Dialog closed."));
    okButton.render();
  }
}

class WindowsDialog extends Dialog {
  createButton(): Button { return new WindowsButton(); }
}

class WebDialog extends Dialog {
  createButton(): Button { return new HTMLButton(); }
}

// Client usage
const dialog: Dialog = new WindowsDialog();
dialog.render();`,
    },
    java: {
      fileName: 'Dialog.java',
      explanation: 'Standard Java implementation of Factory Method where Dialog delegates button creation to subclasses.',
      code: `public interface Button {
    void render();
    void onClick(Runnable handler);
}

public class WindowsButton implements Button {
    public void render() { System.out.println("[Windows] Native button rendered."); }
    public void onClick(Runnable handler) { handler.run(); }
}

public class HtmlButton implements Button {
    public void render() { System.out.println("[Web] HTML button rendered."); }
    public void onClick(Runnable handler) { handler.run(); }
}

public abstract class Dialog {
    public abstract Button createButton();

    public void render() {
        Button okButton = createButton();
        okButton.onClick(() -> System.out.println("Dialog action triggered."));
        okButton.render();
    }
}`,
    },
    diagramUml: `classDiagram
direction LR
class Creator {
  +factoryMethod() Product
  +operation()
}
class ConcreteCreatorA {
  +factoryMethod() Product
}
class ConcreteCreatorB {
  +factoryMethod() Product
}
class Product {
  <<interface>>
  +doStuff()
}
class ConcreteProductA
class ConcreteProductB
Creator <|-- ConcreteCreatorA
Creator <|-- ConcreteCreatorB
Product <|.. ConcreteProductA
Product <|.. ConcreteProductB
ConcreteCreatorA ..> ConcreteProductA : creates
ConcreteCreatorB ..> ConcreteProductB : creates`,
    diagramFlowchart: `flowchart LR
Client["Client Code"] -->|"calls render()"| Creator["Creator (Dialog)"]
Creator -->|invokes| FactoryMethod["createButton()"]
FactoryMethod -->|overridden in| Subclass["ConcreteCreator (WindowsDialog)"]
Subclass -->|instantiates| Product["ConcreteProduct (WindowsButton)"]
Product -.->|implements| Contract["Product Interface (Button)"]`,
  },

  'abstract-factory': {
    title: 'Cross-Platform UI Component Kits',
    scenario: 'A GUI library needs to support Windows and macOS look-and-feel across multiple UI components (Buttons, Checkboxes) without mixing operating system styles.',
    problem: 'Clients need to instantiate sets of related products (e.g. MacButton + MacCheckbox) and must never accidentally mix incompatible variants (e.g. WinButton + MacCheckbox).',
    solution: 'Define an Abstract Factory interface declaring creation methods for each product in the family. Create concrete factory classes for each visual variant.',
    whenToUse: [
      'Use when your code needs to work with various families of related products, but should not depend on the concrete classes of those products.',
      'Use when you want to enforce that products from one family are always used together consistently.',
    ],
    whenNotToUse: [
      'Avoid if your application does not have existing families of products or if you frequently need to add new product kinds.',
    ],
    asciiShape: `Client ──► GUIFactory ──► { createButton(), createCheckbox() }
                │
       ┌────────┴────────┐
       ▼                 ▼
  WinFactory         MacFactory
   ├── WinButton      ├── MacButton
   └── WinCheckbox    └── MacCheckbox`,
    typeScript: {
      fileName: 'GuiFactory.ts',
      explanation: 'GUIFactory interface declares methods for creating all products in the UI family; WinFactory and MacFactory implement them.',
      code: `interface Button { paint(): void; }
interface Checkbox { paint(): void; }

class WinButton implements Button { paint() { console.log("Render Windows Button"); } }
class WinCheckbox implements Checkbox { paint() { console.log("Render Windows Checkbox"); } }

class MacButton implements Button { paint() { console.log("Render Mac Button"); } }
class MacCheckbox implements Checkbox { paint() { console.log("Render Mac Checkbox"); } }

interface GUIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}

class WinFactory implements GUIFactory {
  createButton() { return new WinButton(); }
  createCheckbox() { return new WinCheckbox(); }
}

class MacFactory implements GUIFactory {
  createButton() { return new MacButton(); }
  createCheckbox() { return new MacCheckbox(); }
}

// Client code works with factories polymorphically
function renderUI(factory: GUIFactory) {
  factory.createButton().paint();
  factory.createCheckbox().paint();
}

renderUI(new MacFactory());`,
    },
    java: {
      fileName: 'GuiFactory.java',
      explanation: 'Abstract Factory in Java producing matching pairs of Button and Checkbox widgets.',
      code: `public interface Button { void paint(); }
public interface Checkbox { void paint(); }

public class WinButton implements Button { public void paint() { System.out.println("Win Button"); } }
public class WinCheckbox implements Checkbox { public void paint() { System.out.println("Win Checkbox"); } }

public interface GUIFactory {
    Button createButton();
    Checkbox createCheckbox();
}

public class WinFactory implements GUIFactory {
    public Button createButton() { return new WinButton(); }
    public Checkbox createCheckbox() { return new WinCheckbox(); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class AbstractFactory {
  <<interface>>
  +createButton() Button
  +createCheckbox() Checkbox
}
class WinFactory
class MacFactory
class Button { <<interface>> }
class Checkbox { <<interface>> }
AbstractFactory <|.. WinFactory
AbstractFactory <|.. MacFactory
WinFactory ..> Button : creates
WinFactory ..> Checkbox : creates
MacFactory ..> Button : creates
MacFactory ..> Checkbox : creates`,
    diagramFlowchart: `flowchart LR
Client["Client Code"] -->|requests suite| Factory["GUIFactory"]
Factory -->|variant| ConcreteFactory["MacFactory"]
ConcreteFactory -->|produces| B["MacButton"]
ConcreteFactory -->|produces| C["MacCheckbox"]`,
  },

  builder: {
    title: 'Custom House & Query Construction',
    scenario: 'Building complex houses with optional walls, doors, swimming pools, garages, and smart heating systems without telescoping constructors.',
    problem: 'Constructors with dozens of optional parameters are error-prone, hard to read, and result in ugly null parameter lists (telescoping constructor antipattern).',
    solution: 'Extract object construction code into a separate Builder object. Build objects step by step through chaining methods, and retrieve the final product via build().',
    whenToUse: [
      'Use when constructing complex objects with many optional configuration steps.',
      'Use when you want to create different representations of the same product using the same construction process.',
    ],
    whenNotToUse: [
      'Avoid for simple objects with only a few mandatory fields where a standard constructor or parameter object suffices.',
    ],
    asciiShape: `Director ──► Builder.setSeats(4)
            ├──► Builder.setEngine("V8")
            ├──► Builder.setGPS(true)
            └──► Builder.build() ──► Car`,
    typeScript: {
      fileName: 'HouseBuilder.ts',
      explanation: 'HouseBuilder collects configuration step-by-step and returns the configured House upon calling getResult().',
      code: `class House {
  windows = 4;
  doors = 1;
  hasGarage = false;
  hasPool = false;
  describe() {
    console.log(\`House: \${this.windows} windows, \${this.doors} doors, Garage: \${this.hasGarage}, Pool: \${this.hasPool}\`);
  }
}

interface HouseBuilder {
  reset(): void;
  setWindows(n: number): this;
  setDoors(n: number): this;
  buildGarage(): this;
  buildPool(): this;
  getResult(): House;
}

class ConcreteHouseBuilder implements HouseBuilder {
  private house = new House();
  reset() { this.house = new House(); }
  setWindows(n: number) { this.house.windows = n; return this; }
  setDoors(n: number) { this.house.doors = n; return this; }
  buildGarage() { this.house.hasGarage = true; return this; }
  buildPool() { this.house.hasPool = true; return this; }
  getResult() {
    const product = this.house;
    this.reset();
    return product;
  }
}

const builder = new ConcreteHouseBuilder();
const luxuryVilla = builder.setWindows(12).setDoors(3).buildGarage().buildPool().getResult();
luxuryVilla.describe();`,
    },
    java: {
      fileName: 'HouseBuilder.java',
      explanation: 'Fluent builder pattern in Java with validation at build time.',
      code: `public class House {
    private final int windows;
    private final boolean pool;
    private House(Builder b) { this.windows = b.windows; this.pool = b.pool; }

    public static class Builder {
        private int windows = 4;
        private boolean pool = false;
        public Builder windows(int w) { this.windows = w; return this; }
        public Builder pool(boolean p) { this.pool = p; return this; }
        public House build() { return new House(this); }
    }
}`,
    },
    diagramUml: `classDiagram
direction LR
class Director {
  +makeSimple()
  +makeFull()
}
class Builder {
  <<interface>>
  +reset()
  +setStepA()
  +setStepB()
}
class ConcreteBuilder {
  +getResult() Product
}
class Product
Director --> Builder
Builder <|.. ConcreteBuilder
ConcreteBuilder ..> Product : creates`,
    diagramFlowchart: `flowchart LR
Client --> Director["Director (Optional)"]
Director -->|step 1| Builder["Builder.stepA()"]
Director -->|step 2| Builder2["Builder.stepB()"]
Builder2 -->|finish| Result["Builder.getResult() -> Product"]`,
  },

  prototype: {
    title: 'Geometric Shape Cloning Registry',
    scenario: 'Canvas graphic editor where users duplicate configured shapes (Circles, Rectangles) without knowing their concrete classes.',
    problem: 'To copy an object from the outside, you must inspect all its private fields and know its concrete class, creating tight coupling and violating encapsulation.',
    solution: 'Declare a clone() method on the Prototype interface. The object itself creates a copy of its own private and public state.',
    whenToUse: [
      'Use when your code should not depend on the concrete classes of objects you need to copy.',
      'Use when you want to avoid costly initialization by cloning a pre-configured prototypical instance.',
    ],
    whenNotToUse: [
      'Avoid if objects have circular references that are complicated to decouple during deep cloning.',
    ],
    asciiShape: `ShapePrototype.clone()
         │
    ┌────┴────┐
    ▼         ▼
 Circle    Rectangle
 (clone)    (clone)`,
    typeScript: {
      fileName: 'ShapePrototype.ts',
      explanation: 'Shapes implement clone() to produce deep copies of their private and public properties.',
      code: `interface Shape {
  x: number;
  y: number;
  color: string;
  clone(): Shape;
}

class Circle implements Shape {
  constructor(public x: number, public y: number, public color: string, public radius: number) {}

  clone(): Circle {
    return new Circle(this.x, this.y, this.color, this.radius);
  }
}

class Rectangle implements Shape {
  constructor(public x: number, public y: number, public color: string, public width: number, public height: number) {}

  clone(): Rectangle {
    return new Rectangle(this.x, this.y, this.color, this.width, this.height);
  }
}

const original = new Circle(10, 20, "red", 15);
const duplicate = original.clone();
duplicate.x = 50;
console.log("Original Circle X:", original.x, "Duplicate Circle X:", duplicate.x);`,
    },
    java: {
      fileName: 'ShapePrototype.java',
      explanation: 'Java implementation where classes provide a copy constructor or clone method.',
      code: `public abstract class Shape {
    public int x, y;
    public Shape() {}
    public Shape(Shape target) { if (target != null) { this.x = target.x; this.y = target.y; } }
    public abstract Shape clone();
}

public class Circle extends Shape {
    public int radius;
    public Circle(Circle target) { super(target); if (target != null) this.radius = target.radius; }
    public Shape clone() { return new Circle(this); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class Prototype {
  <<interface>>
  +clone() Prototype
}
class Circle {
  +radius
  +clone() Prototype
}
class Rectangle {
  +width
  +height
  +clone() Prototype
}
Prototype <|.. Circle
Prototype <|.. Rectangle`,
    diagramFlowchart: `flowchart LR
Client["Client Code"] -->|"calls .clone()"| Instance["Configured Instance"]
Instance -->|"allocates new instance & copies fields"| Copy["Independent Clone"]`,
  },

  singleton: {
    title: 'Shared Database Connection Accessor',
    scenario: 'Application-wide database connector where creating multiple connection pools would exhaust database sockets and waste resources.',
    problem: 'Multiple instances of a resource manager create connection conflicts, exhaust memory, and scatter shared state across an application.',
    solution: 'Make the default constructor private and provide a static getInstance() method that caches and returns the single created instance.',
    whenToUse: [
      'Use when a class in your program should have just a single instance available to all clients (e.g. database connection or thread pool).',
      'Use when you need stricter control over global variables.',
    ],
    whenNotToUse: [
      'Avoid when dependency injection is available: Singletons introduce hidden dependencies and make unit testing extremely difficult.',
    ],
    asciiShape: `ClientA ──┐
ClientB ──┼──► Database.getInstance() ──► Single Instance
ClientC ──┘`,
    typeScript: {
      fileName: 'Database.ts',
      explanation: 'Thread-safe lazy initialization of a single Database instance with private constructor.',
      code: `class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;
  private connectionId: string;

  private constructor() {
    this.connectionId = "conn_" + Math.random().toString(36).substring(7);
    console.log(\`[DB] Initialized unique connection pool: \${this.connectionId}\`);
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public query(sql: string): void {
    console.log(\`[\${this.connectionId}] Executed: \${sql}\`);
  }
}

const db1 = DatabaseConnection.getInstance();
const db2 = DatabaseConnection.getInstance();
console.log("Same DB instance?", db1 === db2); // true
db1.query("SELECT * FROM users");`,
    },
    java: {
      fileName: 'Database.java',
      explanation: 'Double-checked locking Singleton in Java with volatile instance.',
      code: `public final class DatabaseConnection {
    private static volatile DatabaseConnection instance;
    private DatabaseConnection() {}

    public static DatabaseConnection getInstance() {
        if (instance == null) {
            synchronized (DatabaseConnection.class) {
                if (instance == null) {
                    instance = new DatabaseConnection();
                }
            }
        }
        return instance;
    }
}`,
    },
    diagramUml: `classDiagram
direction LR
class Singleton {
  -instance$ Singleton
  -Singleton()
  +getInstance()$ Singleton
  +businessLogic()
}
Client --> Singleton : getInstance()`,
    diagramFlowchart: `flowchart LR
Client1["Client A"] --> Get["getInstance()"]
Client2["Client B"] --> Get
Get -->|cached instance| Shared["Single Shared Instance"]`,
  },

  adapter: {
    title: 'Square Peg in a Round Hole',
    scenario: 'Fitting square wooden pegs into round holes by using an adapter that calculates the required circumscribed radius.',
    problem: 'An existing class (SquarePeg) has useful functionality, but its interface is completely incompatible with the consuming system (RoundHole.fits(RoundPeg)).',
    solution: 'Create an Adapter class that implements the target interface and wraps the incompatible adaptee, translating calls and values.',
    whenToUse: [
      'Use when you want to use some existing class, but its interface is not compatible with the rest of your code.',
      'Use when you want to reuse several existing subclasses that lack some common functionality that cannot be added to their superclass.',
    ],
    whenNotToUse: [
      'Avoid if you own the source code of both classes and can simply refactor them to share a common contract directly.',
    ],
    asciiShape: `RoundHole.fits(RoundPeg)
             ▲
             │ implements RoundPeg
     SquarePegAdapter(SquarePeg)
             │ wraps
             ▼
         SquarePeg`,
    typeScript: {
      fileName: 'SquarePegAdapter.ts',
      explanation: 'SquarePegAdapter wraps a SquarePeg and converts its width to an equivalent radius so it fits into a RoundHole.',
      code: `class RoundHole {
  constructor(public radius: number) {}
  fits(peg: RoundPeg): boolean {
    return peg.getRadius() <= this.radius;
  }
}

class RoundPeg {
  constructor(private radius: number) {}
  getRadius(): number { return this.radius; }
}

class SquarePeg {
  constructor(public width: number) {}
}

class SquarePegAdapter extends RoundPeg {
  constructor(private peg: SquarePeg) {
    super(0);
  }
  getRadius(): number {
    // Calculate half the diagonal of the square peg
    return (this.peg.width * Math.SQRT2) / 2;
  }
}

const hole = new RoundHole(5);
const smallSquare = new SquarePeg(5);
const largeSquare = new SquarePeg(10);

console.log("Fits small square peg?", hole.fits(new SquarePegAdapter(smallSquare))); // true
console.log("Fits large square peg?", hole.fits(new SquarePegAdapter(largeSquare))); // false`,
    },
    java: {
      fileName: 'SquarePegAdapter.java',
      explanation: 'Java Object Adapter extending RoundPeg and wrapping SquarePeg.',
      code: `public class RoundHole {
    private double radius;
    public RoundHole(double radius) { this.radius = radius; }
    public boolean fits(RoundPeg peg) { return peg.getRadius() <= this.radius; }
}
public class SquarePegAdapter extends RoundPeg {
    private SquarePeg peg;
    public SquarePegAdapter(SquarePeg peg) { this.peg = peg; }
    public double getRadius() { return peg.getWidth() * Math.sqrt(2) / 2; }
}`,
    },
    diagramUml: `classDiagram
direction LR
class Client
class Target {
  <<interface>>
  +request()
}
class Adapter {
  -adaptee: Adaptee
  +request()
}
class Adaptee {
  +specificRequest()
}
Client --> Target
Target <|.. Adapter
Adapter --> Adaptee : delegates`,
    diagramFlowchart: `flowchart LR
Client["Client Code"] -->|"calls request()"| Adapter["Adapter"]
Adapter -->|"translates & delegates"| Adaptee["Adaptee.specificRequest()"]`,
  },

  bridge: {
    title: 'Remote Controls and Devices',
    scenario: 'Universal remote controls (Basic Remote, Advanced Remote with Mute) operating independently of the devices (TV, Radio) they control.',
    problem: 'Extending a class hierarchy across two orthogonal axes (e.g. Remote types and Device brands) using inheritance causes an exponential subclass explosion.',
    solution: 'Split the monolithic class into two independent hierarchies: Abstraction (high-level control) and Implementation (platform-specific operations).',
    whenToUse: [
      'Use when you want to divide and organize a monolithic class that has several variants of some functionality (such as working with various database servers).',
      'Use when you need to be able to switch implementations at runtime.',
    ],
    whenNotToUse: [
      'Avoid when there is only a single stable axis of variation, as the extra indirection adds unnecessary cognitive load.',
    ],
    asciiShape: `Remote (Abstraction) ──► Device (Implementor)
        ├── AdvancedRemote           ├── Tv
        └── TouchRemote              └── Radio`,
    typeScript: {
      fileName: 'RemoteBridge.ts',
      explanation: 'Remote abstraction delegates low-level volume and power operations to interchangeable Device implementations.',
      code: `interface Device {
  isEnabled(): boolean;
  enable(): void;
  disable(): void;
  getVolume(): number;
  setVolume(percent: number): void;
}

class Tv implements Device {
  private on = false;
  private volume = 30;
  isEnabled() { return this.on; }
  enable() { this.on = true; console.log("[TV] Screen ON"); }
  disable() { this.on = false; console.log("[TV] Screen OFF"); }
  getVolume() { return this.volume; }
  setVolume(v: number) { this.volume = v; console.log(\`[TV] Volume set to \${v}\`); }
}

class Radio implements Device {
  private on = false;
  private volume = 20;
  isEnabled() { return this.on; }
  enable() { this.on = true; console.log("[Radio] Tuner ON"); }
  disable() { this.on = false; console.log("[Radio] Tuner OFF"); }
  getVolume() { return this.volume; }
  setVolume(v: number) { this.volume = v; console.log(\`[Radio] Volume set to \${v}\`); }
}

class RemoteControl {
  constructor(protected device: Device) {}
  togglePower() {
    this.device.isEnabled() ? this.device.disable() : this.device.enable();
  }
}

class AdvancedRemote extends RemoteControl {
  mute() {
    console.log("[Remote] Muting device...");
    this.device.setVolume(0);
  }
}

const tvRemote = new AdvancedRemote(new Tv());
tvRemote.togglePower();
tvRemote.mute();`,
    },
    java: {
      fileName: 'RemoteBridge.java',
      explanation: 'Bridge pattern in Java decoupling Device implementation from Remote abstraction.',
      code: `public interface Device { void enable(); void disable(); void setVolume(int v); }
public class Remote {
    protected Device device;
    public Remote(Device device) { this.device = device; }
    public void togglePower() { device.enable(); }
}
public class AdvancedRemote extends Remote {
    public AdvancedRemote(Device d) { super(d); }
    public void mute() { device.setVolume(0); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class Abstraction {
  -implementor: Implementor
  +operation()
}
class RefinedAbstraction
class Implementor {
  <<interface>>
  +operationImpl()
}
class ConcreteImplementorA
class ConcreteImplementorB
Abstraction <|-- RefinedAbstraction
Abstraction o--> Implementor
Implementor <|.. ConcreteImplementorA
Implementor <|.. ConcreteImplementorB`,
    diagramFlowchart: `flowchart LR
Client --> Remote["Abstraction (Remote)"]
Remote -->|delegates to| Device["Implementor (Device)"]
Device --> TV["Concrete Implementor (TV)"]
Device --> Radio["Concrete Implementor (Radio)"]`,
  },

  composite: {
    title: 'Graphic Vector Shapes & Compound Trees',
    scenario: 'Vector graphics application where simple shapes (Dots, Circles) and compound grouped graphics can be moved and drawn uniformly.',
    problem: 'Client code must constantly branch with conditional `if (item is Group)` statements to handle single elements versus nested containers differently.',
    solution: 'Define a common Component interface for both simple leaves and composite containers. Containers store child components and delegate operations recursively.',
    whenToUse: [
      'Use when you have to implement a tree-like object structure representing part-whole hierarchies.',
      'Use when you want the client code to treat both simple and complex elements uniformly.',
    ],
    whenNotToUse: [
      'Avoid when leaves and composites have fundamentally incompatible responsibilities that make a uniform interface awkward or unsafe.',
    ],
    asciiShape: `CompoundGraphic (draw)
   ├── Dot (draw)
   ├── Circle (draw)
   └── NestedCompoundGraphic (draw)
         └── Dot (draw)`,
    typeScript: {
      fileName: 'GraphicComposite.ts',
      explanation: 'Graphic interface allows Dot leaves and CompoundGraphic containers to be drawn and moved with identical syntax.',
      code: `interface Graphic {
  draw(): void;
  move(x: number, y: number): void;
}

class Dot implements Graphic {
  constructor(protected x: number, protected y: number) {}
  draw() { console.log(\`Draw Dot at (\${this.x}, \${this.y})\`); }
  move(x: number, y: number) { this.x += x; this.y += y; }
}

class Circle extends Dot {
  constructor(x: number, y: number, private radius: number) { super(x, y); }
  draw() { console.log(\`Draw Circle at (\${this.x}, \${this.y}) with radius \${this.radius}\`); }
}

class CompoundGraphic implements Graphic {
  private children: Graphic[] = [];
  add(child: Graphic) { this.children.push(child); }
  remove(child: Graphic) { this.children = this.children.filter(c => c !== child); }
  draw() {
    console.log("--- Compound Graphic Begin ---");
    this.children.forEach(c => c.draw());
    console.log("--- Compound Graphic End ---");
  }
  move(x: number, y: number) {
    this.children.forEach(c => c.move(x, y));
  }
}

const canvas = new CompoundGraphic();
canvas.add(new Dot(1, 2));
canvas.add(new Circle(5, 5, 10));
canvas.draw();`,
    },
    java: {
      fileName: 'GraphicComposite.java',
      explanation: 'Java Composite pattern executing recursive operations over leaves and groups.',
      code: `public interface Graphic { void draw(); }
public class Dot implements Graphic { public void draw() { System.out.println("Dot"); } }
public class CompoundGraphic implements Graphic {
    private List<Graphic> children = new ArrayList<>();
    public void add(Graphic g) { children.add(g); }
    public void draw() { for (Graphic g : children) g.draw(); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class Component {
  <<interface>>
  +execute()
}
class Leaf {
  +execute()
}
class Composite {
  -children: Component[]
  +add(Component)
  +execute()
}
Component <|.. Leaf
Component <|.. Composite
Composite o--> Component`,
    diagramFlowchart: `flowchart LR
Client --> Composite["Root Composite"]
Composite --> Leaf1["Leaf A"]
Composite --> ChildComposite["Sub-Composite"]
ChildComposite --> Leaf2["Leaf B"]
ChildComposite --> Leaf3["Leaf C"]`,
  },

  decorator: {
    title: 'Data Stream Encryption & Compression',
    scenario: 'Reading and writing sensitive application data through layered decorators that add encryption and compression around standard file storage.',
    problem: 'Extending functionality by creating subclasses for every permutation (e.g. EncryptedCompressedFile, CompressedFile, EncryptedFile) results in an explosion of classes.',
    solution: 'Wrap the target component inside wrapper objects that implement the same interface and delegate work while executing extra behavior before or after.',
    whenToUse: [
      'Use when you need to be able to assign extra behaviors to objects at runtime without breaking the code that uses these objects.',
      'Use when it is awkward or not possible to extend an object’s behavior using inheritance.',
    ],
    whenNotToUse: [
      'Avoid if the wrappers need to be removed from the middle of the stack, or if wrapper execution order creates subtle side effects.',
    ],
    asciiShape: `Client ──► EncryptionDecorator
               └──► CompressionDecorator
                       └──► FileDataSource`,
    typeScript: {
      fileName: 'DataSourceDecorator.ts',
      explanation: 'DataSource interface with FileDataSource wrapped dynamically by Encryption and Compression decorators.',
      code: `interface DataSource {
  writeData(data: string): void;
  readData(): string;
}

class FileDataSource implements DataSource {
  private buffer = "";
  constructor(private filename: string) {}
  writeData(data: string) { this.buffer = data; console.log(\`[File] Written: \${this.buffer}\`); }
  readData() { return this.buffer; }
}

class DataSourceDecorator implements DataSource {
  constructor(protected wrappee: DataSource) {}
  writeData(data: string) { this.wrappee.writeData(data); }
  readData() { return this.wrappee.readData(); }
}

class EncryptionDecorator extends DataSourceDecorator {
  writeData(data: string) {
    const encrypted = Buffer.from(data).toString("base64");
    console.log(\`[Encrypt] Encrypted payload: \${encrypted}\`);
    super.writeData(encrypted);
  }
  readData(): string {
    const raw = super.readData();
    return Buffer.from(raw, "base64").toString("utf-8");
  }
}

const pipeline = new EncryptionDecorator(new FileDataSource("secrets.dat"));
pipeline.writeData("User Password Payload");`,
    },
    java: {
      fileName: 'DataSourceDecorator.java',
      explanation: 'Standard Java Decorator wrapping stream read and write operations.',
      code: `public interface DataSource { void writeData(String data); String readData(); }
public class DataSourceDecorator implements DataSource {
    protected DataSource wrappee;
    public DataSourceDecorator(DataSource s) { this.wrappee = s; }
    public void writeData(String d) { wrappee.writeData(d); }
    public String readData() { return wrappee.readData(); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class Component {
  <<interface>>
  +execute()
}
class ConcreteComponent {
  +execute()
}
class BaseDecorator {
  -wrappee: Component
  +execute()
}
class EncryptionDecorator
Component <|.. ConcreteComponent
Component <|.. BaseDecorator
BaseDecorator o--> Component
BaseDecorator <|-- EncryptionDecorator`,
    diagramFlowchart: `flowchart LR
Client --> Dec1["EncryptionDecorator"]
Dec1 --> Dec2["CompressionDecorator"]
Dec2 --> Target["FileDataSource"]`,
  },

  facade: {
    title: 'Video Conversion Subsystem',
    scenario: 'Complex media framework coordinating codecs (Ogg, MP4), audio mixers, and bitrate readers behind a single clean convertVideo() method.',
    problem: 'Clients must directly initialize and coordinate dozens of obscure subsystem classes, tightly coupling client code to subsystem internals.',
    solution: 'Introduce a Facade class that provides a simple high-level interface to the complex subsystem, routing calls to appropriate specialists.',
    whenToUse: [
      'Use when you need to have a limited but straightforward interface to a complex subsystem.',
      'Use when you want to structure a subsystem into distinct layers.',
    ],
    whenNotToUse: [
      'Avoid letting the facade become an all-knowing God Object that accumulates domain business logic.',
    ],
    asciiShape: `Client ──► VideoConverter (Facade)
                ├── VideoFile
                ├── OggCompressionCodec
                ├── BitrateReader
                └── AudioMixer`,
    typeScript: {
      fileName: 'VideoConverterFacade.ts',
      explanation: 'VideoConverter facade abstracts away codec negotiation, bitrate extraction, and file rendering.',
      code: `class VideoFile { constructor(public filename: string) {} }
class OggCodec { readonly type = "ogg"; }
class Mp4Codec { readonly type = "mp4"; }
class BitrateReader {
  static read(file: VideoFile) { console.log(\`Reading buffer for \${file.filename}\`); }
}
class AudioMixer {
  static fix() { console.log("Mixing audio channels."); }
}

class VideoConverter {
  convert(filename: string, format: "mp4" | "ogg"): void {
    console.log(\`Starting conversion for \${filename} to \${format}...\`);
    const file = new VideoFile(filename);
    BitrateReader.read(file);
    const codec = format === "mp4" ? new Mp4Codec() : new OggCodec();
    AudioMixer.fix();
    console.log(\`Conversion complete with codec \${codec.type}.\`);
  }
}

new VideoConverter().convert("vacation.mov", "mp4");`,
    },
    java: {
      fileName: 'VideoConverterFacade.java',
      explanation: 'Java Facade hiding media conversion complexity.',
      code: `public class VideoConverter {
    public void convert(String file, String format) {
        System.out.println("Converting " + file + " to " + format);
    }
}`,
    },
    diagramUml: `classDiagram
direction LR
class Client
class Facade {
  +simpleOperation()
}
class SubsystemA
class SubsystemB
class SubsystemC
Client --> Facade
Facade --> SubsystemA
Facade --> SubsystemB
Facade --> SubsystemC`,
    diagramFlowchart: `flowchart LR
Client --> Facade["VideoConverter (Facade)"]
Facade --> S1["Subsystem: Codec"]
Facade --> S2["Subsystem: Bitrate"]
Facade --> S3["Subsystem: Mixer"]`,
  },

  flyweight: {
    title: 'Forest Tree Rendering (Millions of Particles)',
    scenario: 'Rendering a dense forest game landscape containing millions of trees by sharing intrinsic texture/mesh data across all tree coordinates.',
    problem: 'Creating individual objects for millions of entities exhausts RAM because immutable state (mesh, color, sprite) is duplicated in every instance.',
    solution: 'Separate state into Intrinsic (immutable, shared) and Extrinsic (contextual, variable). Store intrinsic state in Flyweight instances.',
    whenToUse: [
      'Use only when your program must support a huge number of objects that barely fit in available RAM.',
    ],
    whenNotToUse: [
      'Avoid when memory is abundant: Flyweight increases code complexity and spends CPU cycles passing extrinsic state.',
    ],
    asciiShape: `Forest (1,000,000 Trees)
   └── Tree(x, y) [Extrinsic Context]
          └── TreeType(name, color, texture) [Shared Flyweight]`,
    typeScript: {
      fileName: 'ForestFlyweight.ts',
      explanation: 'TreeType flyweight holds shared immutable sprite data; individual Tree objects hold only lightweight (x, y) coordinates.',
      code: `class TreeType {
  constructor(public name: string, public color: string, public texture: string) {}
  draw(x: number, y: number) {
    console.log(\`Drawing \${this.name} (\${this.color}) at coordinates (\${x}, \${y})\`);
  }
}

class TreeFactory {
  private static treeTypes = new Map<string, TreeType>();

  static getTreeType(name: string, color: string, texture: string): TreeType {
    const key = \`\${name}_\${color}_\${texture}\`;
    let type = this.treeTypes.get(key);
    if (!type) {
      type = new TreeType(name, color, texture);
      this.treeTypes.set(key, type);
      console.log(\`[Factory] Created new shared TreeType: \${key}\`);
    }
    return type;
  }
}

class Tree {
  constructor(public x: number, public y: number, private type: TreeType) {}
  draw() { this.type.draw(this.x, this.y); }
}

const oakType = TreeFactory.getTreeType("Oak", "Green", "rough_oak.png");
const t1 = new Tree(10, 20, oakType);
const t2 = new Tree(55, 80, oakType);
t1.draw();
t2.draw();`,
    },
    java: {
      fileName: 'ForestFlyweight.java',
      explanation: 'Flyweight pattern in Java caching immutable TreeType representations.',
      code: `public class TreeType {
    private String name, color;
    public TreeType(String n, String c) { this.name = n; this.color = c; }
    public void draw(int x, int y) { System.out.println("Tree at " + x + "," + y); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class FlyweightFactory {
  +getFlyweight(key)
}
class Flyweight {
  -intrinsicState
  +operation(extrinsicState)
}
class Context {
  -extrinsicState
  -flyweight: Flyweight
}
FlyweightFactory o--> Flyweight
Context o--> Flyweight`,
    diagramFlowchart: `flowchart LR
Client --> Factory["TreeFactory"]
Factory -->|returns shared| Flyweight["Shared TreeType (Intrinsic)"]
Client --> Tree1["Tree (x: 10, y: 20)"]
Client --> Tree2["Tree (x: 50, y: 80)"]
Tree1 -.-> Flyweight
Tree2 -.-> Flyweight`,
  },

  proxy: {
    title: 'Third-Party YouTube Video Caching',
    scenario: 'A YouTube video manager downloads heavy video streams; a caching proxy intercepts requests to return saved files instead of repeating network hits.',
    problem: 'Direct calls to a heavy or remote service object waste bandwidth, cause latency, and lack access control or lifecycle hooks.',
    solution: 'Create a proxy class with the same interface as the service. Forward requests to the real service only when necessary (e.g. after checking cache or auth).',
    whenToUse: [
      'Lazy initialization (virtual proxy): delaying heavyweight service startup until it is really needed.',
      'Access control (protection proxy): checking client credentials before delegating.',
      'Caching request results (caching proxy): managing TTL and cache reuse for expensive calls.',
    ],
    whenNotToUse: [
      'Avoid when direct access is simple and the extra class layer introduces unnecessary latency without providing security or caching.',
    ],
    asciiShape: `Client ──────► CachedYouTubeProxy ────(cache miss)───► ThirdPartyYouTubeService
                    │                                          (heavy remote network call)
                    ▼ (cache hit)
             Local Memory Cache
             (instant return)`,
    typeScript: {
      fileName: 'YouTubeProxy.ts',
      explanation: 'CachedYouTubeClass implements ThirdPartyYouTubeLib and caches video payloads in memory.',
      code: `interface ThirdPartyYouTubeLib {
  getVideoInfo(id: string): string;
  downloadVideo(id: string): void;
}

class ThirdPartyYouTubeClass implements ThirdPartyYouTubeLib {
  getVideoInfo(id: string) { return \`Metadata for video \${id}\`; }
  downloadVideo(id: string) { console.log(\`[Network] Downloaded 100MB stream for \${id}\`); }
}

class CachedYouTubeClass implements ThirdPartyYouTubeLib {
  private cache = new Map<string, string>();

  constructor(private service: ThirdPartyYouTubeLib) {}

  getVideoInfo(id: string): string {
    if (!this.cache.has(id)) {
      console.log(\`[Proxy] Cache miss for \${id}. Fetching from network...\`);
      this.cache.set(id, this.service.getVideoInfo(id));
    } else {
      console.log(\`[Proxy] Cache HIT for \${id}.\`);
    }
    return this.cache.get(id)!;
  }

  downloadVideo(id: string) { this.service.downloadVideo(id); }
}

const proxy = new CachedYouTubeClass(new ThirdPartyYouTubeClass());
proxy.getVideoInfo("cat_video_01");
proxy.getVideoInfo("cat_video_01"); // Served from cache!`,
    },
    java: {
      fileName: 'YouTubeProxy.java',
      explanation: 'Java Caching Proxy wrapping ThirdPartyYouTubeService.',
      code: `public interface YouTubeLib { String getVideo(String id); }
public class CachingProxy implements YouTubeLib {
    private YouTubeLib service;
    private Map<String,String> cache = new HashMap<>();
    public CachingProxy(YouTubeLib s) { this.service = s; }
    public String getVideo(String id) {
        if (!cache.containsKey(id)) cache.put(id, service.getVideo(id));
        return cache.get(id);
    }
}`,
    },
    diagramUml: `classDiagram
direction LR
class ServiceInterface {
  <<interface>>
  +operation()
}
class RealService {
  +operation()
}
class Proxy {
  -realService: RealService
  +operation()
}
ServiceInterface <|.. RealService
ServiceInterface <|.. Proxy
Proxy o--> RealService`,
    diagramFlowchart: `flowchart LR
Client --> Proxy["CachedYouTubeProxy"]
Proxy -->|cache hit| ReturnCache["Return In-Memory Data"]
Proxy -->|cache miss| Service["Real YouTube Service"]`,
  },

  'chain-of-responsibility': {
    title: 'Support Ticket & Order Approval Chain',
    scenario: 'Customer support request pipeline escalating through automated bot, Level 1 junior agent, and Level 2 manager until handled.',
    problem: 'Multiple sequential checks or handlers create brittle, deeply nested conditional statements inside caller code.',
    solution: 'Transform individual checks into standalone handler objects linked sequentially. Each handler decides to process the request or pass it to the next link.',
    whenToUse: [
      'Use when your program is expected to process different kinds of requests in various ways, but the exact request types and sequences are not known beforehand.',
      'Use when it is essential to execute several handlers in a specific order.',
    ],
    whenNotToUse: [
      'Avoid when every request must be processed by all handlers; in that case, an interceptor or Decorator is cleaner.',
    ],
    asciiShape: `Request ──► BotHandler ──► AgentHandler ──► ManagerHandler`,
    typeScript: {
      fileName: 'SupportChain.ts',
      explanation: 'Handlers evaluate ticket severity and either handle it or delegate down the chain.',
      code: `abstract class SupportHandler {
  private nextHandler: SupportHandler | null = null;
  setNext(handler: SupportHandler): SupportHandler {
    this.nextHandler = handler;
    return handler;
  }
  handle(ticket: string, severity: number): void {
    if (this.nextHandler) {
      this.nextHandler.handle(ticket, severity);
    } else {
      console.log(\`[Chain] No handler could resolve ticket: \${ticket}\`);
    }
  }
}

class AutoBotHandler extends SupportHandler {
  handle(ticket: string, severity: number) {
    if (severity === 1) {
      console.log(\`[Bot] Handled basic FAQ ticket: "\${ticket}"\`);
    } else {
      super.handle(ticket, severity);
    }
  }
}

class ManagerHandler extends SupportHandler {
  handle(ticket: string, severity: number) {
    if (severity <= 3) {
      console.log(\`[Manager] Handled escalated ticket: "\${ticket}"\`);
    } else {
      super.handle(ticket, severity);
    }
  }
}

const chain = new AutoBotHandler();
chain.setNext(new ManagerHandler());
chain.handle("Password reset link", 1);
chain.handle("Billing refund dispute", 3);`,
    },
    java: {
      fileName: 'SupportChain.java',
      explanation: 'Chain of Responsibility in Java with setNext linking.',
      code: `public abstract class Handler {
    protected Handler next;
    public Handler setNext(Handler n) { this.next = n; return n; }
    public void handle(int level) { if (next != null) next.handle(level); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class Handler {
  <<interface>>
  +setNext(Handler)
  +handle(request)
}
class ConcreteHandlerA
class ConcreteHandlerB
Handler <|.. ConcreteHandlerA
Handler <|.. ConcreteHandlerB
Handler o--> Handler : next`,
    diagramFlowchart: `flowchart LR
Request --> H1["AutoBotHandler"]
H1 -->|severity > 1| H2["SupportAgentHandler"]
H2 -->|severity > 2| H3["ManagerHandler"]`,
  },

  command: {
    title: 'Text Editor Actions with Undo / Redo',
    scenario: 'GUI text editor implementing Copy, Cut, Paste, and Undo operations as standalone objects parameterizing menu buttons and shortcut keys.',
    problem: 'Hardcoding business operations directly inside UI buttons prevents button reuse, undo/redo history, and request queuing.',
    solution: 'Encapsulate all details of a request (receiver, method, arguments) into a separate Command class with an execute() method.',
    whenToUse: [
      'Use when you want to parameterize objects with operations.',
      'Use when you want to queue operations, schedule their execution, or execute them remotely.',
      'Use when you want to implement reversible operations (undo/redo).',
    ],
    whenNotToUse: [
      'Avoid for trivial synchronous operations where adding command classes simply clutters the architecture.',
    ],
    asciiShape: `UI Button ──► Command.execute() ──► Receiver (Editor)
History Stack ◄── Command.undo()`,
    typeScript: {
      fileName: 'EditorCommand.ts',
      explanation: 'Commands encapsulate text modifications and store previous state for reversible undo operations.',
      code: `class Editor {
  text = "";
}

interface Command {
  execute(): void;
  undo(): void;
}

class InsertTextCommand implements Command {
  constructor(private editor: Editor, private textToInsert: string) {}

  execute() {
    this.editor.text += this.textToInsert;
    console.log(\`[Execute] Editor text is now: "\${this.editor.text}"\`);
  }

  undo() {
    this.editor.text = this.editor.text.slice(0, -this.textToInsert.length);
    console.log(\`[Undo] Reverted text to: "\${this.editor.text}"\`);
  }
}

const doc = new Editor();
const cmd = new InsertTextCommand(doc, "Hello World!");
cmd.execute();
cmd.undo();`,
    },
    java: {
      fileName: 'EditorCommand.java',
      explanation: 'Command interface in Java with execute and undo methods.',
      code: `public interface Command { void execute(); void undo(); }
public class InsertCommand implements Command {
    private StringBuilder editor; private String text;
    public InsertCommand(StringBuilder e, String t) { this.editor = e; this.text = t; }
    public void execute() { editor.append(text); }
    public void undo() { editor.setLength(editor.length() - text.length()); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class Invoker
class Command {
  <<interface>>
  +execute()
  +undo()
}
class ConcreteCommand {
  -receiver: Receiver
  +execute()
  +undo()
}
class Receiver
Invoker o--> Command
Command <|.. ConcreteCommand
ConcreteCommand --> Receiver`,
    diagramFlowchart: `flowchart LR
Invoker["Button (Invoker)"] -->|"execute()"| Command["Command Object"]
Command -->|delegates to| Receiver["Editor (Receiver)"]
Command -->|pushed to| History["History Stack (Undo)"]`,
  },

  iterator: {
    title: 'Social Network Friends Traversal',
    scenario: 'Walking through profiles in a social network using different traversal strategies (direct friends vs friends-of-friends) without exposing internal graph representations.',
    problem: 'Collections store elements in trees, graphs, or hash tables. Exposing internal data structures breaks encapsulation and duplicates traversal logic.',
    solution: 'Extract the traversal behavior into a separate Iterator object that manages current cursor position and knows how to fetch the next element.',
    whenToUse: [
      'Use when your collection has a complex data structure under the hood, but you want to hide its complexity from clients.',
      'Use to reduce duplication of traversal code across your app.',
    ],
    whenNotToUse: [
      'Avoid if your collection is a simple list or array and native loops are already supported.',
    ],
    asciiShape: `SocialGraph ──► createFriendsIterator() ──► hasNext() / getNext()`,
    typeScript: {
      fileName: 'SocialIterator.ts',
      explanation: 'ProfileIterator iterates through social profiles sequentially without exposing array or graph nodes.',
      code: `interface ProfileIterator {
  hasNext(): boolean;
  getNext(): string | null;
}

class ArrayProfileIterator implements ProfileIterator {
  private index = 0;
  constructor(private profiles: string[]) {}
  hasNext() { return this.index < this.profiles.length; }
  getNext() { return this.hasNext() ? this.profiles[this.index++] : null; }
}

const iterator = new ArrayProfileIterator(["Alice", "Bob", "Charlie"]);
while (iterator.hasNext()) {
  console.log("Friend:", iterator.getNext());
}`,
    },
    java: {
      fileName: 'SocialIterator.java',
      explanation: 'Custom Iterator in Java implementing hasNext and next.',
      code: `public interface CustomIterator<T> { boolean hasNext(); T next(); }
public class ProfileIterator implements CustomIterator<String> {
    private List<String> list; private int idx = 0;
    public ProfileIterator(List<String> list) { this.list = list; }
    public boolean hasNext() { return idx < list.size(); }
    public String next() { return list.get(idx++); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class Aggregate {
  <<interface>>
  +createIterator() Iterator
}
class Iterator {
  <<interface>>
  +hasNext()
  +next()
}
class ConcreteAggregate
class ConcreteIterator
Aggregate <|.. ConcreteAggregate
Iterator <|.. ConcreteIterator
ConcreteAggregate ..> ConcreteIterator : creates`,
    diagramFlowchart: `flowchart LR
Client --> Aggregate["Collection.createIterator()"]
Aggregate --> Iterator["Iterator Instance"]
Client -->|"loop: hasNext() -> next()"| Iterator`,
  },

  mediator: {
    title: 'GUI Dialog Component Coordinator',
    scenario: 'Complex authentication dialog where checking "Remember Me" enables extra fields, and typing in username toggles the Submit button.',
    problem: 'UI elements become tightly coupled to each other when each widget directly references and manipulates dozens of other widgets.',
    solution: 'Prevent direct communication between components; make them notify a Mediator, which coordinates all responses.',
    whenToUse: [
      'Use when it is hard to change some classes because they are tightly coupled to a dozen of other classes.',
      'Use when you can’t reuse a component in a different program because it’s too dependent on other components.',
    ],
    whenNotToUse: [
      'Avoid if the components only communicate with 1 or 2 peers, as the mediator will become an unnecessary bottleneck.',
    ],
    asciiShape: `Checkbox ──┐
TextBox  ──┼──► DialogMediator ──► Updates UI States
Button   ──┘`,
    typeScript: {
      fileName: 'DialogMediator.ts',
      explanation: 'AuthenticationDialog acts as mediator between TextBox and Checkbox widgets.',
      code: `interface Mediator {
  notify(sender: object, event: string): void;
}

class Button {
  enabled = false;
  click() { console.log("Submit button clicked."); }
}

class TextBox {
  value = "";
  constructor(private mediator: Mediator) {}
  input(val: string) {
    this.value = val;
    this.mediator.notify(this, "change");
  }
}

class AuthDialog implements Mediator {
  public username = new TextBox(this);
  public submitBtn = new Button();

  notify(sender: object, event: string) {
    if (sender === this.username && event === "change") {
      this.submitBtn.enabled = this.username.value.length > 0;
      console.log(\`[Mediator] Submit button enabled: \${this.submitBtn.enabled}\`);
    }
  }
}

const dialog = new AuthDialog();
dialog.username.input("admin_user");`,
    },
    java: {
      fileName: 'DialogMediator.java',
      explanation: 'Mediator in Java coordinating UI component events.',
      code: `public interface Mediator { void notify(Object sender, String event); }
public class AuthDialog implements Mediator {
    public void notify(Object sender, String event) {
        System.out.println("Mediator handling " + event);
    }
}`,
    },
    diagramUml: `classDiagram
direction LR
class Mediator {
  <<interface>>
  +notify(sender, event)
}
class ConcreteMediator
class Component {
  -mediator: Mediator
}
Mediator <|.. ConcreteMediator
ConcreteMediator --> Component
Component --> Mediator`,
    diagramFlowchart: `flowchart LR
ComponentA["Username Input"] -->|notify event| Mediator["AuthDialog (Mediator)"]
Mediator -->|updates state| ComponentB["Submit Button"]`,
  },

  memento: {
    title: 'Text Editor State Snapshot & Undo',
    scenario: 'Saving snapshots of text editor contents before complex formatting operations so users can undo mistakes.',
    problem: 'Trying to save an object’s internal state from the outside violates encapsulation by exposing private variables.',
    solution: 'The originator creates a Memento containing a copy of its state. The caretaker stores the memento opaquely and returns it to the originator to restore state.',
    whenToUse: [
      'Use when you want to produce snapshots of the object’s state to be able to restore a previous state of the object.',
      'Use when direct access to the object’s fields would violate its encapsulation.',
    ],
    whenNotToUse: [
      'Avoid if the object’s state is huge and snapshots occur frequently, as RAM consumption will be prohibitive.',
    ],
    asciiShape: `Originator ──► createMemento() ──► Caretaker (stores token)
Originator ◄── restore(memento)  ◄── Caretaker`,
    typeScript: {
      fileName: 'EditorMemento.ts',
      explanation: 'Editor creates and restores opaque Snapshot mementos managed by a CommandHistory caretaker.',
      code: `class Snapshot {
  constructor(private state: string) {}
  getState(): string { return this.state; }
}

class TextEditor {
  private content = "";
  setText(t: string) { this.content = t; }
  getText() { return this.content; }
  createSnapshot(): Snapshot { return new Snapshot(this.content); }
  restore(s: Snapshot) { this.content = s.getState(); }
}

const editor = new TextEditor();
editor.setText("Version 1.0");
const saved = editor.createSnapshot();

editor.setText("Version 2.0 (Corrupted)");
console.log("Current:", editor.getText());

editor.restore(saved);
console.log("Restored:", editor.getText());`,
    },
    java: {
      fileName: 'EditorMemento.java',
      explanation: 'Memento pattern in Java preserving encapsulation of state snapshots.',
      code: `public class Memento {
    private final String state;
    public Memento(String s) { this.state = s; }
    public String getState() { return state; }
}`,
    },
    diagramUml: `classDiagram
direction LR
class Originator {
  -state
  +save(): Memento
  +restore(Memento)
}
class Memento {
  -state
  +getState()
}
class Caretaker {
  -history: Memento[]
}
Originator ..> Memento : creates
Caretaker o--> Memento`,
    diagramFlowchart: `flowchart LR
Originator["Originator (Editor)"] -->|"save()"| Memento["Opaque Memento"]
Memento -->|stored in| Caretaker["Caretaker (History)"]
Caretaker -->|"restore(memento)"| Originator`,
  },

  observer: {
    title: 'Newsletter & Event Manager Broadcast',
    scenario: 'Event manager notifying multiple listeners (Email Alerts, Logging Listeners) whenever a file is opened or edited.',
    problem: 'Objects that need to notify other objects about state changes become tightly coupled if they know specific receiver classes.',
    solution: 'Provide a subscription mechanism allowing subscriber objects to observe events emitted by a publisher subject.',
    whenToUse: [
      'Use when changes to the state of one object may require changing other objects, and the actual set of objects is unknown beforehand or changes dynamically.',
      'Use when some objects in your app must observe others, but only for limited time or in specific cases.',
    ],
    whenNotToUse: [
      'Avoid when notification cascades could cause infinite loops or when deterministic execution order is strictly required.',
    ],
    asciiShape: `Publisher.subscribe(listener)
Publisher.notify(event) ──► Listener1.update()
                        ──► Listener2.update()`,
    typeScript: {
      fileName: 'EventManager.ts',
      explanation: 'EventManager lets listeners subscribe to specific event types and broadcasts events to all subscribers.',
      code: `interface EventListener {
  update(filename: string): void;
}

class EventManager {
  private listeners = new Map<string, EventListener[]>();

  subscribe(eventType: string, listener: EventListener) {
    const list = this.listeners.get(eventType) || [];
    list.push(listener);
    this.listeners.set(eventType, list);
  }

  notify(eventType: string, filename: string) {
    this.listeners.get(eventType)?.forEach(l => l.update(filename));
  }
}

class EmailAlertListener implements EventListener {
  update(f: string) { console.log(\`[Email Alert] File changed: \${f}\`); }
}

const events = new EventManager();
events.subscribe("save", new EmailAlertListener());
events.notify("save", "invoice_2026.pdf");`,
    },
    java: {
      fileName: 'EventManager.java',
      explanation: 'Java Observer pattern with listener subscription list.',
      code: `public interface EventListener { void update(String data); }
public class EventManager {
    private List<EventListener> listeners = new ArrayList<>();
    public void subscribe(EventListener l) { listeners.add(l); }
    public void notify(String data) { for (EventListener l : listeners) l.update(data); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class Publisher {
  -subscribers: Subscriber[]
  +subscribe(Subscriber)
  +unsubscribe(Subscriber)
  +notifySubscribers()
}
class Subscriber {
  <<interface>>
  +update()
}
class ConcreteSubscriber
Publisher o--> Subscriber
Subscriber <|.. ConcreteSubscriber`,
    diagramFlowchart: `flowchart LR
Publisher["Subject (EventManager)"] -->|notify event| Sub1["EmailAlertListener"]
Publisher -->|notify event| Sub2["LogListener"]`,
  },

  state: {
    title: 'Audio Player State Machine',
    scenario: 'Media player controls (Play, Pause, Lock) altering behavior depending on whether the player is currently Playing, Paused, or Locked.',
    problem: 'Large conditionals grow unmanageable as an object’s lifecycle gains new states and allowed transitions.',
    solution: 'Extract each state into a concrete class implementing a State interface. Delegate context operations to the current state object.',
    whenToUse: [
      'Use when you have an object that behaves differently depending on its current state, the number of states is enormous, and the state-specific code changes frequently.',
      'Use when you have a class polluted with massive conditionals that alter how the class’s methods behave according to the current values of the class’s fields.',
    ],
    whenNotToUse: [
      'Avoid if the state machine has only 2 or 3 states that rarely change, where a simple switch statement is sufficient.',
    ],
    asciiShape: `Context.clickPlay() ──► State.play()
    ├── LockedState  (unlocks player)
    ├── PlayingState (pauses audio)
    └── PausedState  (resumes playback)`,
    typeScript: {
      fileName: 'AudioPlayerState.ts',
      explanation: 'AudioPlayer delegates button clicks to concrete State classes that handle actions and transition the player.',
      code: `interface State {
  clickPlay(): void;
  clickLock(): void;
}

class AudioPlayer {
  public state: State;
  public isPlaying = false;

  constructor() {
    this.state = new ReadyState(this);
  }

  changeState(s: State) { this.state = s; }
}

class ReadyState implements State {
  constructor(private player: AudioPlayer) {}
  clickPlay() {
    this.player.isPlaying = true;
    console.log("[State] Audio playback started.");
    this.player.changeState(new PlayingState(this.player));
  }
  clickLock() { console.log("[State] Device locked."); }
}

class PlayingState implements State {
  constructor(private player: AudioPlayer) {}
  clickPlay() {
    this.player.isPlaying = false;
    console.log("[State] Audio paused.");
    this.player.changeState(new ReadyState(this.player));
  }
  clickLock() { console.log("[State] Locked while playing."); }
}

const player = new AudioPlayer();
player.state.clickPlay(); // Starts playing
player.state.clickPlay(); // Pauses playback`,
    },
    java: {
      fileName: 'AudioPlayerState.java',
      explanation: 'State pattern in Java managing media player transitions.',
      code: `public interface State { void clickPlay(); }
public class AudioPlayer {
    private State state;
    public void changeState(State s) { this.state = s; }
    public void play() { state.clickPlay(); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class Context {
  -state: State
  +changeState(State)
  +request()
}
class State {
  <<interface>>
  +handle()
}
class ConcreteStateA
class ConcreteStateB
Context o--> State
State <|.. ConcreteStateA
State <|.. ConcreteStateB`,
    diagramFlowchart: `flowchart LR
Context --> State["Current State"]
State -->|action| Transition["Transitions to Next State"]`,
  },

  strategy: {
    title: 'Route Planning Navigation Engine',
    scenario: 'Mapping application calculating travel routes between points using Road Strategy, Walking Strategy, or Public Transport Strategy.',
    problem: 'A navigation class contains a gigantic conditional ladder switching between algorithm variants, making extensions painful.',
    solution: 'Extract each algorithm into a standalone strategy class. Inject the desired strategy into the context at runtime.',
    whenToUse: [
      'Use when you want to use different variants of an algorithm within an object and be able to switch from one algorithm to another during runtime.',
      'Use when you have a lot of similar classes that only differ in the way they execute some behavior.',
      'Use to isolate the business logic of a class from the implementation details of algorithms.',
    ],
    whenNotToUse: [
      'Avoid if you only have a few fixed algorithms that rarely change: modern anonymous functions/lambdas are simpler.',
    ],
    asciiShape: `Navigator (Context) ──► RouteStrategy
                             ├── RoadStrategy
                             ├── WalkingStrategy
                             └── TransitStrategy`,
    typeScript: {
      fileName: 'RouteNavigator.ts',
      explanation: 'Navigator context swaps between RoadStrategy and WalkingStrategy at runtime.',
      code: `interface RouteStrategy {
  buildRoute(from: string, to: string): string;
}

class RoadStrategy implements RouteStrategy {
  buildRoute(a: string, b: string) { return \`Fast highway route from \${a} to \${b} (45 mins)\`; }
}

class WalkingStrategy implements RouteStrategy {
  buildRoute(a: string, b: string) { return \`Scenic pedestrian route from \${a} to \${b} (3 hours)\`; }
}

class Navigator {
  constructor(private strategy: RouteStrategy) {}
  setStrategy(s: RouteStrategy) { this.strategy = s; }
  navigate(a: string, b: string) {
    console.log(this.strategy.buildRoute(a, b));
  }
}

const nav = new Navigator(new RoadStrategy());
nav.navigate("Central Park", "Brooklyn Bridge");
nav.setStrategy(new WalkingStrategy());
nav.navigate("Central Park", "Brooklyn Bridge");`,
    },
    java: {
      fileName: 'RouteNavigator.java',
      explanation: 'Strategy pattern in Java swapping route calculations.',
      code: `public interface RouteStrategy { String buildRoute(String a, String b); }
public class Navigator {
    private RouteStrategy strategy;
    public Navigator(RouteStrategy s) { this.strategy = s; }
    public void setStrategy(RouteStrategy s) { this.strategy = s; }
    public void route(String a, String b) { System.out.println(strategy.buildRoute(a, b)); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class Context {
  -strategy: Strategy
  +setStrategy(Strategy)
  +executeStrategy()
}
class Strategy {
  <<interface>>
  +execute()
}
class ConcreteStrategyA
class ConcreteStrategyB
Context o--> Strategy
Strategy <|.. ConcreteStrategyA
Strategy <|.. ConcreteStrategyB`,
    diagramFlowchart: `flowchart LR
Client --> Context["Navigator (Context)"]
Context -->|executes| Strategy["RouteStrategy Interface"]
Strategy --> Road["RoadStrategy"]
Strategy --> Walk["WalkingStrategy"]`,
  },

  'template-method': {
    title: 'Data Miner Workflow Skeleton',
    scenario: 'Extracting, parsing, and analyzing reports where CSV, PDF, and Doc formats share identical parsing workflows except for raw extraction hooks.',
    problem: 'Multiple document parsing classes duplicate the overall workflow sequence, but differ only in how raw bytes are read.',
    solution: 'Define the invariant algorithm skeleton in a base class template method, and allow subclasses to override specific step hooks.',
    whenToUse: [
      'Use when you want to let clients extend only particular steps of an algorithm, but not the whole algorithm or its structure.',
      'Use when you have several classes that contain almost identical algorithms with some minor differences.',
    ],
    whenNotToUse: [
      'Avoid when workflows diverge significantly beyond the fixed sequence, as inheritance constraints become brittle.',
    ],
    asciiShape: `BaseDataMiner.mine() [Template Method]
   ├── openFile()
   ├── extractData() [Hook overridden by CsvMiner / DocMiner]
   ├── parseData()
   └── closeFile()`,
    typeScript: {
      fileName: 'DataMinerTemplate.ts',
      explanation: 'DataMiner defines invariant step sequence; CsvDataMiner implements raw extraction.',
      code: `abstract class DataMiner {
  // Template Method
  mine(path: string): void {
    this.openFile(path);
    const raw = this.extractData();
    const parsed = this.parseData(raw);
    this.analyze(parsed);
    this.closeFile();
  }

  protected openFile(path: string) { console.log(\`Opened file at \${path}\`); }
  protected abstract extractData(): string;
  protected parseData(raw: string): string[] { return raw.split(","); }
  protected analyze(data: string[]) { console.log(\`Analyzed \${data.length} records.\`); }
  protected closeFile() { console.log("Closed file handle."); }
}

class CsvDataMiner extends DataMiner {
  protected extractData(): string {
    console.log("[CSV] Extracted comma-separated text values.");
    return "row1,row2,row3";
  }
}

new CsvDataMiner().mine("sales_q3.csv");`,
    },
    java: {
      fileName: 'DataMinerTemplate.java',
      explanation: 'Template Method in Java with final workflow and abstract steps.',
      code: `public abstract class DataMiner {
    public final void mine(String path) {
        openFile(path); extract(); closeFile();
    }
    protected void openFile(String p) { System.out.println("Open " + p); }
    protected abstract void extract();
    protected void closeFile() { System.out.println("Close"); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class AbstractClass {
  +templateMethod()
  #step1()
  #step2()*
}
class ConcreteClass
AbstractClass <|-- ConcreteClass`,
    diagramFlowchart: `flowchart LR
Caller --> Template["templateMethod()"]
Template --> Step1["step1() - common"]
Template --> Step2["step2() - subclass hook"]
Template --> Step3["step3() - common"]`,
  },

  visitor: {
    title: 'XML Shape Exporter (Double Dispatch)',
    scenario: 'Exporting vector shapes (Dot, Circle, CompoundGraphic) to XML without polluting the graphic classes with serialization logic.',
    problem: 'Adding new operations (XML export, JSON export, SVG export) across an existing class hierarchy would pollute domain classes with unrelated code.',
    solution: 'Extract new operations into Visitor classes. Elements define accept(Visitor) which redirects calls back to type-specific visit methods (double dispatch).',
    whenToUse: [
      'Use when you need to perform an operation on all elements of a complex object structure (for example, an object tree).',
      'Use to clean up the business logic of auxiliary behaviors from core domain classes.',
    ],
    whenNotToUse: [
      'Avoid if the element class hierarchy changes frequently, as adding a new element forces modifying every visitor class.',
    ],
    asciiShape: `Shape.accept(Visitor) ──► Visitor.visitDot(Dot)
                       └──► Visitor.visitCircle(Circle)`,
    typeScript: {
      fileName: 'XmlExportVisitor.ts',
      explanation: 'XMLExportVisitor serializes shapes to XML tags without shapes knowing XML details.',
      code: `interface Visitor {
  visitDot(d: DotElement): void;
  visitCircle(c: CircleElement): void;
}

interface ShapeElement {
  accept(v: Visitor): void;
}

class DotElement implements ShapeElement {
  constructor(public x: number, public y: number) {}
  accept(v: Visitor) { v.visitDot(this); }
}

class CircleElement implements ShapeElement {
  constructor(public radius: number) {}
  accept(v: Visitor) { v.visitCircle(this); }
}

class XMLExportVisitor implements Visitor {
  visitDot(d: DotElement) {
    console.log(\`<dot x="\${d.x}" y="\${d.y}"/>\`);
  }
  visitCircle(c: CircleElement) {
    console.log(\`<circle radius="\${c.radius}"/>\`);
  }
}

const shapes: ShapeElement[] = [new DotElement(5, 10), new CircleElement(25)];
const exporter = new XMLExportVisitor();
shapes.forEach(s => s.accept(exporter));`,
    },
    java: {
      fileName: 'XmlExportVisitor.java',
      explanation: 'Java Visitor pattern implementing double dispatch.',
      code: `public interface Visitor { void visit(Dot d); void visit(Circle c); }
public interface Element { void accept(Visitor v); }
public class Dot implements Element { public void accept(Visitor v) { v.visit(this); } }`,
    },
    diagramUml: `classDiagram
direction LR
class Element {
  <<interface>>
  +accept(Visitor)
}
class ConcreteElementA
class ConcreteElementB
class Visitor {
  <<interface>>
  +visitA(ConcreteElementA)
  +visitB(ConcreteElementB)
}
class ConcreteVisitor
Element <|.. ConcreteElementA
Element <|.. ConcreteElementB
Visitor <|.. ConcreteVisitor`,
    diagramFlowchart: `flowchart LR
Client --> Element["Element.accept(visitor)"]
Element -->|double dispatch| Visitor["Visitor.visitConcreteElement(this)"]`,
  },

  interpreter: {
    title: 'Mathematical Expression Grammar Parser',
    scenario: 'Parsing and evaluating recursive algebraic expressions (e.g. 5 + (10 - 2)) using composite grammar expression nodes.',
    problem: 'Recurring domain problems expressed in formal grammar require manual string parsing and error-prone evaluation ladders.',
    solution: 'Map each grammar rule to an Expression class. Compose terminal and non-terminal expressions into an abstract syntax tree and call interpret().',
    whenToUse: [
      'Use when the grammar is simple and efficiency is not a critical issue.',
    ],
    whenNotToUse: [
      'Avoid for complex grammars where dedicated parser generators (like ANTLR) are much faster and more maintainable.',
    ],
    asciiShape: `AddExpression(+)
   ├── NumberExpression(10)
   └── SubtractExpression(-)
         ├── NumberExpression(20)
         └── NumberExpression(5)`,
    typeScript: {
      fileName: 'ExpressionInterpreter.ts',
      explanation: 'Terminal and non-terminal expression classes evaluate arithmetic trees recursively.',
      code: `interface Expression {
  interpret(): number;
}

class NumberExpression implements Expression {
  constructor(private value: number) {}
  interpret() { return this.value; }
}

class AddExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}
  interpret() { return this.left.interpret() + this.right.interpret(); }
}

class SubtractExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}
  interpret() { return this.left.interpret() - this.right.interpret(); }
}

// Represents: 5 + (20 - 7)
const expr = new AddExpression(
  new NumberExpression(5),
  new SubtractExpression(new NumberExpression(20), new NumberExpression(7))
);

console.log("Evaluated Result:", expr.interpret()); // 18`,
    },
    java: {
      fileName: 'ExpressionInterpreter.java',
      explanation: 'Arithmetic Interpreter in Java evaluating expression trees.',
      code: `public interface Expression { int interpret(); }
public class NumberExpr implements Expression {
    private int n; public NumberExpr(int n) { this.n = n; }
    public int interpret() { return n; }
}
public class AddExpr implements Expression {
    private Expression l, r;
    public AddExpr(Expression l, Expression r) { this.l = l; this.r = r; }
    public int interpret() { return l.interpret() + r.interpret(); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class AbstractExpression {
  <<interface>>
  +interpret(context)
}
class TerminalExpression {
  +interpret(context)
}
class NonTerminalExpression {
  -left: AbstractExpression
  -right: AbstractExpression
  +interpret(context)
}
AbstractExpression <|.. TerminalExpression
AbstractExpression <|.. NonTerminalExpression`,
    diagramFlowchart: `flowchart LR
Client --> AST["Root Expression (AddExpression)"]
AST --> Left["Terminal (Number)"]
AST --> Right["NonTerminal (SubtractExpression)"]
Right --> RightChild["Terminal (Number)"]`,
  },
};
