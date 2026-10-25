import type { ProjectFile } from '../components/PlaygroundFileTabs';
import { CANONICAL_DATA } from './canonical-data';
import type { Pattern } from '../data';

/**
 * Splits a single-file TypeScript pattern into a modular multi-file project:
 * - `index.ts` (Entry Point, Tab 0): imports pattern components and executes client demonstration.
 * - `${moduleBaseName}.ts` (Module, Tab 1): exports pattern classes, interfaces, and methods.
 */
function splitTsPattern(rawCode: string, moduleBaseName: string) {
  const lines = rawCode.split('\n');
  const declLines: string[] = [];
  const clientLines: string[] = [];

  let braceDepth = 0;
  let inBlockComment = false;
  let inTemplateString = false;
  let isDeclBlock = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Only consider switching to client block when at top level (braceDepth === 0)
    if (isDeclBlock && braceDepth === 0 && declLines.length > 0) {
      const isClientComment = /^\/\/\s*(?:Client|Usage|Execution|Test|Demo|Runtime|Orchestration|Scenario|Consumer|Example|Trigger)/i.test(trimmed);
      const isTopLevelStatement =
        /^(?:const|let|var)\s+[A-Za-z0-9_$]+\s*(?::\s*[^=]+)?\s*=/i.test(trimmed) ||
        /^(?:await\s+)?(?:[A-Za-z0-9_$]+\s*\.|\(async|renderUI\(|run\(|main\(|bootstrap\(|new\s+[A-Z])/i.test(trimmed);

      const isDeclStart = /^(?:export\s+)?(?:abstract\s+class|class|interface|type|enum|function)\b/.test(trimmed);

      if ((isClientComment || isTopLevelStatement) && !isDeclStart) {
        isDeclBlock = false;
      }
    }

    if (isDeclBlock) {
      declLines.push(line);
      // Track brace depth
      for (let c = 0; c < line.length; c++) {
        const ch = line[c];
        const next = line[c + 1];

        if (inBlockComment) {
          if (ch === '*' && next === '/') {
            inBlockComment = false;
            c++;
          }
          continue;
        }

        if (ch === '/' && next === '*') {
          inBlockComment = true;
          c++;
          continue;
        }

        if (ch === '/' && next === '/') {
          break;
        }

        if (ch === '`') {
          inTemplateString = !inTemplateString;
          continue;
        }

        if (inTemplateString) continue;

        if (ch === '"' || ch === "'") {
          const quote = ch;
          c++;
          while (c < line.length && line[c] !== quote) {
            if (line[c] === '\\') c++;
            c++;
          }
          continue;
        }

        if (ch === '{') braceDepth++;
        else if (ch === '}') braceDepth = Math.max(0, braceDepth - 1);
      }
    } else {
      clientLines.push(line);
    }
  }

  // Prepend export only to top-level declarations in declLines
  let currentBrace = 0;
  const exportedDeclLines = declLines.map((line) => {
    const trimmed = line.trim();
    const isTopLevel = currentBrace === 0;

    for (let c = 0; c < line.length; c++) {
      if (line[c] === '{') currentBrace++;
      else if (line[c] === '}') currentBrace = Math.max(0, currentBrace - 1);
    }

    if (isTopLevel && /^(?:abstract\s+class|class|interface|type|enum|function)\b/.test(trimmed)) {
      return line.replace(/^(\s*)(abstract\s+class|class|interface|type|enum|function)\b/, '$1export $2');
    }
    return line;
  });

  const moduleContent = exportedDeclLines.join('\n');
  const matches = [...moduleContent.matchAll(/export\s+(?:abstract\s+class|class|interface|type|enum|function)\s+([A-Za-z0-9_]+)/g)];
  const exportedNames = Array.from(new Set(matches.map((m) => m[1]))).join(',\n  ');

  const clientContent = clientLines.join('\n').trim();
  const indexContent = clientContent
    ? `import {\n  ${exportedNames}\n} from './${moduleBaseName}';\n\n${clientContent}\n`
    : `import {\n  ${exportedNames}\n} from './${moduleBaseName}';\n\nconsole.log("=== ${moduleBaseName} Loaded ===");\n`;

  return {
    indexContent,
    moduleContent,
  };
}

const CANONICAL_JAVA_MAIN_RUNNERS: Record<string, string> = {
  'factory-method': `        System.out.println("=== Factory Method Pattern (Canonical) ===");
        Dialog windowsDialog = new Dialog() {
            @Override
            public Button createButton() {
                return new WindowsButton();
            }
        };
        windowsDialog.render();

        Dialog htmlDialog = new Dialog() {
            @Override
            public Button createButton() {
                return new HtmlButton();
            }
        };
        htmlDialog.render();`,

  'abstract-factory': `        System.out.println("=== Abstract Factory Pattern (Canonical) ===");
        GUIFactory factory = new WinFactory();
        Button button = factory.createButton();
        Checkbox checkbox = factory.createCheckbox();
        button.paint();
        checkbox.paint();`,

  'builder': `        System.out.println("=== Builder Pattern (Canonical) ===");
        House house = new House.Builder()
            .windows(6)
            .pool(true)
            .build();
        System.out.println("House built successfully with custom windows & pool: " + house);`,

  'prototype': `        System.out.println("=== Prototype Pattern (Canonical) ===");
        Circle circle1 = new Circle(null);
        circle1.x = 10;
        circle1.y = 20;
        circle1.radius = 15;

        Circle circle2 = (Circle) circle1.clone();
        System.out.println("Cloned Circle: x=" + circle2.x + ", y=" + circle2.y + ", radius=" + circle2.radius);`,

  'singleton': `        System.out.println("=== Singleton Pattern (Canonical) ===");
        DatabaseConnection conn1 = DatabaseConnection.getInstance();
        DatabaseConnection conn2 = DatabaseConnection.getInstance();
        System.out.println("Both database connection references identical: " + (conn1 == conn2));`,

  'adapter': `        System.out.println("=== Adapter Pattern (Canonical) ===");
        RoundHole hole = new RoundHole(5.0);
        RoundPeg roundPeg = new RoundPeg(5.0);
        System.out.println("Round peg fits hole: " + hole.fits(roundPeg));

        SquarePeg smallSquarePeg = new SquarePeg(5.0);
        SquarePeg largeSquarePeg = new SquarePeg(10.0);
        SquarePegAdapter smallAdapter = new SquarePegAdapter(smallSquarePeg);
        SquarePegAdapter largeAdapter = new SquarePegAdapter(largeSquarePeg);
        System.out.println("Small square peg (adapted) fits hole: " + hole.fits(smallAdapter));
        System.out.println("Large square peg (adapted) fits hole: " + hole.fits(largeAdapter));`,

  'bridge': `        System.out.println("=== Bridge Pattern (Canonical) ===");
        Device tv = new Device() {
            private boolean on = false;
            private int vol = 30;
            public void enable() { on = true; System.out.println("TV powered ON"); }
            public void disable() { on = false; System.out.println("TV powered OFF"); }
            public void setVolume(int v) { vol = v; System.out.println("TV volume set to: " + vol); }
        };
        AdvancedRemote remote = new AdvancedRemote(tv);
        remote.togglePower();
        remote.mute();`,

  'composite': `        System.out.println("=== Composite Pattern (Canonical) ===");
        CompoundGraphic container = new CompoundGraphic();
        container.add(new Dot());
        container.add(new Dot());
        CompoundGraphic subContainer = new CompoundGraphic();
        subContainer.add(new Dot());
        container.add(subContainer);
        container.draw();`,

  'decorator': `        System.out.println("=== Decorator Pattern (Canonical) ===");
        DataSource memorySource = new DataSource() {
            private String memory = "";
            public void writeData(String d) { this.memory = d; System.out.println("Wrote raw: " + d); }
            public String readData() { return this.memory; }
        };
        DataSourceDecorator decorator = new DataSourceDecorator(memorySource) {
            @Override
            public void writeData(String d) {
                System.out.println("[EncryptionDecorator] Encrypting data before persistence...");
                super.writeData("ENCRYPTED(" + d + ")");
            }
        };
        decorator.writeData("Confidential GoF Record");
        System.out.println("Read back: " + decorator.readData());`,

  'facade': `        System.out.println("=== Facade Pattern (Canonical) ===");
        VideoConverter converter = new VideoConverter();
        converter.convert("vacation_clip.ogg", "mp4");`,

  'flyweight': `        System.out.println("=== Flyweight Pattern (Canonical) ===");
        TreeType oak = new TreeType("Oak", "Green");
        TreeType pine = new TreeType("Pine", "DarkGreen");
        oak.draw(10, 20);
        oak.draw(15, 25);
        pine.draw(50, 75);`,

  'proxy': `        System.out.println("=== Proxy Pattern (Canonical) ===");
        YouTubeLib realService = id -> {
            System.out.println("[YouTube Remote API] Network fetch for ID: " + id);
            return "VideoBinary[" + id + "]";
        };
        CachingProxy proxy = new CachingProxy(realService);
        System.out.println("First call: " + proxy.getVideo("video-101"));
        System.out.println("Second call (cached): " + proxy.getVideo("video-101"));`,

  'chain-of-responsibility': `        System.out.println("=== Chain of Responsibility (Canonical) ===");
        Handler basicSupport = new Handler() {
            @Override
            public void handle(int level) {
                if (level <= 1) {
                    System.out.println("Basic Tier 1 handled ticket level " + level);
                } else if (next != null) {
                    next.handle(level);
                }
            }
        };
        Handler techSupport = new Handler() {
            @Override
            public void handle(int level) {
                if (level <= 2) {
                    System.out.println("Senior Tier 2 handled ticket level " + level);
                } else if (next != null) {
                    next.handle(level);
                }
            }
        };
        basicSupport.setNext(techSupport);
        basicSupport.handle(1);
        basicSupport.handle(2);`,

  'command': `        System.out.println("=== Command Pattern (Canonical) ===");
        StringBuilder editor = new StringBuilder();
        Command insertHello = new InsertCommand(editor, "Hello ");
        Command insertWorld = new InsertCommand(editor, "World!");
        insertHello.execute();
        insertWorld.execute();
        System.out.println("Buffer after execution: " + editor);
        insertWorld.undo();
        System.out.println("Buffer after undo: " + editor);`,

  'iterator': `        System.out.println("=== Iterator Pattern (Canonical) ===");
        List<String> profiles = Arrays.asList("Alice (Architect)", "Bob (Lead)", "Charlie (Dev)");
        CustomIterator<String> iterator = new ProfileIterator(profiles);
        while (iterator.hasNext()) {
            System.out.println("Iterator yielded: " + iterator.next());
        }`,

  'mediator': `        System.out.println("=== Mediator Pattern (Canonical) ===");
        Mediator mediator = new AuthDialog();
        mediator.notify("UsernameInput", "textChanged");
        mediator.notify("SubmitButton", "click");`,

  'memento': `        System.out.println("=== Memento Pattern (Canonical) ===");
        String currentContent = "Draft Version 1.0";
        Memento savedSnapshot = new Memento(currentContent);
        currentContent = "Draft Version 2.0 (Corrupted)";
        System.out.println("Current corrupt state: " + currentContent);
        currentContent = savedSnapshot.getState();
        System.out.println("Restored state from Memento: " + currentContent);`,

  'observer': `        System.out.println("=== Observer Pattern (Canonical) ===");
        EventManager manager = new EventManager();
        manager.subscribe(data -> System.out.println("[AuditLog Observer] received: " + data));
        manager.subscribe(data -> System.out.println("[AlertNotifier Observer] received: " + data));
        manager.notify("File opened: appsettings.production.json");`,

  'state': `        System.out.println("=== State Pattern (Canonical) ===");
        AudioPlayer player = new AudioPlayer();
        State playingState = () -> System.out.println("[State: Playing] Pausing audio stream...");
        State pausedState = () -> System.out.println("[State: Paused] Resuming audio playback...");
        player.changeState(pausedState);
        player.play();
        player.changeState(playingState);
        player.play();`,

  'strategy': `        System.out.println("=== Strategy Pattern (Canonical) ===");
        RouteStrategy road = (a, b) -> "Fastest highway route from " + a + " to " + b + " (45 mins)";
        RouteStrategy walking = (a, b) -> "Scenic pedestrian route from " + a + " to " + b + " (120 mins)";
        Navigator navigator = new Navigator(road);
        navigator.route("Downtown", "Airport");
        navigator.setStrategy(walking);
        navigator.route("Downtown", "Airport");`,

  'template-method': `        System.out.println("=== Template Method Pattern (Canonical) ===");
        DataMiner pdfMiner = new DataMiner() {
            @Override
            protected void extract() {
                System.out.println("Extracting structured tabular data from PDF format.");
            }
        };
        pdfMiner.mine("financial_q3.pdf");`,

  'visitor': `        System.out.println("=== Visitor Pattern (Canonical) ===");
        List<Element> elements = Arrays.asList(new Dot(), new Circle());
        Visitor xmlVisitor = new Visitor() {
            public void visit(Dot d) { System.out.println("<dot x='10' y='20'/>"); }
            public void visit(Circle c) { System.out.println("<circle radius='15'/>"); }
        };
        for (Element el : elements) {
            el.accept(xmlVisitor);
        } `,

  'interpreter': `        System.out.println("=== Interpreter Pattern (Canonical) ===");
        Expression five = new NumberExpr(5);
        Expression ten = new NumberExpr(10);
        Expression sum = new AddExpr(five, ten);
        Expression total = new AddExpr(sum, new NumberExpr(7));
        System.out.println("Interpreted AST expression (5 + 10 + 7): " + total.interpret());`,
};

/**
 * Builds canonical project files for a pattern in Java.
 * Modeled after academic & Refactoring Guru references.
 * Guarantees Main.java is always the permanent starting tab (index 0).
 */
export function buildCanonicalJavaProject(pattern: Partial<Pattern> & { id: string }): ProjectFile[] {
  const variant = CANONICAL_DATA[pattern.id] || pattern.canonical;
  const rawCode = variant?.java?.code || pattern.javaImplementation?.code || '// Java implementation';
  const rawFileName = variant?.java?.fileName || pattern.javaImplementation?.fileName || 'Pattern.java';
  const baseName = rawFileName.replace(/\.java$/, '');

  const importHeader = 'import java.util.*;\nimport java.util.concurrent.*;\nimport java.util.function.*;\n\n';

  // Strip 'public' from classes in secondary file to satisfy javac single-public-class constraint
  const sanitizedCode =
    importHeader +
    rawCode.replace(/public\s+(?:final\s+|abstract\s+|sealed\s+)?(class|interface|enum|record)\s+/g, (m) =>
      m.replace('public ', '')
    );

  const runnerCode = CANONICAL_JAVA_MAIN_RUNNERS[pattern.id] || `        System.out.println("=== ${pattern.name || pattern.id} Pattern (Canonical Refactoring Guru) ===");
        System.out.println("Scenario: ${variant?.scenario?.replace(/"/g, '\\"') || pattern.intent?.replace(/"/g, '\\"') || ''}");
        System.out.println("\\nPattern components loaded and initialized from ${baseName}.java.");`;

  const mainRunnerCode = `import java.util.*;
import java.util.concurrent.*;
import java.util.function.*;

public class Main {
    public static void main(String[] args) {
${runnerCode}
    }
}
`;

  return [
    {
      id: 'canonical-java-main',
      name: 'Main.java',
      isEntryPoint: true,
      content: mainRunnerCode,
    },
    {
      id: 'canonical-java-pattern',
      name: `${baseName}.java`,
      isEntryPoint: false,
      content: sanitizedCode,
    },
  ];
}

/**
 * Builds canonical project files for a pattern in TypeScript.
 * Guarantees a modular multi-file project with index.ts at tab 0 importing from the pattern module.
 */
export function buildCanonicalTsProject(pattern: Partial<Pattern> & { id: string }): ProjectFile[] {
  const variant = CANONICAL_DATA[pattern.id] || pattern.canonical;
  const rawCode =
    variant?.typeScript?.code ||
    pattern.runnableCode ||
    pattern.typeScriptImplementation?.code ||
    '// TypeScript implementation';
  const rawFileName = variant?.typeScript?.fileName || pattern.typeScriptImplementation?.fileName || 'Pattern.ts';
  const baseName = rawFileName.replace(/\.tsx?$/, '');

  const { indexContent, moduleContent } = splitTsPattern(rawCode, baseName);

  return [
    {
      id: 'canonical-ts-main',
      name: 'index.ts',
      isEntryPoint: true,
      content: indexContent,
    },
    {
      id: 'canonical-ts-module',
      name: `${baseName}.ts`,
      isEntryPoint: false,
      content: moduleContent,
    },
  ];
}

/**
 * Pre-indexed Canonical projects for all 23 GoF design patterns in Java.
 */
export const CANONICAL_JAVA_PROJECTS: Record<string, ProjectFile[]> = Object.fromEntries(
  Object.keys(CANONICAL_DATA).map((patternId) => [
    patternId,
    buildCanonicalJavaProject({ id: patternId, name: patternId, intent: CANONICAL_DATA[patternId].problem }),
  ])
);

/**
 * Pre-indexed Canonical projects for all 23 GoF design patterns in TypeScript.
 */
export const CANONICAL_TS_PROJECTS: Record<string, ProjectFile[]> = Object.fromEntries(
  Object.keys(CANONICAL_DATA).map((patternId) => [
    patternId,
    buildCanonicalTsProject({ id: patternId }),
  ])
);
