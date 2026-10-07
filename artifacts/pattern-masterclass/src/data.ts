import { JAVA_EXAMPLES } from './java-examples';

export type Category = 'Creational' | 'Structural' | 'Behavioral';
export type Pattern = {
  id:string; name:string; category:Category; tagline:string; intent:string; problem:string; solution:string;
  whenToUse:string[]; whenNotToUse:string[]; realWorldEnterpriseScenario:string; memoryHook:string; asciiShape:string;
  javaImplementation:{fileName:string;explanation:string;code:string};
  typeScriptImplementation:{fileName:string;explanation:string;code:string};
  runnableCode:string; solidPrinciples:{principle:string;impact:string;explanation:string}[];
  confusedWith:{targetPattern:string;keyDifference:string;decisionRule:string}[]; interviewTraps:string[];
};
type Seed = [string,string,string,string,string,string,string,string,string,string,string,string];
const seeds: Seed[] = [
['factory-method','Factory Method','Creational','Define an interface for creating an object, but let subclasses decide which class to instantiate.','Delegate object instantiation to subclasses through a specialized method call.','Directly calling a concrete constructor couples application code to specific classes, making extension for new types impossible without editing the client.','Encapsulate constructor calls in an overridable factory method; concrete creators choose the product.','Cloud storage managers create AWS S3 or Google Cloud Storage drivers.','Subclasses decide who gets instantiated.','Factory Method → Creator → createProduct() → ConcreteProduct','Cloud storage driver initialization across S3, GCS, and Azure providers.','Avoid a class hierarchy when object creation is simple and fixed.'],
['abstract-factory','Abstract Factory','Creational','Provide an interface for creating families of related or dependent objects without specifying their concrete classes.','Produce compatible families of products through a shared factory interface.','A client needs one of several product families and must not accidentally mix components from different vendors.','Define one factory with creation methods for each product in the family; supply a concrete factory per variant.','A multi-cloud orchestrator creates compute, storage, and firewall resources matched to AWS or GCP.','Families of matched products.','Client → CloudResourceFactory → {Compute, Storage} → Provider products','Multi-cloud orchestration producing compute, storage, and firewall resources for one provider.','Adding new product kinds changes every factory implementation.'],
['builder','Builder','Creational','Separate the construction of a complex object from its representation so the same process can create different representations.','Construct complex objects step-by-step with optional configurations.','Telescoping constructors with many optional parameters are hard to read, validate, and call correctly.','Move construction into a dedicated builder with readable configuration steps and one validated build operation.','HTTP requests composed from URL, headers, timeout, payload, and TLS configuration.','Step-by-step construction.','Client → Builder.set…() → build() → Product','An HTTP request builder collects headers, timeouts, payload, and certificates.','Simple products with only a few mandatory fields rarely need a separate builder.'],
['prototype','Prototype','Creational','Specify the kinds of objects to create using a prototypical instance, and create new objects by copying it.','Create objects by cloning a configured prototype rather than rebuilding from scratch.','A system needs many similar objects whose setup is expensive or whose concrete type is decided at runtime.','Expose a clone operation on prototypes and copy a preconfigured instance, carefully defining deep-copy behavior.','Template-based document generation clones a configured report with its styles and sections.','Clone a configured starting point.','Client → Prototype.clone() → configured copy','A document service duplicates preconfigured report templates for each customer.','Mutable nested references make a shallow clone behave like shared state.'],
['singleton','Singleton','Creational','Ensure a class has only one instance and provide a global point of access to it.','Share one controlled instance of a service across an application boundary.','Repeated instances of a resource manager can conflict or consume scarce resources.','Control construction and provide one stable accessor, with lifecycle and concurrency rules explicit.','A process-wide configuration registry or shared connection-pool manager.','One instance, one access point.','Client → Singleton.instance() → shared service','A process-wide configuration registry shared by application modules.','Global mutable state hides dependencies and complicates tests; dependency injection may be clearer.'],
['adapter','Adapter','Structural','Convert the interface of a class into another interface clients expect.','Translate an incompatible interface into the contract an existing client understands.','A useful third-party service speaks a different API than the application expects.','Wrap the adaptee and translate calls and data at the boundary behind the target interface.','A metric exporter adapter maps an external SDK into an internal telemetry contract.','Translate one contract into another.','Client → Target → Adapter → Adaptee','A third-party metric exporter is normalized to the platform telemetry API.','Adapters should translate a boundary, not become a second business layer.'],
['bridge','Bridge','Structural','Decouple an abstraction from its implementation so the two can vary independently.','Separate a high-level abstraction from its platform-specific implementation.','Two independent dimensions of variation create a subclass explosion when combined by inheritance.','Compose an abstraction with an implementation interface; vary either hierarchy independently.','A notification API supports email, SMS, and push transports with urgent and scheduled notification types.','Two axes vary independently.','Abstraction → Implementor; RefinedAbstraction calls concrete implementor','A notification service supports several message types and delivery transports independently.','If there is only one stable axis, the extra indirection may not pay off.'],
['composite','Composite','Structural','Compose objects into tree structures to represent part-whole hierarchies; let clients treat individual objects and compositions uniformly.','Give leaves and groups the same interface in a recursive tree.','Client code must branch on whether an item is a single object or a nested group.','Implement a common component interface for leaves and composites; composites delegate to children.','A cloud resource bill recursively totals individual resources and nested project groups.','Treat a branch like a leaf.','Component ← Leaf; Component ← Composite(children: Component[])','Nested project and cloud-resource trees expose one recursive cost interface.','Operations that make no sense for leaves can make a uniform API awkward.'],
['decorator','Decorator','Structural','Attach additional responsibilities to an object dynamically; decorators provide a flexible alternative to subclassing.','Layer optional behavior around an object while preserving its interface.','Many combinations of optional features would otherwise require a subclass for every combination.','Wrap the component with objects that implement the same contract and delegate while adding behavior.','An HTTP client layers caching, metrics, retry, and rate-limit policies around a transport.','Wrap an object to add one capability.','Component ← ConcreteComponent; Decorator(Component) → ConcreteDecorator','An HTTP client composes caching, retry, and metrics wrappers around a transport.','Many invisible wrappers can obscure call order and make debugging difficult.'],
['facade','Facade','Structural','Provide a unified interface to a set of interfaces in a subsystem.','Offer one clear entry point to a complex subsystem.','Clients need to coordinate multiple low-level services and inherit their setup complexity.','Place a focused higher-level interface in front of subsystem components without removing their advanced APIs.','A media export service coordinates codec, storage, metadata, and notification systems.','One front door to a subsystem.','Client → Facade → subsystem services','A media export workflow coordinates encoding, object storage, metadata, and notifications.','A facade should simplify common tasks, not become a god object for every workflow.'],
['flyweight','Flyweight','Structural','Use sharing to support large numbers of fine-grained objects efficiently.','Share intrinsic state while keeping context-specific state external.','Large volumes of similar objects repeat expensive immutable data.','Separate shared intrinsic data into flyweight instances and pass variable extrinsic data at use time.','A map renderer shares style and glyph objects across thousands of visible map labels.','Share what does not change.','Client → FlyweightFactory → shared Flyweight + external context','A map renderer reuses glyph and style data across many label instances.','Incorrectly sharing mutable extrinsic state causes objects to leak context.'],
['proxy','Proxy','Structural','Provide a surrogate or placeholder for another object to control access to it.','Stand in for a service to control when and how the real object is reached.','Access needs lazy loading, permission checks, remote calls, caching, or lifecycle management.','Implement the same interface as the real subject and forward calls when access is allowed or needed.','A protection proxy checks permissions before a remote service call and caches safe responses.','A controlled stand-in.','Client → Subject ← {Proxy, RealSubject}; Proxy delegates conditionally','A resilient HTTP client enforces authorization, caching, and retry around a network service.','A proxy controls access; it should not be confused with a decorator that adds responsibilities.'],
['strategy','Strategy','Behavioral','Define a family of algorithms, encapsulate each one, and make them interchangeable.','Swap algorithms inside an object at runtime without changing the clients using it.','A single method contains a large conditional ladder for variants of an algorithm.','Extract each algorithm into a class or function behind one interface and inject the selected strategy.','Dynamic checkout pricing switches between retail, wholesale, and holiday algorithms.','Interchangeable algorithms behind one interface.','Context → Strategy ← ConcreteStrategies','Dynamic checkout pricing swaps retail, B2B, or holiday discount rules.','The client must still choose a strategy; avoid making a strategy hierarchy for static trivial logic.'],
['observer','Observer','Behavioral','Define a one-to-many dependency so when one object changes state, all dependents are notified.','Publish events to multiple subscribers automatically upon state changes.','A subject needs to notify an unknown or changing set of dependents without coupling to them.','Let observers subscribe and unsubscribe to a subject that broadcasts an event.','An order event notifies inventory, email, and analytics systems.','Don’t call us; we’ll notify you.','Subject → attach/detach → Observer.update() × N','Order fulfillment events notify inventory, email, and analytics subscribers.','Forgotten unsubscriptions can cause memory leaks; ordering may be nondeterministic.'],
['command','Command','Behavioral','Encapsulate a request as an object, allowing clients to parameterize, queue, log, and undo requests.','Transform an action into a stand-alone object containing its parameters.','Operations need to be queued, scheduled, logged, or reversed through undo/redo.','Encapsulate the receiver and arguments behind an executable command with optional compensation.','A database transaction manager tracks reversible account updates.','Actions packaged as objects with undo.','Invoker → Command.execute()/undo() → Receiver','A transaction manager stores account adjustment commands for rollback.','History can retain stale receivers or large payloads; undo semantics need explicit design.'],
['state','State','Behavioral','Allow an object to alter its behavior when its internal state changes; it appears to change its class.','Encapsulate state-specific behavior and transitions into discrete state objects.','Large conditionals grow as an object’s business lifecycle gains states and allowed actions.','Move each state’s behavior into a concrete state and delegate operations from the context.','An order lifecycle transitions through created, paid, packed, shipped, and delivered.','Behavior changes when the state flips.','Context → State.handle(context) → ConcreteState / transition','Order fulfillment controls valid actions across payment, packaging, shipment, and delivery.','State classes can become tightly coupled when they construct one another directly.'],
['chain-of-responsibility','Chain of Responsibility','Behavioral','Give more than one object a chance to handle a request, decoupling sender from receiver.','Pass requests along a chain of handlers until one handles it or the pipeline completes.','Several sequential checks or interceptors process a payload before business logic.','Make each check a handler with a link to the next; a handler may handle, reject, or forward.','A security filter chain validates identity, rate limits, and request shape.','Pass the buck down the pipeline.','Request → Handler → Handler → Handler → terminal action','Security middleware validates JWT, CORS rules, and rate limits in sequence.','Uncaught fall-through can silently drop work or accidentally allow a request.'],
['iterator','Iterator','Behavioral','Provide sequential access to elements of an aggregate without exposing its underlying representation.','Traverse a data structure without exposing its internal pointers or nodes.','Clients duplicate traversal logic or depend on internal representation.','Move cursor and traversal policy into an iterator with a small next/hasNext contract.','A database cursor streams paginated records without loading the full result set.','Next, next, next—without exposing the internals.','Aggregate.createIterator() → Iterator.hasNext()/next()','A database cursor streams remote records page by page.','Mutating a collection while iterating can invalidate the cursor or skip data.'],
['mediator','Mediator','Behavioral','Define an object that encapsulates how a set of objects interact.','Route interactions through a central coordinator instead of a web of direct references.','Every component directly references many others, creating a brittle dependency mesh.','Let components report events to a mediator that coordinates the participants.','An air-traffic controller coordinates aircraft without aircraft communicating directly.','Air traffic control for chatty components.','Component ↔ Mediator ↔ Component','A complex form mediator enables controls and panels in response to input changes.','The mediator can become a god object if it absorbs unrelated coordination rules.'],
['memento','Memento','Behavioral','Capture and externalize an object’s internal state without violating encapsulation so it can be restored later.','Capture a private snapshot that can be restored without exposing the originator’s fields.','Undo needs snapshots, but direct access to private fields would break encapsulation.','Let the originator create and restore an opaque memento; a caretaker may store it.','Infrastructure configuration drafts can roll back to a previous revision.','A savegame checkpoint.','Originator.createMemento() → Caretaker stores token → Originator.restore()','Cloud configuration drafts restore a prior infrastructure specification.','Deep snapshots can consume significant memory and require lifecycle limits.'],
['template-method','Template Method','Behavioral','Define an algorithm skeleton in an operation, deferring some steps to subclasses.','Fix the workflow order while allowing subclasses to override selected steps.','Several workflows share an algorithm structure but vary in a few operations.','Put the invariant sequence in a base-class template method and expose step hooks.','ETL pipelines share extract-transform-load structure while source formats vary.','Algorithm skeleton in a superclass; steps in subclasses.','Template.run() → extract() → transform() → load()','CSV, SQL, and JSON pipelines vary extraction while sharing staging and loading.','Inheritance constrains flexibility when workflows diverge substantially.'],
['visitor','Visitor','Behavioral','Represent an operation on elements of an object structure without changing their classes.','Add operations to a stable object hierarchy using double dispatch.','New operations across many node types would pollute core classes with unrelated logic.','Elements accept a visitor; concrete nodes dispatch to type-specific visit methods.','AST linters and type checkers traverse compiler syntax trees.','Double dispatch for external operations.','Element.accept(Visitor) → Visitor.visitConcreteElement(element)','Compiler AST nodes support separate linting, export, and type-check operations.','Adding a new element type requires updating every visitor implementation.'],
['interpreter','Interpreter','Behavioral','Represent a grammar and define an interpreter that uses the representation to interpret sentences.','Evaluate a small domain language using a compositional grammar tree.','A recurring domain problem is naturally expressed as compact grammatical expressions.','Map grammar rules to expression objects with an interpret(context) operation.','A dynamic filter expression evaluates boolean query criteria.','Grammar trees evaluate domain languages.','Expression.interpret(context) ← Terminal / Nonterminal expressions','A dynamic SQL filter parser evaluates boolean search criteria.','For complex grammars, a dedicated parser generator is more maintainable.'],
];
const seedKeys = ['id','name','category','tagline','intent','problem','solution','realWorldEnterpriseScenario','memoryHook','asciiShape','scenario','avoid'] as const;
const snippets: Record<string,string> = {
  'factory-method':`interface StorageDriver { upload(path: string, bytes: number): void; }
class S3Driver implements StorageDriver {
  upload(path: string, bytes: number) { console.log(\`[S3 Driver] Uploaded \${bytes} bytes to \${path}\`); }
}
abstract class StorageFactory {
  abstract create(): StorageDriver;
  save(path: string, bytes: number) { this.create().upload(path, bytes); }
}
class S3Factory extends StorageFactory { create() { return new S3Driver(); } }
new S3Factory().save("reports/audit.pdf", 4096);`,
  'abstract-factory':`class EC2 { start() { console.log("AWS EC2 started"); } }
class S3 { init() { console.log("AWS S3 bucket allocated"); } }
class AwsFactory {
  getCompute() { return new EC2(); }
  getStorage() { return new S3(); }
}
const cloud = new AwsFactory();
cloud.getCompute().start();
cloud.getStorage().init();`,
  builder:`class RequestBuilder {
  private params: Record<string, any> = { method: "GET", headers: {} };
  url(value: string) { this.params.url = value; return this; }
  auth(token: string) { this.params.headers.Authorization = "Bearer " + token; return this; }
  build() { console.log("Built Request:", JSON.stringify(this.params)); return this.params; }
}
new RequestBuilder().url("https://api.internal/v1/metrics").auth("secret-token").build();`,
  'factory-method-java':`public interface StorageDriver { void upload(String path, byte[] content); }
public abstract class StorageManager {
  public abstract StorageDriver createDriver();
  public void backupFile(String filename, byte[] data) {
    StorageDriver driver = createDriver();
    driver.upload(filename, data);
  }
}`,
  strategy:`interface RouteStrategy { plan(from: string, to: string): string; }
class FastRoute implements RouteStrategy {
  plan(a: string, b: string) { return \`Fast route \${a}->\${b} via Highway\`; }
}
class ScenicRoute implements RouteStrategy {
  plan(a: string, b: string) { return \`Scenic route \${a}->\${b} via Coast\`; }
}
class Navigator {
  constructor(private strategy: RouteStrategy) {}
  go(a: string, b: string) { console.log(this.strategy.plan(a, b)); }
}
new Navigator(new ScenicRoute()).go("SF", "Monterey");`,
  observer:`class Topic {
  private subscribers: ((message: string) => void)[] = [];
  subscribe(fn: (message: string) => void) { this.subscribers.push(fn); }
  broadcast(message: string) { this.subscribers.forEach(fn => fn(message)); }
}
const news = new Topic();
news.subscribe(message => console.log("[Slack Bot]: " + message));
news.subscribe(message => console.log("[Email]: " + message));
news.broadcast("Service 503 Outage Detected");`,
  command:`class Editor { content = ""; }
class AppendCommand {
  constructor(private editor: Editor, private text: string) {}
  execute() { this.editor.content += this.text; }
  undo() { this.editor.content = this.editor.content.slice(0, -this.text.length); }
}
const doc = new Editor();
const append = new AppendCommand(doc, "Hello ");
append.execute();
console.log("After execute:", doc.content);
append.undo();
console.log("After undo:", doc.content);`,
};
const examples: Record<string,string> = {
  prototype:`type Report = { title: string; sections: string[]; clone(): Report };
const template: Report = { title: "Quarterly review", sections: ["Summary"], clone() { return { ...this, sections: [...this.sections] }; } };
const customerCopy = template.clone();
customerCopy.title = "North region review";
console.log("Prototype:", template.title, "→", customerCopy.title);`,
  singleton:`class ConfigRegistry {
  private static instance?: ConfigRegistry;
  private values = new Map<string, string>();
  static shared() { return this.instance ??= new ConfigRegistry(); }
  set(key: string, value: string) { this.values.set(key, value); }
  get(key: string) { return this.values.get(key); }
}
ConfigRegistry.shared().set("region", "eu-west");
console.log("Shared config:", ConfigRegistry.shared().get("region"));`,
  adapter:`interface Metrics { record(name: string, value: number): void; }
class VendorSdk { sendMetric(key: string, amount: number) { console.log(\`Vendor metric: \${key}=\${amount}\`); } }
class MetricsAdapter implements Metrics {
  constructor(private sdk: VendorSdk) {}
  record(name: string, value: number) { this.sdk.sendMetric(name, value); }
}
new MetricsAdapter(new VendorSdk()).record("checkout.latency", 184);`,
  bridge:`interface Delivery { send(message: string): void; }
class EmailDelivery implements Delivery { send(m: string) { console.log("Email:", m); } }
class SmsDelivery implements Delivery { send(m: string) { console.log("SMS:", m); } }
class UrgentAlert {
  constructor(private delivery: Delivery) {}
  notify(message: string) { this.delivery.send("URGENT: " + message); }
}
new UrgentAlert(new SmsDelivery()).notify("Capacity threshold reached");`,
  composite:`interface FileNode { size(): number; }
class File implements FileNode { constructor(private bytes: number) {} size() { return this.bytes; } }
class Folder implements FileNode {
  private children: FileNode[] = [];
  add(node: FileNode) { this.children.push(node); }
  size() { return this.children.reduce((total, node) => total + node.size(), 0); }
}
const root = new Folder(); root.add(new File(120)); root.add(new File(80));
console.log("Recursive folder size:", root.size(), "bytes");`,
  decorator:`interface Coffee { cost(): number; description(): string; }
class Espresso implements Coffee { cost() { return 3.25; } description() { return "Espresso"; } }
class OatMilk implements Coffee {
  constructor(private drink: Coffee) {}
  cost() { return this.drink.cost() + 0.65; }
  description() { return this.drink.description() + " + oat milk"; }
}
const drink = new OatMilk(new Espresso());
console.log(drink.description(), "· $"+drink.cost().toFixed(2));`,
  facade:`class Codec { encode(file: string) { console.log("Encoding", file); } }
class Storage { upload(file: string) { console.log("Uploaded to archive:", file); } }
class ExportFacade {
  constructor(private codec: Codec, private storage: Storage) {}
  export(file: string) { this.codec.encode(file); this.storage.upload(file); }
}
new ExportFacade(new Codec(), new Storage()).export("annual-report.mov");`,
  flyweight:`class GlyphFactory {
  private cache = new Map<string, { glyph: string; font: string }>();
  get(glyph: string, font: string) {
    const key = glyph + font;
    if (!this.cache.has(key)) this.cache.set(key, { glyph, font });
    return this.cache.get(key)!;
  }
  get uniqueGlyphs() { return this.cache.size; }
}
const factory = new GlyphFactory();
["GoF", "GoF"].forEach(word => [...word].forEach(g => factory.get(g, "Newsreader")));
console.log("Shared glyph objects:", factory.uniqueGlyphs);`,
  proxy:`interface DocumentService { open(id: string): void; }
class RemoteDocument implements DocumentService { open(id: string) { console.log("Fetching document:", id); } }
class PermissionProxy implements DocumentService {
  constructor(private real: DocumentService, private role: string) {}
  open(id: string) { if (this.role !== "editor") return console.log("Access denied"); this.real.open(id); }
}
new PermissionProxy(new RemoteDocument(), "editor").open("contract-204");`,
  state:`interface State { publish(doc: Document): void; }
class Draft implements State { publish(doc: Document) { console.log("Draft → moderation"); doc.state = new Moderation(); } }
class Moderation implements State { publish() { console.log("Moderation → live"); } }
class Document { state: State = new Draft(); publish() { this.state.publish(this); } }
const doc = new Document(); doc.publish(); doc.publish();`,
  'chain-of-responsibility':`abstract class Handler {
  next?: Handler;
  link(handler: Handler) { this.next = handler; return handler; }
  handle(request: { role: string; rate: number }): boolean { return this.next?.handle(request) ?? true; }
}
class Auth extends Handler { handle(r: {role:string;rate:number}) { if (r.role !== "ADMIN") { console.log("Blocked: not ADMIN"); return false; } console.log("Auth ✓"); return super.handle(r); } }
class RateLimit extends Handler { handle(r: {role:string;rate:number}) { if (r.rate > 100) { console.log("Blocked: rate limit"); return false; } console.log("Rate limit ✓"); return super.handle(r); } }
const chain = new Auth(); chain.link(new RateLimit());
console.log("Allowed:", chain.handle({ role: "ADMIN", rate: 45 }));`,
  iterator:`class TreeCollection {
  constructor(private values: number[]) {}
  *[Symbol.iterator]() { for (const value of this.values) yield value * 10; }
}
for (const value of new TreeCollection([1, 2, 3])) console.log("Yielded:", value);`,
  mediator:`class ChatRoom {
  send(sender: string, message: string) { console.log(\`[Broadcast from \${sender}]: \${message}\`); }
}
class User {
  constructor(private name: string, private hub: ChatRoom) {}
  say(message: string) { this.hub.send(this.name, message); }
}
new User("Ari", new ChatRoom()).say("The release is ready.");`,
  memento:`class Canvas {
  constructor(public color = "white") {}
  snapshot() { return { color: this.color }; }
  restore(state: { color: string }) { this.color = state.color; }
}
const canvas = new Canvas("blue"); const save = canvas.snapshot();
canvas.color = "red"; console.log("Changed:", canvas.color);
canvas.restore(save); console.log("Restored:", canvas.color);`,
  'template-method':`abstract class GameEngine {
  play() { this.init(); this.loop(); this.cleanup(); }
  abstract init(): void;
  abstract loop(): void;
  cleanup() { console.log("Engine memory freed"); }
}
class Chess extends GameEngine {
  init() { console.log("Setting up chessboard"); }
  loop() { console.log("Running move evaluations"); }
}
new Chess().play();`,
  visitor:`interface Element { accept(visitor: Visitor): void; }
interface Visitor { visitText(text: TextElement): void; }
class TextElement implements Element {
  constructor(public text: string) {}
  accept(visitor: Visitor) { visitor.visitText(this); }
}
class JsonExportVisitor implements Visitor {
  visitText(node: TextElement) { console.log(JSON.stringify({ text: node.text })); }
}
new TextElement("Sample Payload").accept(new JsonExportVisitor());`,
  interpreter:`interface Expr { eval(ctx: Record<string, number>): number; }
class NumberExpr implements Expr { constructor(private n: number) {} eval() { return this.n; } }
class AddExpr implements Expr {
  constructor(private left: Expr, private right: Expr) {}
  eval(ctx: Record<string, number>) { return this.left.eval(ctx) + this.right.eval(ctx); }
}
const ast = new AddExpr(new NumberExpr(10), new NumberExpr(25));
console.log("Evaluated:", ast.eval({}));`,
};
export const PATTERNS: Pattern[] = seeds.map((seed) => {
  const d = Object.fromEntries(seedKeys.map((key,i)=>[key,seed[i]])) as Record<typeof seedKeys[number],string>;
  const java = snippets[d.id+'-java'] || JAVA_EXAMPLES[d.id] || `// ${d.name}\n// ${d.intent}`;
  const ts = snippets[d.id] || examples[d.id] || `// ${d.name}\n// ${d.intent}\ninterface ${d.name.replace(/[^A-Za-z]/g,'')} {\n  execute(): void;\n}\nclass Example implements ${d.name.replace(/[^A-Za-z]/g,'')} {\n  execute() { console.log("${d.memoryHook}"); }\n}\nnew Example().execute();`;
  const safe = d.name.replace(/[^A-Za-z]/g,'');
  const familyProblem = d.category === 'Creational' ? 'You need to control or vary object construction.' : d.category === 'Structural' ? 'You need to change how objects or interfaces fit together.' : 'You need to organize responsibilities or interactions between objects.';
  return {
    id:d.id,name:d.name,category:d.category as Category,tagline:d.tagline,intent:d.intent,problem:d.problem || familyProblem,solution:d.solution,
    whenToUse:[d.scenario, d.intent],whenNotToUse:[d.avoid],realWorldEnterpriseScenario:d.scenario,memoryHook:d.memoryHook,asciiShape:d.asciiShape,
    javaImplementation:{fileName:`${safe}.java`,explanation:`${d.name} applied to the example: ${d.scenario}`,code:java},
    typeScriptImplementation:{fileName:`${d.id}.ts`,explanation:`${d.name} in TypeScript. ${d.intent}`,code:ts},
    runnableCode:snippets[d.id] || examples[d.id] || ts,
    solidPrinciples:[{principle:'Single Responsibility Principle',impact:'adheres',explanation:d.solution},{principle:'Open/Closed Principle',impact:'trades-off',explanation:'New variants can be introduced behind the pattern role; assess the cost of additional indirection.'}],
    confusedWith:[{targetPattern:d.category === 'Creational' ? 'Factory Method' : d.category === 'Structural' ? 'Decorator' : 'Strategy',keyDifference:`${d.name} addresses this specific design pressure: ${d.intent.toLowerCase()}`,decisionRule:d.memoryHook}],
    interviewTraps:[d.avoid,`Do not choose ${d.name} by name alone; explain the changing responsibility and the trade-off.`]
  };
});

export type QuizOption = {id:string;patternName:string;isCorrect:boolean;distractorRationale:string};
export type Question = {id:string;scenarioNumber:number;category:string;difficulty:string;title:string;systemScenario:string;architecturalConstraints:string[];options:QuizOption[];correctPattern:string;deepExplanation:string;memoryRule:string};
export const QUIZ: Question[] = [
  {id:'q1',scenarioNumber:1,category:'Behavioral',difficulty:'Senior',title:'Multi-Vendor Payment Processing Engine',systemScenario:'You are designing the checkout module for an enterprise e-commerce platform. The system must support credit card payments via Stripe, deferred financing via Klarna, and crypto settlements. The core checkout workflow must remain identical regardless of the payment method, and new payment providers must be pluggable via configuration without touching checkout logic.',architecturalConstraints:['Zero modifications to checkout order processing classes when adding vendors.','Payment provider selected dynamically based on user checkout choices.','Algorithms vary in communication and verification protocols.'],options:[{id:'opt1',patternName:'Template Method',isCorrect:false,distractorRationale:'Template Method relies on inheritance for a fixed sequence and is a poor fit for interchangeable payment rules.'},{id:'opt2',patternName:'Strategy',isCorrect:true,distractorRationale:''},{id:'opt3',patternName:'Observer',isCorrect:false,distractorRationale:'Observer broadcasts change notifications; it does not encapsulate an interchangeable payment algorithm.'},{id:'opt4',patternName:'Abstract Factory',isCorrect:false,distractorRationale:'Abstract Factory creates compatible families of products, not one swappable payment algorithm.'}],correctPattern:'Strategy',deepExplanation:'Payment providers are alternative algorithms selected per checkout. A common strategy interface keeps the workflow stable while allowing Stripe, Klarna, and crypto implementations to vary independently.',memoryRule:'Interchangeable algorithm chosen by the client = Strategy.'},
  {id:'q2',scenarioNumber:2,category:'Structural',difficulty:'Senior',title:'Third-Party Metric Exporter Incompatibility',systemScenario:'A platform telemetry service expects recordMetric(name, value), but a third-party vendor SDK exposes sendCounter(metricKey, amount). The SDK cannot be changed. Several exporters may be integrated over time, and product code should continue speaking its own telemetry interface.',architecturalConstraints:['Keep the platform-owned interface stable.','Translate the vendor SDK shape at the boundary.','Do not add vendor-specific branches to the telemetry service.'],options:[{id:'opt1',patternName:'Proxy',isCorrect:false,distractorRationale:'A proxy controls access to an object with the same interface; this mismatch needs translation.'},{id:'opt2',patternName:'Facade',isCorrect:false,distractorRationale:'A facade simplifies a subsystem; here the key pressure is incompatible interfaces.'},{id:'opt3',patternName:'Adapter',isCorrect:true,distractorRationale:''},{id:'opt4',patternName:'Decorator',isCorrect:false,distractorRationale:'A decorator adds behavior while retaining an interface; it does not translate this contract.'}],correctPattern:'Adapter',deepExplanation:'The vendor cannot change its API and the application contract must remain stable. An adapter implements the platform target, then translates each call to the vendor SDK.',memoryRule:'Same purpose, incompatible interface = Adapter.'},
  {id:'q3',scenarioNumber:3,category:'Creational',difficulty:'Senior',title:'Complex Query Specification Construction',systemScenario:'An analytics API builds query specifications from a required data source plus optional projections, filters, grouping, sort order, pagination, and timeout settings. Callers currently pass long positional argument lists, and invalid partial queries reach the database.',architecturalConstraints:['Make optional configuration readable at the call site.','Validate required settings once before execution.','The final query object should be immutable.'],options:[{id:'opt1',patternName:'Factory Method',isCorrect:false,distractorRationale:'Factory Method selects a concrete product implementation; the issue here is staged configuration.'},{id:'opt2',patternName:'Abstract Factory',isCorrect:false,distractorRationale:'There are no compatible product families to create.'},{id:'opt3',patternName:'Builder',isCorrect:true,distractorRationale:''},{id:'opt4',patternName:'Prototype',isCorrect:false,distractorRationale:'Cloning an existing query does not address clear optional configuration and validation.'}],correctPattern:'Builder',deepExplanation:'Many optional query parameters make telescoping constructors error-prone. A builder provides a readable, staged API and validates required fields at build time before producing an immutable specification.',memoryRule:'Many optional construction steps = Builder.'},
];
