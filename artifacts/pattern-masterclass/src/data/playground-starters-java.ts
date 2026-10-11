import type { ProjectFile } from '../components/PlaygroundFileTabs';

/**
 * Curated modular multi-file Java projects for all 23 GoF design patterns.
 * Every Java project MUST:
 * 1. Have a `Main.java` with `public static void main(String[] args)` as the entry point.
 * 2. Ensure each `public class/interface X` is located in its own `X.java` file.
 * 3. Demonstrate realistic cross-file OOP pattern usage.
 */
export const CURATED_JAVA_PROJECTS: Record<string, ProjectFile[]> = {
  // 1. Factory Method
  'factory-method': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Factory Method Pattern Demo ===");

        System.out.println("\\n[1] Launching Desktop GUI...");
        Dialog winDialog = new WindowsDialog();
        winDialog.render();

        System.out.println("\\n[2] Launching Web Application...");
        Dialog webDialog = new WebDialog();
        webDialog.render();
    }
}
`,
    },
    {
      id: 'dialog-java',
      name: 'Dialog.java',
      content: `public abstract class Dialog {
    /**
     * Factory Method: Subclasses override this method to create concrete products.
     */
    public abstract Button createButton();

    public void render() {
        Button okButton = createButton();
        okButton.onClick(() -> System.out.println("Dialog action: Close event triggered."));
        okButton.render();
    }
}

class WindowsDialog extends Dialog {
    @Override
    public Button createButton() {
        return new WindowsButton();
    }
}

class WebDialog extends Dialog {
    @Override
    public Button createButton() {
        return new HtmlButton();
    }
}
`,
    },
    {
      id: 'button-java',
      name: 'Button.java',
      content: `public interface Button {
    void render();
    void onClick(Runnable handler);
}

class WindowsButton implements Button {
    @Override
    public void render() {
        System.out.println("[Windows] Native win32 button rendered.");
    }

    @Override
    public void onClick(Runnable handler) {
        handler.run();
    }
}

class HtmlButton implements Button {
    @Override
    public void render() {
        System.out.println("[Web] HTML5 <button> rendered in DOM.");
    }

    @Override
    public void onClick(Runnable handler) {
        handler.run();
    }
}
`,
    },
  ],

  // 2. Abstract Factory
  'abstract-factory': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Abstract Factory Pattern Demo ===");

        System.out.println("\\n--- Testing Windows Factory Family ---");
        GUIFactory winFactory = new WinFactory();
        renderUI(winFactory);

        System.out.println("\\n--- Testing macOS Factory Family ---");
        GUIFactory macFactory = new MacFactory();
        renderUI(macFactory);
    }

    private static void renderUI(GUIFactory factory) {
        Button btn = factory.createButton();
        Checkbox chk = factory.createCheckbox();
        btn.paint();
        chk.paint();
    }
}
`,
    },
    {
      id: 'factory-java',
      name: 'GUIFactory.java',
      content: `public interface GUIFactory {
    Button createButton();
    Checkbox createCheckbox();
}

class WinFactory implements GUIFactory {
    @Override
    public Button createButton() { return new WinButton(); }
    @Override
    public Checkbox createCheckbox() { return new WinCheckbox(); }
}

class MacFactory implements GUIFactory {
    @Override
    public Button createButton() { return new MacButton(); }
    @Override
    public Checkbox createCheckbox() { return new MacCheckbox(); }
}
`,
    },
    {
      id: 'components-java',
      name: 'UIComponents.java',
      content: `interface Button {
    void paint();
}

interface Checkbox {
    void paint();
}

class WinButton implements Button {
    @Override
    public void paint() { System.out.println("[Windows] Rendered Windows style button."); }
}

class WinCheckbox implements Checkbox {
    @Override
    public void paint() { System.out.println("[Windows] Rendered Windows style checkbox."); }
}

class MacButton implements Button {
    @Override
    public void paint() { System.out.println("[macOS] Rendered Aqua rounded button."); }
}

class MacCheckbox implements Checkbox {
    @Override
    public void paint() { System.out.println("[macOS] Rendered Aqua checkbox toggle."); }
}
`,
    },
  ],

  // 3. Builder
  'builder': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Builder Pattern Demo ===");

        Director director = new Director();
        HouseBuilder builder = new ConcreteHouseBuilder();

        director.buildLuxuryVilla(builder);
        House villa = builder.getResult();
        System.out.println(villa);

        builder.reset();
        director.buildMinimalCabin(builder);
        House cabin = builder.getResult();
        System.out.println(cabin);
    }
}
`,
    },
    {
      id: 'house-java',
      name: 'House.java',
      content: `public class House {
    public int walls;
    public int doors;
    public int windows;
    public String roofType;
    public boolean hasPool;

    @Override
    public String toString() {
        return "House [walls=" + walls + ", doors=" + doors +
               ", windows=" + windows + ", roof=" + roofType +
               ", pool=" + hasPool + "]";
    }
}
`,
    },
    {
      id: 'builder-java',
      name: 'HouseBuilder.java',
      content: `public interface HouseBuilder {
    void reset();
    void setWalls(int count);
    void setDoors(int count);
    void setWindows(int count);
    void setRoof(String roofType);
    void setPool(boolean hasPool);
    House getResult();
}

class ConcreteHouseBuilder implements HouseBuilder {
    private House house = new House();

    @Override
    public void reset() { this.house = new House(); }
    @Override
    public void setWalls(int count) { this.house.walls = count; }
    @Override
    public void setDoors(int count) { this.house.doors = count; }
    @Override
    public void setWindows(int count) { this.house.windows = count; }
    @Override
    public void setRoof(String roofType) { this.house.roofType = roofType; }
    @Override
    public void setPool(boolean hasPool) { this.house.hasPool = hasPool; }
    @Override
    public House getResult() { return this.house; }
}

class Director {
    public void buildLuxuryVilla(HouseBuilder builder) {
        builder.setWalls(8);
        builder.setDoors(4);
        builder.setWindows(12);
        builder.setRoof("Spanish Terracotta");
        builder.setPool(true);
    }

    public void buildMinimalCabin(HouseBuilder builder) {
        builder.setWalls(4);
        builder.setDoors(1);
        builder.setWindows(2);
        builder.setRoof("Pine Wood Shingles");
        builder.setPool(false);
    }
}
`,
    },
  ],

  // 4. Prototype
  'prototype': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Prototype Pattern Demo ===");

        Circle circle1 = new Circle(10, 20, "Crimson", 15);
        Circle circle2 = (Circle) circle1.clone();
        circle2.x = 75; // Modify clone

        Rectangle rect1 = new Rectangle(5, 5, "Navy Blue", 40, 25);
        Rectangle rect2 = (Rectangle) rect1.clone();
        rect2.color = "Goldenrod";

        System.out.println("Original: " + circle1);
        System.out.println("Clone:    " + circle2);
        System.out.println("Original: " + rect1);
        System.out.println("Clone:    " + rect2);

        System.out.println("\\nCloned instance independence verified: " + (circle1 != circle2));
    }
}
`,
    },
    {
      id: 'shape-java',
      name: 'Shape.java',
      content: `public abstract class Shape implements Cloneable {
    public int x;
    public int y;
    public String color;

    public Shape(int x, int y, String color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }

    @Override
    public abstract Shape clone();
}
`,
    },
    {
      id: 'concrete-shapes-java',
      name: 'ConcreteShapes.java',
      content: `class Circle extends Shape {
    public int radius;

    public Circle(int x, int y, String color, int radius) {
        super(x, y, color);
        this.radius = radius;
    }

    @Override
    public Shape clone() {
        return new Circle(this.x, this.y, this.color, this.radius);
    }

    @Override
    public String toString() {
        return "Circle [x=" + x + ", y=" + y + ", color=" + color + ", radius=" + radius + "]";
    }
}

class Rectangle extends Shape {
    public int width;
    public int height;

    public Rectangle(int x, int y, String color, int width, int height) {
        super(x, y, color);
        this.width = width;
        this.height = height;
    }

    @Override
    public Shape clone() {
        return new Rectangle(this.x, this.y, this.color, this.width, this.height);
    }

    @Override
    public String toString() {
        return "Rectangle [x=" + x + ", y=" + y + ", color=" + color + ", width=" + width + ", height=" + height + "]";
    }
}
`,
    },
  ],

  // 5. Singleton
  'singleton': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Singleton Pattern Demo ===");

        DatabaseConnection db1 = DatabaseConnection.getInstance();
        db1.query("SELECT * FROM users WHERE active = true;");

        DatabaseConnection db2 = DatabaseConnection.getInstance();
        db2.query("UPDATE accounts SET balance = balance + 500 WHERE id = 42;");

        System.out.println("\\nAre db1 and db2 the exact same instance? " + (db1 == db2));
        System.out.println("Total query operations through singleton: " + db2.getQueryCount());
    }
}
`,
    },
    {
      id: 'db-java',
      name: 'DatabaseConnection.java',
      content: `public class DatabaseConnection {
    private static volatile DatabaseConnection instance;
    private int queryCount = 0;

    private DatabaseConnection() {
        System.out.println("[DatabaseConnection] Initialized master connection pool.");
    }

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

    public void query(String sql) {
        this.queryCount++;
        System.out.println("[DB Query #" + this.queryCount + "]: " + sql);
    }

    public int getQueryCount() {
        return this.queryCount;
    }
}
`,
    },
  ],

  // 6. Adapter
  'adapter': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Adapter Pattern Demo ===");

        LegacyBankService legacyService = new LegacyBankService();
        PaymentProcessor processor = new BankAdapter(legacyService);

        System.out.println("\\nClient calls modern payment interface:");
        processor.processPayment("ACC-88392", 750.50);
    }
}
`,
    },
    {
      id: 'target-java',
      name: 'PaymentProcessor.java',
      content: `public interface PaymentProcessor {
    void processPayment(String accountNumber, double amount);
}
`,
    },
    {
      id: 'adaptee-java',
      name: 'LegacyBankService.java',
      content: `public class LegacyBankService {
    public void executeXmlWireTransfer(String xmlMessage) {
        System.out.println("[LegacyBankService] Processing legacy XML payload:");
        System.out.println(xmlMessage);
        System.out.println("[LegacyBankService] Wire transfer successfully cleared.");
    }
}
`,
    },
    {
      id: 'adapter-java',
      name: 'BankAdapter.java',
      content: `public class BankAdapter implements PaymentProcessor {
    private final LegacyBankService legacyBankService;

    public BankAdapter(LegacyBankService legacyBankService) {
        this.legacyBankService = legacyBankService;
    }

    @Override
    public void processPayment(String accountNumber, double amount) {
        String xml = "<payment><account>" + accountNumber + "</account><amount>" + amount + "</amount></payment>";
        System.out.println("[BankAdapter] Adapting JSON parameters into XML wire format...");
        this.legacyBankService.executeXmlWireTransfer(xml);
    }
}
`,
    },
  ],

  // 7. Bridge
  'bridge': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Bridge Pattern Demo ===");

        System.out.println("\\n[1] Basic Remote with Smart TV:");
        Device tv = new TvDevice();
        RemoteControl basicRemote = new RemoteControl(tv);
        basicRemote.togglePower();
        basicRemote.volumeUp();

        System.out.println("\\n[2] Advanced Remote with Radio:");
        Device radio = new RadioDevice();
        AdvancedRemoteControl advancedRemote = new AdvancedRemoteControl(radio);
        advancedRemote.togglePower();
        advancedRemote.mute();
    }
}
`,
    },
    {
      id: 'device-java',
      name: 'Device.java',
      content: `public interface Device {
    boolean isEnabled();
    void enable();
    void disable();
    int getVolume();
    void setVolume(int percent);
}

class TvDevice implements Device {
    private boolean on = false;
    private int volume = 30;

    @Override public boolean isEnabled() { return on; }
    @Override public void enable() { on = true; System.out.println("[TV] Screen powered ON."); }
    @Override public void disable() { on = false; System.out.println("[TV] Screen powered OFF."); }
    @Override public int getVolume() { return volume; }
    @Override public void setVolume(int percent) {
        volume = percent;
        System.out.println("[TV] Volume set to " + volume + "%");
    }
}

class RadioDevice implements Device {
    private boolean on = false;
    private int volume = 15;

    @Override public boolean isEnabled() { return on; }
    @Override public void enable() { on = true; System.out.println("[Radio] FM Tuner ON."); }
    @Override public void disable() { on = false; System.out.println("[Radio] FM Tuner OFF."); }
    @Override public int getVolume() { return volume; }
    @Override public void setVolume(int percent) {
        volume = percent;
        System.out.println("[Radio] Volume set to " + volume + "%");
    }
}
`,
    },
    {
      id: 'remote-java',
      name: 'RemoteControl.java',
      content: `public class RemoteControl {
    protected Device device;

    public RemoteControl(Device device) {
        this.device = device;
    }

    public void togglePower() {
        if (device.isEnabled()) {
            device.disable();
        } else {
            device.enable();
        }
    }

    public void volumeUp() {
        device.setVolume(device.getVolume() + 10);
    }
}

class AdvancedRemoteControl extends RemoteControl {
    public AdvancedRemoteControl(Device device) {
        super(device);
    }

    public void mute() {
        System.out.println("[AdvancedRemote] Mute button activated.");
        device.setVolume(0);
    }
}
`,
    },
  ],

  // 8. Composite
  'composite': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Composite Pattern Demo ===");

        FolderItem root = new FolderItem("root");
        FolderItem docs = new FolderItem("Documents");
        FolderItem images = new FolderItem("Images");

        docs.add(new FileItem("resume.pdf", 120));
        docs.add(new FileItem("budget.xlsx", 350));
        images.add(new FileItem("avatar.png", 800));

        root.add(docs);
        root.add(images);
        root.add(new FileItem("config.json", 15));

        System.out.println("\\nTree structure:");
        root.print("");

        System.out.println("\\nTotal size: " + root.getSize() + " KB");
    }
}
`,
    },
    {
      id: 'fs-item-java',
      name: 'FileSystemItem.java',
      content: `public interface FileSystemItem {
    String getName();
    int getSize();
    void print(String indent);
}
`,
    },
    {
      id: 'fs-nodes-java',
      name: 'FileSystemNodes.java',
      content: `import java.util.ArrayList;
import java.util.List;

class FileItem implements FileSystemItem {
    private final String name;
    private final int sizeKb;

    public FileItem(String name, int sizeKb) {
        this.name = name;
        this.sizeKb = sizeKb;
    }

    @Override public String getName() { return name; }
    @Override public int getSize() { return sizeKb; }
    @Override public void print(String indent) {
        System.out.println(indent + "📄 " + name + " (" + sizeKb + " KB)");
    }
}

class FolderItem implements FileSystemItem {
    private final String name;
    private final List<FileSystemItem> children = new ArrayList<>();

    public FolderItem(String name) {
        this.name = name;
    }

    public void add(FileSystemItem item) {
        children.add(item);
    }

    @Override public String getName() { return name; }

    @Override
    public int getSize() {
        int sum = 0;
        for (FileSystemItem child : children) {
            sum += child.getSize();
        }
        return sum;
    }

    @Override
    public void print(String indent) {
        System.out.println(indent + "📁 [" + name + "/]");
        for (FileSystemItem child : children) {
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
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Decorator Pattern Demo ===");

        Coffee coffee = new SimpleCoffee();
        System.out.printf("Order: %s = $%.2f%n", coffee.getDescription(), coffee.getCost());

        coffee = new MilkDecorator(coffee);
        System.out.printf("Order: %s = $%.2f%n", coffee.getDescription(), coffee.getCost());

        coffee = new SugarDecorator(coffee);
        System.out.printf("Order: %s = $%.2f%n", coffee.getDescription(), coffee.getCost());
    }
}
`,
    },
    {
      id: 'coffee-java',
      name: 'Coffee.java',
      content: `public interface Coffee {
    double getCost();
    String getDescription();
}

class SimpleCoffee implements Coffee {
    @Override public double getCost() { return 2.50; }
    @Override public String getDescription() { return "Espresso Roast"; }
}
`,
    },
    {
      id: 'coffee-decorators-java',
      name: 'CoffeeDecorators.java',
      content: `abstract class CoffeeDecorator implements Coffee {
    protected final Coffee decoratedCoffee;

    public CoffeeDecorator(Coffee decoratedCoffee) {
        this.decoratedCoffee = decoratedCoffee;
    }

    @Override public double getCost() { return decoratedCoffee.getCost(); }
    @Override public String getDescription() { return decoratedCoffee.getDescription(); }
}

class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee coffee) { super(coffee); }
    @Override public double getCost() { return super.getCost() + 0.75; }
    @Override public String getDescription() { return super.getDescription() + " + Steamed Oat Milk"; }
}

class SugarDecorator extends CoffeeDecorator {
    public SugarDecorator(Coffee coffee) { super(coffee); }
    @Override public double getCost() { return super.getCost() + 0.25; }
    @Override public String getDescription() { return super.getDescription() + " + Organic Raw Sugar"; }
}
`,
    },
  ],

  // 10. Facade
  'facade': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Facade Pattern Demo ===");

        HomeTheaterFacade theater = new HomeTheaterFacade();

        System.out.println("\\n--- Movie Night Starting ---");
        theater.watchMovie("Inception");

        System.out.println("\\n--- Movie Night Ending ---");
        theater.endMovie();
    }
}
`,
    },
    {
      id: 'facade-java',
      name: 'HomeTheaterFacade.java',
      content: `public class HomeTheaterFacade {
    private final Amplifier amp = new Amplifier();
    private final Projector projector = new Projector();
    private final TheaterLights lights = new TheaterLights();

    public void watchMovie(String movie) {
        System.out.println("[Facade] Setting cinema mode for \\"" + movie + "\\":");
        lights.dim(10);
        projector.on();
        projector.wideScreenMode();
        amp.on();
        amp.setVolume(20);
        System.out.println("[Facade] Movie playing now!");
    }

    public void endMovie() {
        System.out.println("[Facade] Shutting down home cinema...");
        amp.off();
        projector.off();
        lights.on();
    }
}
`,
    },
    {
      id: 'subsystems-java',
      name: 'Subsystems.java',
      content: `class Amplifier {
    public void on() { System.out.println("[Amplifier] Surround 7.1 ON."); }
    public void setVolume(int v) { System.out.println("[Amplifier] Volume set to " + v); }
    public void off() { System.out.println("[Amplifier] Audio OFF."); }
}

class Projector {
    public void on() { System.out.println("[Projector] Laser 4K ON."); }
    public void wideScreenMode() { System.out.println("[Projector] Aspect ratio 2.39:1 widescreen enabled."); }
    public void off() { System.out.println("[Projector] Laser OFF."); }
}

class TheaterLights {
    public void dim(int percent) { System.out.println("[TheaterLights] Ambient lights dimmed to " + percent + "%"); }
    public void on() { System.out.println("[TheaterLights] Lights restored to 100%"); }
}
`,
    },
  ],

  // 11. Flyweight
  'flyweight': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Flyweight Pattern Demo ===");

        TreeTypeFactory factory = new TreeTypeFactory();
        List<Tree> forest = new ArrayList<>();

        forest.add(new Tree(10, 20, factory.getTreeType("Oak", "DarkGreen", "Rough")));
        forest.add(new Tree(15, 25, factory.getTreeType("Oak", "DarkGreen", "Rough")));
        forest.add(new Tree(30, 40, factory.getTreeType("Pine", "Emerald", "Needle")));
        forest.add(new Tree(35, 45, factory.getTreeType("Pine", "Emerald", "Needle")));
        forest.add(new Tree(50, 60, factory.getTreeType("Oak", "DarkGreen", "Rough")));

        System.out.println("\\nRendering forest trees:");
        for (Tree t : forest) {
            t.draw();
        }

        System.out.println("\\nPool count: " + factory.getPoolCount() + " intrinsic types shared among " + forest.size() + " trees.");
    }
}
`,
    },
    {
      id: 'tree-type-java',
      name: 'TreeType.java',
      content: `import java.util.HashMap;
import java.util.Map;

public class TreeType {
    public final String name;
    public final String color;
    public final String texture;

    public TreeType(String name, String color, String texture) {
        this.name = name;
        this.color = color;
        this.texture = texture;
    }

    public void draw(int x, int y) {
        System.out.println("[TreeType: " + name + "] Rendered at (" + x + ", " + y + ") with color " + color);
    }
}

class TreeTypeFactory {
    private final Map<String, TreeType> cache = new HashMap<>();

    public TreeType getTreeType(String name, String color, String texture) {
        String key = name + "_" + color + "_" + texture;
        if (!cache.containsKey(key)) {
            cache.put(key, new TreeType(name, color, texture));
            System.out.println("[Factory] Created new shared TreeType flyweight: " + name);
        }
        return cache.get(key);
    }

    public int getPoolCount() {
        return cache.size();
    }
}
`,
    },
    {
      id: 'tree-java',
      name: 'Tree.java',
      content: `public class Tree {
    public final int x;
    public final int y;
    private final TreeType type;

    public Tree(int x, int y, TreeType type) {
        this.x = x;
        this.y = y;
        this.type = type;
    }

    public void draw() {
        type.draw(x, y);
    }
}
`,
    },
  ],

  // 12. Proxy
  'proxy': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Proxy Pattern Demo ===");

        VideoService realService = new RealVideoService();
        VideoService proxy = new CachingVideoProxy(realService);

        System.out.println("\\n[1] First request (Cache miss):");
        System.out.println(proxy.getVideo("design-patterns-101"));

        System.out.println("\\n[2] Second request (Cache hit):");
        System.out.println(proxy.getVideo("design-patterns-101"));
    }
}
`,
    },
    {
      id: 'video-service-java',
      name: 'VideoService.java',
      content: `public interface VideoService {
    String getVideo(String videoId);
}

class RealVideoService implements VideoService {
    @Override
    public String getVideo(String videoId) {
        System.out.println("[RealVideoService] Fetching heavy stream for \\"" + videoId + "\\" over network...");
        return "[Video Data for " + videoId + "]";
    }
}
`,
    },
    {
      id: 'caching-proxy-java',
      name: 'CachingVideoProxy.java',
      content: `import java.util.HashMap;
import java.util.Map;

public class CachingVideoProxy implements VideoService {
    private final VideoService realService;
    private final Map<String, String> cache = new HashMap<>();

    public CachingVideoProxy(VideoService realService) {
        this.realService = realService;
    }

    @Override
    public String getVideo(String videoId) {
        if (cache.containsKey(videoId)) {
            System.out.println("[Proxy] Cache hit for \\"" + videoId + "\\". Bypassing remote service.");
            return cache.get(videoId);
        }

        String data = realService.getVideo(videoId);
        cache.put(videoId, data);
        return data;
    }
}
`,
    },
  ],

  // 13. Chain of Responsibility
  'chain-of-responsibility': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Chain of Responsibility Pattern Demo ===");

        Handler auth = new AuthHandler();
        Handler rateLimit = new RateLimitHandler();
        Handler validation = new ValidationHandler();

        auth.setNext(rateLimit).setNext(validation);

        System.out.println("\\n[1] Processing valid request:");
        boolean result1 = auth.handle(new Request("SECRET_KEY", "Body Payload", 2));
        System.out.println("Result: " + result1);

        System.out.println("\\n[2] Processing invalid request (rate limited):");
        boolean result2 = auth.handle(new Request("SECRET_KEY", "Body Payload", 10));
        System.out.println("Result: " + result2);
    }
}
`,
    },
    {
      id: 'handler-java',
      name: 'Handler.java',
      content: `class Request {
    public String token;
    public String payload;
    public int requestCount;

    public Request(String token, String payload, int requestCount) {
        this.token = token;
        this.payload = payload;
        this.requestCount = requestCount;
    }
}

public abstract class Handler {
    private Handler next;

    public Handler setNext(Handler next) {
        this.next = next;
        return next;
    }

    public boolean handle(Request req) {
        if (next != null) {
            return next.handle(req);
        }
        return true;
    }
}
`,
    },
    {
      id: 'middleware-handlers-java',
      name: 'MiddlewareHandlers.java',
      content: `class AuthHandler extends Handler {
    @Override
    public boolean handle(Request req) {
        if (!"SECRET_KEY".equals(req.token)) {
            System.out.println("[AuthHandler] ✕ Authentication failed.");
            return false;
        }
        System.out.println("[AuthHandler] ✓ User token verified.");
        return super.handle(req);
    }
}

class RateLimitHandler extends Handler {
    @Override
    public boolean handle(Request req) {
        if (req.requestCount > 5) {
            System.out.println("[RateLimitHandler] ✕ Rate limit exceeded.");
            return false;
        }
        System.out.println("[RateLimitHandler] ✓ Rate limit quota OK.");
        return super.handle(req);
    }
}

class ValidationHandler extends Handler {
    @Override
    public boolean handle(Request req) {
        if (req.payload == null || req.payload.isEmpty()) {
            System.out.println("[ValidationHandler] ✕ Payload empty.");
            return false;
        }
        System.out.println("[ValidationHandler] ✓ Payload verified.");
        return super.handle(req);
    }
}
`,
    },
  ],

  // 14. Command
  'command': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Command Pattern Demo ===");

        Light livingRoom = new Light();
        RemoteInvoker remote = new RemoteInvoker();

        Command turnOn = new LightOnCommand(livingRoom);
        Command dim = new DimLightCommand(livingRoom);

        System.out.println("\\n[1] Executing Turn ON:");
        remote.executeCommand(turnOn);

        System.out.println("\\n[2] Executing Dim Command:");
        remote.executeCommand(dim);

        System.out.println("\\n[3] Undoing last command:");
        remote.undo();

        System.out.println("\\n[4] Undoing again:");
        remote.undo();
    }
}
`,
    },
    {
      id: 'command-java',
      name: 'Command.java',
      content: `import java.util.Stack;

public interface Command {
    void execute();
    void undo();
}

class RemoteInvoker {
    private final Stack<Command> history = new Stack<>();

    public void executeCommand(Command cmd) {
        cmd.execute();
        history.push(cmd);
    }

    public void undo() {
        if (!history.isEmpty()) {
            Command cmd = history.pop();
            System.out.println("[Invoker] Reversing command:");
            cmd.undo();
        } else {
            System.out.println("[Invoker] Nothing to undo.");
        }
    }
}
`,
    },
    {
      id: 'device-commands-java',
      name: 'DeviceCommands.java',
      content: `class Light {
    public void turnOn() { System.out.println("[Light] ON at 100% brightness."); }
    public void turnOff() { System.out.println("[Light] OFF completely."); }
    public void dim() { System.out.println("[Light] Dimmed to 30% ambient glow."); }
}

class LightOnCommand implements Command {
    private final Light light;
    public LightOnCommand(Light light) { this.light = light; }
    @Override public void execute() { light.turnOn(); }
    @Override public void undo() { light.turnOff(); }
}

class DimLightCommand implements Command {
    private final Light light;
    public DimLightCommand(Light light) { this.light = light; }
    @Override public void execute() { light.dim(); }
    @Override public void undo() { light.turnOn(); }
}
`,
    },
  ],

  // 15. Iterator
  'iterator': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Iterator Pattern Demo ===");

        NotificationFeed feed = new NotificationFeed();
        feed.add("Alert: High CPU load on node 3");
        feed.add("Notice: Security certificate renewed");
        feed.add("Info: Nightly backup finished");

        System.out.println("\\nIterating notifications sequentially:");
        CustomIterator<String> it = feed.createIterator();
        while (it.hasNext()) {
            System.out.println("› " + it.next());
        }
    }
}
`,
    },
    {
      id: 'custom-iterator-java',
      name: 'CustomIterator.java',
      content: `public interface CustomIterator<T> {
    boolean hasNext();
    T next();
}

interface IterableCollection<T> {
    CustomIterator<T> createIterator();
}
`,
    },
    {
      id: 'notification-feed-java',
      name: 'NotificationFeed.java',
      content: `import java.util.ArrayList;
import java.util.List;

public class NotificationFeed implements IterableCollection<String> {
    private final List<String> notifications = new ArrayList<>();

    public void add(String note) {
        notifications.add(note);
    }

    @Override
    public CustomIterator<String> createIterator() {
        return new CustomIterator<String>() {
            private int index = 0;

            @Override
            public boolean hasNext() {
                return index < notifications.size();
            }

            @Override
            public String next() {
                return notifications.get(index++);
            }
        };
    }
}
`,
    },
  ],

  // 16. Mediator
  'mediator': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Mediator Pattern Demo ===");

        ControlTower tower = new ControlTower();
        Aircraft boeing = new CommercialFlight("Boeing 787", tower);
        Aircraft airbus = new CargoFlight("Airbus A330F", tower);

        tower.register(boeing);
        tower.register(airbus);

        System.out.println("\\n[1] Boeing requests clearance:");
        boeing.send("Approaching runway 09R. Request landing clearance.");

        System.out.println("\\n[2] Airbus responds:");
        airbus.send("Hold position! Runway is occupied.");
    }
}
`,
    },
    {
      id: 'mediator-java',
      name: 'AirTrafficMediator.java',
      content: `import java.util.ArrayList;
import java.util.List;

public interface AirTrafficMediator {
    void sendMessage(String message, Aircraft sender);
}

class ControlTower implements AirTrafficMediator {
    private final List<Aircraft> aircraftList = new ArrayList<>();

    public void register(Aircraft craft) {
        aircraftList.add(craft);
    }

    @Override
    public void sendMessage(String message, Aircraft sender) {
        for (Aircraft craft : aircraftList) {
            if (craft != sender) {
                craft.receive(message, sender.callsign);
            }
        }
    }
}
`,
    },
    {
      id: 'aircraft-java',
      name: 'Aircraft.java',
      content: `public abstract class Aircraft {
    public final String callsign;
    protected final AirTrafficMediator tower;

    public Aircraft(String callsign, AirTrafficMediator tower) {
        this.callsign = callsign;
        this.tower = tower;
    }

    public abstract void send(String msg);
    public abstract void receive(String msg, String from);
}

class CommercialFlight extends Aircraft {
    public CommercialFlight(String callsign, AirTrafficMediator tower) { super(callsign, tower); }
    @Override public void send(String msg) {
        System.out.println("[" + callsign + "] Transmitting: \\"" + msg + "\\"");
        tower.sendMessage(msg, this);
    }
    @Override public void receive(String msg, String from) {
        System.out.println("[" + callsign + "] Received from " + from + ": \\"" + msg + "\\"");
    }
}

class CargoFlight extends Aircraft {
    public CargoFlight(String callsign, AirTrafficMediator tower) { super(callsign, tower); }
    @Override public void send(String msg) {
        System.out.println("[" + callsign + "] Transmitting: \\"" + msg + "\\"");
        tower.sendMessage(msg, this);
    }
    @Override public void receive(String msg, String from) {
        System.out.println("[" + callsign + "] Received from " + from + ": \\"" + msg + "\\"");
    }
}
`,
    },
  ],

  // 17. Memento
  'memento': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Memento Pattern Demo ===");

        TextEditor editor = new TextEditor();
        HistoryCaretaker history = new HistoryCaretaker();

        editor.type("First sentence.");
        history.push(editor.save());

        editor.type(" Second sentence.");
        history.push(editor.save());

        editor.type(" Unwanted accidental edit!");
        System.out.println("Current text: " + editor.getContent());

        System.out.println("\\n[1] Undoing last change:");
        editor.restore(history.pop());
        System.out.println("Text after Undo: " + editor.getContent());

        System.out.println("\\n[2] Undoing to first draft:");
        editor.restore(history.pop());
        System.out.println("Text after second Undo: " + editor.getContent());
    }
}
`,
    },
    {
      id: 'text-editor-java',
      name: 'TextEditor.java',
      content: `public class TextEditor {
    private String content = "";

    public void type(String words) {
        this.content += words;
    }

    public String getContent() {
        return this.content;
    }

    public EditorMemento save() {
        return new EditorMemento(this.content);
    }

    public void restore(EditorMemento memento) {
        if (memento != null) {
            this.content = memento.getState();
        }
    }
}
`,
    },
    {
      id: 'editor-memento-java',
      name: 'EditorMemento.java',
      content: `import java.util.Stack;

public class EditorMemento {
    private final String state;

    public EditorMemento(String state) {
        this.state = state;
    }

    public String getState() {
        return state;
    }
}

class HistoryCaretaker {
    private final Stack<EditorMemento> history = new Stack<>();

    public void push(EditorMemento memento) {
        history.push(memento);
    }

    public EditorMemento pop() {
        return history.isEmpty() ? null : history.pop();
    }
}
`,
    },
  ],

  // 18. Observer
  'observer': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Observer Pattern Demo ===");

        EventManager newsPublisher = new EventManager();
        EventListener alice = new EmailListener("alice@example.com");
        EventListener bob = new SmsListener("+1-555-0199");

        newsPublisher.subscribe(alice);
        newsPublisher.subscribe(bob);

        System.out.println("\\n--- Notification Event 1 ---");
        newsPublisher.notify("Major software update v2.0 deployed!");

        newsPublisher.unsubscribe(bob);

        System.out.println("\\n--- Notification Event 2 ---");
        newsPublisher.notify("Scheduled maintenance tonight at 02:00 UTC.");
    }
}
`,
    },
    {
      id: 'event-manager-java',
      name: 'EventManager.java',
      content: `import java.util.ArrayList;
import java.util.List;

public class EventManager {
    private final List<EventListener> listeners = new ArrayList<>();

    public void subscribe(EventListener listener) {
        listeners.add(listener);
    }

    public void unsubscribe(EventListener listener) {
        listeners.remove(listener);
    }

    public void notify(String eventData) {
        for (EventListener listener : listeners) {
            listener.update(eventData);
        }
    }
}
`,
    },
    {
      id: 'event-listeners-java',
      name: 'EventListeners.java',
      content: `interface EventListener {
    void update(String data);
}

class EmailListener implements EventListener {
    private final String email;
    public EmailListener(String email) { this.email = email; }
    @Override public void update(String data) {
        System.out.println("[Email to " + email + "]: " + data);
    }
}

class SmsListener implements EventListener {
    private final String phone;
    public SmsListener(String phone) { this.phone = phone; }
    @Override public void update(String data) {
        System.out.println("[SMS to " + phone + "]: " + data);
    }
}
`,
    },
  ],

  // 19. State
  'state': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== State Pattern Demo ===");

        VendingMachine machine = new VendingMachine();

        System.out.println("\\n[1] Insert coin and select item:");
        machine.insertCoin();
        machine.selectItem();

        System.out.println("\\n[2] Attempt to select without coin:");
        machine.selectItem();
    }
}
`,
    },
    {
      id: 'vending-state-java',
      name: 'VendingState.java',
      content: `public interface VendingState {
    void insertCoin(VendingMachine machine);
    void selectItem(VendingMachine machine);
}

class ReadyState implements VendingState {
    @Override
    public void insertCoin(VendingMachine machine) {
        System.out.println("[ReadyState] Coin inserted successfully.");
        machine.setState(new HasCoinState());
    }

    @Override
    public void selectItem(VendingMachine machine) {
        System.out.println("[ReadyState] Please insert a coin first.");
    }
}

class HasCoinState implements VendingState {
    @Override
    public void insertCoin(VendingMachine machine) {
        System.out.println("[HasCoinState] Coin already present.");
    }

    @Override
    public void selectItem(VendingMachine machine) {
        System.out.println("[HasCoinState] Dispensing beverage. Thank you!");
        machine.setState(new ReadyState());
    }
}
`,
    },
    {
      id: 'vending-machine-java',
      name: 'VendingMachine.java',
      content: `public class VendingMachine {
    private VendingState state = new ReadyState();

    public void setState(VendingState state) {
        this.state = state;
    }

    public void insertCoin() {
        state.insertCoin(this);
    }

    public void selectItem() {
        state.selectItem(this);
    }
}
`,
    },
  ],

  // 20. Strategy
  'strategy': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Strategy Pattern Demo ===");

        Navigator nav = new Navigator(new DrivingStrategy());
        nav.planRoute("Downtown", "International Airport");

        nav.setStrategy(new PublicTransitStrategy());
        nav.planRoute("Downtown", "International Airport");

        nav.setStrategy(new WalkingStrategy());
        nav.planRoute("Park Plaza", "Museum");
    }
}
`,
    },
    {
      id: 'route-strategy-java',
      name: 'RouteStrategy.java',
      content: `public interface RouteStrategy {
    void buildRoute(String start, String end);
}

class DrivingStrategy implements RouteStrategy {
    @Override public void buildRoute(String start, String end) {
        System.out.println("[Driving] Highway route from \\"" + start + "\\" to \\"" + end + "\\": 22 mins.");
    }
}

class PublicTransitStrategy implements RouteStrategy {
    @Override public void buildRoute(String start, String end) {
        System.out.println("[Transit] Metro Line A + Bus 12 from \\"" + start + "\\" to \\"" + end + "\\": 35 mins.");
    }
}

class WalkingStrategy implements RouteStrategy {
    @Override public void buildRoute(String start, String end) {
        System.out.println("[Walking] Pedestrian path from \\"" + start + "\\" to \\"" + end + "\\": 14 mins.");
    }
}
`,
    },
    {
      id: 'navigator-java',
      name: 'Navigator.java',
      content: `public class Navigator {
    private RouteStrategy strategy;

    public Navigator(RouteStrategy strategy) {
        this.strategy = strategy;
    }

    public void setStrategy(RouteStrategy strategy) {
        this.strategy = strategy;
    }

    public void planRoute(String start, String end) {
        strategy.buildRoute(start, end);
    }
}
`,
    },
  ],

  // 21. Template Method
  'template-method': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Template Method Pattern Demo ===");

        System.out.println("\\n[1] Mining PDF File:");
        DataMiner pdfMiner = new PdfDataMiner();
        pdfMiner.mine("quarterly-report.pdf");

        System.out.println("\\n[2] Mining CSV File:");
        DataMiner csvMiner = new CsvDataMiner();
        csvMiner.mine("user-analytics.csv");
    }
}
`,
    },
    {
      id: 'data-miner-java',
      name: 'DataMiner.java',
      content: `public abstract class DataMiner {
    // Template Method
    public void mine(String path) {
        openFile(path);
        String raw = extractData();
        String[] parsed = parseData(raw);
        analyze(parsed);
        closeFile(path);
    }

    protected void openFile(String path) {
        System.out.println("[BaseMiner] Opened file: " + path);
    }

    protected abstract String extractData();
    protected abstract String[] parseData(String raw);

    protected void analyze(String[] data) {
        System.out.println("[BaseMiner] Analyzed " + data.length + " data points.");
    }

    protected void closeFile(String path) {
        System.out.println("[BaseMiner] Closed file: " + path);
    }
}
`,
    },
    {
      id: 'concrete-miners-java',
      name: 'ConcreteMiners.java',
      content: `class PdfDataMiner extends DataMiner {
    @Override protected String extractData() {
        System.out.println("[PdfMiner] Extracting text streams via OCR...");
        return "PAGE1,PAGE2,PAGE3";
    }

    @Override protected String[] parseData(String raw) {
        System.out.println("[PdfMiner] Parsing font dictionaries...");
        return raw.split(",");
    }
}

class CsvDataMiner extends DataMiner {
    @Override protected String extractData() {
        System.out.println("[CsvMiner] Reading comma-separated row buffer...");
        return "r1,r2,r3,r4";
    }

    @Override protected String[] parseData(String raw) {
        System.out.println("[CsvMiner] Tokenizing table rows...");
        return raw.split(",");
    }
}
`,
    },
  ],

  // 22. Visitor
  'visitor': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Visitor Pattern Demo ===");

        DocumentElement[] elements = new DocumentElement[] {
            new HeadingElement("GoF Masterclass", 1),
            new ParagraphElement("A deep dive into clean design patterns.")
        };

        System.out.println("\\n--- Exporting to JSON ---");
        DocumentVisitor jsonVisitor = new JsonExportVisitor();
        for (DocumentElement el : elements) {
            el.accept(jsonVisitor);
        }

        System.out.println("\\n--- Exporting to XML ---");
        DocumentVisitor xmlVisitor = new XmlExportVisitor();
        for (DocumentElement el : elements) {
            el.accept(xmlVisitor);
        }
    }
}
`,
    },
    {
      id: 'doc-visitor-java',
      name: 'DocumentVisitor.java',
      content: `public interface DocumentVisitor {
    void visitHeading(HeadingElement h);
    void visitParagraph(ParagraphElement p);
}

class JsonExportVisitor implements DocumentVisitor {
    @Override public void visitHeading(HeadingElement h) {
        System.out.println("JSON: { \\"type\\": \\"heading\\", \\"level\\": " + h.level + ", \\"text\\": \\"" + h.text + "\\" }");
    }
    @Override public void visitParagraph(ParagraphElement p) {
        System.out.println("JSON: { \\"type\\": \\"paragraph\\", \\"content\\": \\"" + p.content + "\\" }");
    }
}

class XmlExportVisitor implements DocumentVisitor {
    @Override public void visitHeading(HeadingElement h) {
        System.out.println("XML:  <h" + h.level + ">" + h.text + "</h" + h.level + ">");
    }
    @Override public void visitParagraph(ParagraphElement p) {
        System.out.println("XML:  <p>" + p.content + "</p>");
    }
}
`,
    },
    {
      id: 'doc-elements-java',
      name: 'DocumentElements.java',
      content: `public interface DocumentElement {
    void accept(DocumentVisitor visitor);
}

class HeadingElement implements DocumentElement {
    public final String text;
    public final int level;
    public HeadingElement(String text, int level) { this.text = text; this.level = level; }
    @Override public void accept(DocumentVisitor visitor) { visitor.visitHeading(this); }
}

class ParagraphElement implements DocumentElement {
    public final String content;
    public ParagraphElement(String content) { this.content = content; }
    @Override public void accept(DocumentVisitor visitor) { visitor.visitParagraph(this); }
}
`,
    },
  ],

  // 23. Interpreter
  'interpreter': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Interpreter Pattern Demo ===");

        // (10 + 5) - (2 + 3) = 15 - 5 = 10
        Expression expr = new SubtractExpression(
            new AddExpression(new NumberExpression(10), new NumberExpression(5)),
            new AddExpression(new NumberExpression(2), new NumberExpression(3))
        );

        System.out.println("Expression: (10 + 5) - (2 + 3)");
        System.out.println("Evaluated Result: " + expr.interpret());
    }
}
`,
    },
    {
      id: 'expression-java',
      name: 'Expression.java',
      content: `public interface Expression {
    int interpret();
}
`,
    },
    {
      id: 'math-expressions-java',
      name: 'MathExpressions.java',
      content: `class NumberExpression implements Expression {
    private final int value;
    public NumberExpression(int value) { this.value = value; }
    @Override public int interpret() { return value; }
}

class AddExpression implements Expression {
    private final Expression left;
    private final Expression right;
    public AddExpression(Expression left, Expression right) { this.left = left; this.right = right; }
    @Override public int interpret() { return left.interpret() + right.interpret(); }
}

class SubtractExpression implements Expression {
    private final Expression left;
    private final Expression right;
    public SubtractExpression(Expression left, Expression right) { this.left = left; this.right = right; }
    @Override public int interpret() { return left.interpret() - right.interpret(); }
}
`,
    },
  ],
};
