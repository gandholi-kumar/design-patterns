import type { Pattern } from '../data';
import type { ProjectFile } from '../components/PlaygroundFileTabs';

/**
 * Curated multi-file Java projects for GoF patterns.
 * Every Java project MUST:
 * 1. Have a `Main.java` with `public static void main(String[] args)` as the entry point.
 * 2. Ensure each `public class/interface X` is located in its own `X.java` file.
 * 3. Demonstrate realistic cross-file OOP pattern usage.
 */
export const CURATED_JAVA_PROJECTS: Record<string, ProjectFile[]> = {
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
    void setRoof(String type);
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
    public void setRoof(String type) { this.house.roofType = type; }
    @Override
    public void setPool(boolean hasPool) { this.house.hasPool = hasPool; }
    @Override
    public House getResult() { return this.house; }
}

class Director {
    public void buildLuxuryVilla(HouseBuilder b) {
        b.reset();
        b.setWalls(8);
        b.setDoors(4);
        b.setWindows(12);
        b.setRoof("Tile Terra Cotta");
        b.setPool(true);
    }

    public void buildMinimalCabin(HouseBuilder b) {
        b.reset();
        b.setWalls(4);
        b.setDoors(1);
        b.setWindows(2);
        b.setRoof("Wooden Shingle");
        b.setPool(false);
    }
}
`,
    },
  ],

  'singleton': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Singleton Pattern Demo ===");

        DatabaseConnection db1 = DatabaseConnection.getInstance();
        db1.query("SELECT * FROM users");

        DatabaseConnection db2 = DatabaseConnection.getInstance();
        db2.query("SELECT * FROM orders");

        System.out.println("Are db1 and db2 identical instances? " + (db1 == db2));
    }
}
`,
    },
    {
      id: 'db-java',
      name: 'DatabaseConnection.java',
      content: `public class DatabaseConnection {
    private static volatile DatabaseConnection instance;
    private final String connectionId;

    private DatabaseConnection() {
        this.connectionId = "POOL-" + System.currentTimeMillis();
        System.out.println("Created single DatabaseConnection instance: " + this.connectionId);
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
        System.out.println("[" + connectionId + "] Executing query: " + sql);
    }
}
`,
    },
  ],

  'observer': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Observer Pattern Demo ===");

        EventManager publisher = new EventManager();
        publisher.subscribe(new EmailAlertListener("admin@example.com"));
        publisher.subscribe(new LoggingListener());

        publisher.notify("CRITICAL_SECURITY_EVENT", "Suspicious IP detected: 192.168.1.100");
    }
}
`,
    },
    {
      id: 'events-java',
      name: 'EventManager.java',
      content: `import java.util.ArrayList;
import java.util.List;

interface EventListener {
    void update(String eventType, String message);
}

public class EventManager {
    private final List<EventListener> listeners = new ArrayList<>();

    public void subscribe(EventListener listener) {
        listeners.add(listener);
    }

    public void unsubscribe(EventListener listener) {
        listeners.remove(listener);
    }

    public void notify(String eventType, String message) {
        for (EventListener listener : listeners) {
            listener.update(eventType, message);
        }
    }
}

class EmailAlertListener implements EventListener {
    private final String email;
    public EmailAlertListener(String email) { this.email = email; }

    @Override
    public void update(String eventType, String message) {
        System.out.println("[Email to " + email + "] Event " + eventType + ": " + message);
    }
}

class LoggingListener implements EventListener {
    @Override
    public void update(String eventType, String message) {
        System.out.println("[AUDIT LOG] [" + eventType + "] " + message);
    }
}
`,
    },
  ],

  'strategy': [
    {
      id: 'main-java',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Strategy Pattern Demo ===");

        Navigator navigator = new Navigator(new RoadStrategy());
        navigator.buildRoute("Central Station", "Airport");

        System.out.println("\\nSwitching route strategy to Walking...");
        navigator.setStrategy(new WalkingStrategy());
        navigator.buildRoute("Central Station", "Museum");

        System.out.println("\\nSwitching route strategy to Public Transport...");
        navigator.setStrategy(new PublicTransitStrategy());
        navigator.buildRoute("Central Station", "Business Park");
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

    public void buildRoute(String origin, String destination) {
        strategy.buildRoute(origin, destination);
    }
}
`,
    },
    {
      id: 'strategy-java',
      name: 'RouteStrategy.java',
      content: `public interface RouteStrategy {
    void buildRoute(String origin, String destination);
}

class RoadStrategy implements RouteStrategy {
    @Override
    public void buildRoute(String origin, String destination) {
        System.out.println("[Car GPS] Highway navigation calculated from " + origin + " to " + destination + " (Time: 25 mins).");
    }
}

class WalkingStrategy implements RouteStrategy {
    @Override
    public void buildRoute(String origin, String destination) {
        System.out.println("[Pedestrian] Scenic walking path calculated from " + origin + " to " + destination + " (Time: 45 mins).");
    }
}

class PublicTransitStrategy implements RouteStrategy {
    @Override
    public void buildRoute(String origin, String destination) {
        System.out.println("[Subway/Bus] Take Metro Line 3 towards " + destination + " from " + origin + " (Time: 18 mins).");
    }
}
`,
    },
  ],
};

/**
 * Builds project files for a selected GoF pattern and language.
 */
export function buildProjectFiles(pattern: Pattern, language: 'typescript' | 'java'): ProjectFile[] {
  if (language === 'java') {
    // 1. Check curated multi-file Java catalog
    if (CURATED_JAVA_PROJECTS[pattern.id]) {
      return CURATED_JAVA_PROJECTS[pattern.id];
    }

    // 2. Fallback for other patterns:
    // Ensure `Main.java` exists with a runnable `main` method,
    // and sanitize raw class declarations to prevent filename mismatch errors.
    const rawCode = pattern.javaImplementation.code;
    const baseName = (pattern.javaImplementation.fileName || 'Pattern.java').replace(/\.java$/, '');

    // Sanitize raw code: convert non-file matching 'public class/interface' to package-private
    const sanitizedCode = rawCode.replace(/public\s+(class|interface|abstract\s+class|enum)\s+([A-Za-z0-9_]+)/g, (match, type, name) => {
      if (name === baseName) {
        return match;
      }
      return `${type} ${name}`;
    });

    return [
      {
        id: 'main-java',
        name: 'Main.java',
        isEntryPoint: true,
        content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== ${pattern.name} Pattern (Java) ===");
        System.out.println("Pattern Intent: ${pattern.intent.replace(/"/g, '\\"')}");
        System.out.println("\\nPattern components loaded successfully.");
    }
}
`,
      },
      {
        id: 'pattern-java',
        name: `${baseName}.java`,
        content: sanitizedCode,
        isEntryPoint: false,
      },
    ];
  }

  // TypeScript Project
  // If multi-file starter or single entry point:
  const rawCode = pattern.runnableCode || pattern.typeScriptImplementation.code;
  const fileName = pattern.typeScriptImplementation.fileName || 'index.ts';

  if (pattern.id === 'factory-method') {
    return [
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
    ];
  }

  return [
    {
      id: 'main-ts',
      name: fileName,
      content: rawCode,
      isEntryPoint: true,
    },
  ];
}
