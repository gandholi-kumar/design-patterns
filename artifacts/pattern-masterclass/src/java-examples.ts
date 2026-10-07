export const JAVA_EXAMPLES: Record<string, string> = {
  'abstract-factory': `interface Compute { void launch(); }
interface Bucket { void allocate(); }
interface CloudFactory { Compute compute(); Bucket bucket(); }
class AwsFactory implements CloudFactory {
  public Compute compute() { return () -> System.out.println("EC2 launched"); }
  public Bucket bucket() { return () -> System.out.println("S3 allocated"); }
}
CloudFactory cloud = new AwsFactory(); cloud.compute().launch(); cloud.bucket().allocate();`,
  builder: `final class HttpRequest {
  final String url, method; final int timeout;
  private HttpRequest(Builder b) { url=b.url; method=b.method; timeout=b.timeout; }
  static class Builder {
    String url, method="GET"; int timeout=5000;
    Builder url(String v) { url=v; return this; }
    Builder method(String v) { method=v; return this; }
    HttpRequest build() { if (url==null) throw new IllegalStateException("URL required"); return new HttpRequest(this); }
  }
}
HttpRequest request = new HttpRequest.Builder().url("/metrics").method("GET").build();`,
  prototype: `interface Prototype<T> { T copy(); }
class Report implements Prototype<Report> {
  String title; List<String> sections;
  public Report copy() { Report r=new Report(); r.title=title; r.sections=new ArrayList<>(sections); return r; }
}
Report customerCopy = template.copy();`,
  singleton: `final class ConfigRegistry {
  private static final ConfigRegistry INSTANCE = new ConfigRegistry();
  private final Map<String,String> values = new HashMap<>();
  private ConfigRegistry() {}
  static ConfigRegistry shared() { return INSTANCE; }
  String get(String key) { return values.get(key); }
}
ConfigRegistry.shared().get("region");`,
  adapter: `interface Metrics { void record(String name, double value); }
class VendorSdk { void sendCounter(String key, double amount) { System.out.println(key+"="+amount); } }
class MetricsAdapter implements Metrics {
  private final VendorSdk sdk;
  MetricsAdapter(VendorSdk sdk) { this.sdk=sdk; }
  public void record(String name, double value) { sdk.sendCounter(name,value); }
}`,
  bridge: `interface Delivery { void send(String message); }
class Email implements Delivery { public void send(String m) { System.out.println("Email: "+m); } }
abstract class Alert { protected Delivery delivery; Alert(Delivery d) { delivery=d; } abstract void notify(String m); }
class UrgentAlert extends Alert {
  UrgentAlert(Delivery d) { super(d); }
  void notify(String m) { delivery.send("URGENT: "+m); }
}`,
  composite: `interface FileNode { long size(); }
class File implements FileNode { private long bytes; public long size() { return bytes; } }
class Folder implements FileNode {
  List<FileNode> children = new ArrayList<>();
  public long size() { return children.stream().mapToLong(FileNode::size).sum(); }
}`,
  decorator: `interface Coffee { double cost(); }
class Espresso implements Coffee { public double cost() { return 3.25; } }
class OatMilk implements Coffee {
  private Coffee drink; OatMilk(Coffee c) { drink=c; }
  public double cost() { return drink.cost()+0.65; }
}`,
  facade: `class ExportFacade {
  private Codec codec; private Storage storage;
  ExportFacade(Codec c, Storage s) { codec=c; storage=s; }
  void export(String file) { codec.encode(file); storage.upload(file); }
}`,
  flyweight: `record GlyphStyle(String glyph, String font) {}
class GlyphFactory {
  private Map<String,GlyphStyle> cache = new HashMap<>();
  GlyphStyle get(String glyph, String font) {
    return cache.computeIfAbsent(glyph+font, k -> new GlyphStyle(glyph,font));
  }
}`,
  proxy: `interface DocumentService { void open(String id); }
class PermissionProxy implements DocumentService {
  private DocumentService real; private String role;
  PermissionProxy(DocumentService r, String role) { real=r; this.role=role; }
  public void open(String id) { if ("editor".equals(role)) real.open(id); else throw new SecurityException(); }
}`,
  strategy: `interface PricingStrategy { double calculate(double base); }
class HolidayDiscount implements PricingStrategy {
  public double calculate(double base) { return base*0.85; }
}
class Checkout {
  private PricingStrategy strategy;
  Checkout(PricingStrategy s) { strategy=s; }
  double total(double amount) { return strategy.calculate(amount); }
}`,
  observer: `interface OrderObserver { void onPlaced(String orderId); }
class OrderService {
  private List<OrderObserver> observers = new ArrayList<>();
  void subscribe(OrderObserver o) { observers.add(o); }
  void place(String id) { observers.forEach(o -> o.onPlaced(id)); }
}`,
  command: `interface Command { void execute(); void undo(); }
class UpdateBalance implements Command {
  private Account account; private double delta;
  public void execute() { account.adjust(delta); }
  public void undo() { account.adjust(-delta); }
}`,
  state: `interface OrderState { void pay(Order order); void ship(Order order); }
class Order {
  private OrderState state;
  void setState(OrderState s) { state=s; }
  void pay() { state.pay(this); }
  void ship() { state.ship(this); }
}`,
  'chain-of-responsibility': `abstract class Filter {
  private Filter next;
  Filter linkWith(Filter n) { next=n; return n; }
  boolean check(String token) { return valid(token) && (next==null || next.check(token)); }
  abstract boolean valid(String token);
}`,
  iterator: `class PageIterator<T> implements Iterator<T> {
  private final List<T> items; private int cursor=0;
  PageIterator(List<T> items) { this.items=items; }
  public boolean hasNext() { return cursor<items.size(); }
  public T next() { return items.get(cursor++); }
}`,
  mediator: `interface Mediator { void notify(String sender, String event); }
class AuthDialogMediator implements Mediator {
  public void notify(String sender, String event) {
    if (sender.equals("LoginButton") && event.equals("click")) validateAndUpdateUi();
  }
}`,
  memento: `class Editor {
  private String text="";
  Memento save() { return new Memento(text); }
  void restore(Memento m) { text=m.snapshot; }
  static class Memento { private final String snapshot; private Memento(String s) { snapshot=s; } }
}`,
  'template-method': `abstract class EtlPipeline {
  public final void run() { extract(); transform(); load(); }
  protected abstract void extract();
  protected abstract void transform();
  protected void load() { System.out.println("Load warehouse"); }
}`,
  visitor: `interface Node { void accept(Visitor v); }
interface Visitor { void visitLiteral(Literal n); void visitBinary(Binary n); }
class Literal implements Node { public void accept(Visitor v) { v.visitLiteral(this); } }
class Binary implements Node { public void accept(Visitor v) { v.visitBinary(this); } }`,
  interpreter: `interface Expression { boolean interpret(Map<String,String> context); }
class Equals implements Expression {
  private String key, value;
  Equals(String k, String v) { key=k; value=v; }
  public boolean interpret(Map<String,String> c) { return value.equals(c.get(key)); }
}`,
};
