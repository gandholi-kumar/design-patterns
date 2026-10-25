import type { ProjectFile } from '../components/PlaygroundFileTabs';
import { ENTERPRISE_DATA } from './enterprise-data';
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

const ENTERPRISE_JAVA_MAIN_RUNNERS: Record<string, string> = {
  'factory-method': `        System.out.println("=== Factory Method (Enterprise Cloud Storage) ===");
        StorageManager manager = new AwsStorageManager();
        byte[] payload = "Enterprise cloud backup payload".getBytes();
        manager.backupFile("backups/database-prod.tar.gz", payload);`,

  'abstract-factory': `        System.out.println("=== Abstract Factory (Enterprise Cloud Resources) ===");
        CloudFactory cloud = new AwsFactory();
        Compute compute = cloud.compute();
        Bucket bucket = cloud.bucket();
        compute.launch();
        bucket.allocate();`,

  'builder': `        System.out.println("=== Builder (Enterprise HTTP Request Spec) ===");
        HttpRequest request = new HttpRequest.Builder()
            .url("https://api.cloud.internal/v2/telemetry")
            .timeout(8000)
            .build();
        System.out.println("Constructed cloud request: " + request);`,

  'prototype': `        System.out.println("=== Prototype (Enterprise Tenant Config Cloner) ===");
        TenantConfig baseConfig = new TenantConfig();
        TenantConfig cloned = baseConfig.copy();
        System.out.println("Successfully cloned tenant configuration via Prototype pattern.");`,

  'singleton': `        System.out.println("=== Singleton (Enterprise Cluster Config Registry) ===");
        ClusterConfigRegistry reg1 = ClusterConfigRegistry.getInstance();
        ClusterConfigRegistry reg2 = ClusterConfigRegistry.getInstance();
        System.out.println("Both cluster registry instances identical: " + (reg1 == reg2));`,

  'adapter': `        System.out.println("=== Adapter (Enterprise Telemetry Bridge) ===");
        VendorSdk vendorSdk = new VendorSdk();
        Telemetry telemetry = new TelemetryAdapter(vendorSdk);
        telemetry.record("api.latency.p99", 42.5);
        telemetry.record("jvm.heap.utilization", 0.68);`,

  'bridge': `        System.out.println("=== Bridge (Enterprise Notification Bridge) ===");
        Delivery slackDelivery = msg -> System.out.println("[Slack #devops-alerts] " + msg);
        Delivery smsDelivery = msg -> System.out.println("[SMS Gateway +1-555-0199] " + msg);
        Notification urgentSlack = new UrgentAlert(slackDelivery);
        Notification urgentSms = new UrgentAlert(smsDelivery);
        urgentSlack.alert("Database replication lag exceeded 5000ms");
        urgentSms.alert("Production API 5xx rate exceeded 2%");`,

  'composite': `        System.out.println("=== Composite (Enterprise Cloud Cost Aggregator) ===");
        Resource ec2 = new Resource(120.50);
        Resource rds = new Resource(280.00);
        ResourceGroup databaseCluster = new ResourceGroup();
        databaseCluster.add(rds);
        databaseCluster.add(new Resource(65.00));

        ResourceGroup rootEnvironment = new ResourceGroup();
        rootEnvironment.add(ec2);
        rootEnvironment.add(databaseCluster);
        System.out.printf("Total Cloud Cost of Composite Hierarchy: $%.2f%n", rootEnvironment.getCost());`,

  'decorator': `        System.out.println("=== Decorator (Enterprise Resilient HTTP Client) ===");
        HttpClient rawClient = new BaseClient();
        HttpClient tracedClient = new TracingDecorator(rawClient);
        String response = tracedClient.send("https://api.payments.internal/v1/charge");
        System.out.println("HTTP Response payload: " + response);`,

  'facade': `        System.out.println("=== Facade (Enterprise Media Pipeline Facade) ===");
        MediaPipelineFacade pipeline = new MediaPipelineFacade();
        pipeline.process("raw-uploads/product-keynote-4k.mov");`,

  'flyweight': `        System.out.println("=== Flyweight (Enterprise Fleet Telemetry) ===");
        VehicleFlyweight van = new VehicleFlyweight("Mercedes-Benz", "Sprinter");
        VehicleFlyweight semi = new VehicleFlyweight("Volvo", "VNL");
        van.track(37.7749, -122.4194);
        van.track(37.7752, -122.4180);
        semi.track(40.7128, -74.0060);`,

  'proxy': `        System.out.println("=== Proxy (Enterprise Security Billing Proxy) ===");
        BillingService realService = (id, token) -> "InvoiceDetails[INV-2026-X, Amount=$42,500.00]";
        BillingService proxy = new BillingProxy(realService);
        try {
            System.out.println("Authorized query: " + proxy.getInvoice("INV-2026-X", "valid"));
            System.out.println("Testing unauthorized access...");
            proxy.getInvoice("INV-2026-X", "invalid_token");
        } catch (SecurityException e) {
            System.out.println("Security Proxy successfully blocked access: " + e.getMessage());
        }`,

  'chain-of-responsibility': `        System.out.println("=== Chain of Responsibility (Enterprise Security Filter) ===");
        SecurityFilter rateLimiter = new SecurityFilter() {
            @Override
            public boolean check(String ip) {
                System.out.println("[Filter 1: Rate Limiter] Validated IP " + ip + " within quota");
                return super.check(ip);
            }
        };
        SecurityFilter ipBlocklist = new SecurityFilter() {
            @Override
            public boolean check(String ip) {
                if (ip.startsWith("10.99.")) {
                    System.out.println("[Filter 2: Threat Detection] BLOCKED suspicious subnet: " + ip);
                    return false;
                }
                System.out.println("[Filter 2: Threat Detection] IP clean: " + ip);
                return super.check(ip);
            }
        };
        rateLimiter.linkWith(ipBlocklist);
        System.out.println("Request 1 allowed: " + rateLimiter.check("192.168.1.100"));
        System.out.println("Request 2 allowed: " + rateLimiter.check("10.99.0.4"));`,

  'command': `        System.out.println("=== Command (Enterprise Distributed Saga) ===");
        SagaCommand paymentStep = new SagaCommand() {
            public boolean execute() {
                System.out.println("[Saga Step 1] Authorized payment transaction $250.00");
                return true;
            }
            public void compensate() {
                System.out.println("[Saga Rollback] Refunding payment transaction $250.00");
            }
        };
        SagaCommand inventoryStep = new SagaCommand() {
            public boolean execute() {
                System.out.println("[Saga Step 2] Allocated SKU-4921 warehouse inventory");
                return true;
            }
            public void compensate() {
                System.out.println("[Saga Rollback] Releasing reserved inventory SKU-4921");
            }
        };
        boolean ok1 = paymentStep.execute();
        boolean ok2 = inventoryStep.execute();
        if (ok1 && ok2) {
            System.out.println("Saga orchestration completed successfully!");
        }`,

  'iterator': `        System.out.println("=== Iterator (Enterprise DynamoDB Cursor) ===");
        CloudIterator<String> it = new DynamoIterator();
        int count = 0;
        while (it.hasNext() && count++ < 3) {
            System.out.println("Fetched cloud record batch: " + it.next());
        }`,

  'mediator': `        System.out.println("=== Mediator (Enterprise Order Fulfillment) ===");
        WorkflowMediator mediator = new FulfillmentMediator();
        mediator.notify("OrderService", "order_created");
        mediator.notify("InventoryService", "inventory_reserved");
        mediator.notify("PaymentGateway", "payment_captured");`,

  'memento': `        System.out.println("=== Memento (Enterprise Cluster Rollback) ===");
        ClusterSnapshot snapshot = new ClusterSnapshot("Nodes: 12, Replicas: 36, Version: v2.4.1 (HEALTHY)");
        System.out.println("Saved cluster snapshot: " + snapshot.getState());
        String currentCluster = "Nodes: 6, Replicas: 12, Version: v2.5.0-rc1 (DEGRADED)";
        System.out.println("Current degraded state: " + currentCluster);
        currentCluster = snapshot.getState();
        System.out.println("Rolled back to snapshot: " + currentCluster);`,

  'observer': `        System.out.println("=== Observer (Enterprise Event Bus) ===");
        EventBus bus = new EventBus();
        bus.register((topic, msg) -> System.out.println("[AuditSubscriber] Topic=" + topic + ", Message=" + msg));
        bus.register((topic, msg) -> System.out.println("[MetricSubscriber] Incrementing counter for: " + topic));
        bus.publish("cloud.billing.invoiced", "Invoice #9824 generated for tenant_acme");`,

  'state': `        System.out.println("=== State (Enterprise Circuit Breaker) ===");
        CircuitBreaker breaker = new CircuitBreaker();
        String result = breaker.execute(() -> "Success: HTTP 200 from external microservice");
        System.out.println("Circuit Breaker call (Closed State): " + result);

        breaker.setState(supplier -> "[Circuit Breaker OPEN] Fast failing with cached fallback data");
        System.out.println("Circuit Breaker call (Open State): " + breaker.execute(() -> "Fail"));`,

  'strategy': `        System.out.println("=== Strategy (Enterprise Payment Gateway) ===");
        PaymentStrategy stripe = new StripeStrategy();
        PaymentContext context = new PaymentContext(stripe);
        context.checkout(15000);`,

  'template-method': `        System.out.println("=== Template Method (Enterprise Cloud ETL) ===");
        CloudEtl salesPipeline = new CloudEtl() {
            @Override
            protected void transform() {
                System.out.println("[Transform Step] Deduplicating JSON stream & masking PII customer records");
            }
        };
        salesPipeline.run();`,

  'visitor': `        System.out.println("=== Visitor (Enterprise IaC Compliance Auditor) ===");
        List<IacNode> infrastructure = Arrays.asList(new S3Node(), new Ec2Node());
        IacVisitor auditor = new IacVisitor() {
            public void visit(S3Node s) {
                System.out.println("[CIS Benchmark] Validated S3 bucket encryption and block public access");
            }
            public void visit(Ec2Node e) {
                System.out.println("[CIS Benchmark] Verified EC2 instance IAM profile and IMDSv2 configuration");
            }
        };
        for (IacNode node : infrastructure) {
            node.accept(auditor);
        }`,

  'interpreter': `        System.out.println("=== Interpreter (Enterprise Cloud Query Language) ===");
        Map<String, Object> logRecord = new HashMap<>();
        logRecord.put("service", "billing-api");
        logRecord.put("status", 500);

        QueryExpr query = new EqualsExpr("service", "billing-api");
        boolean matches = query.eval(logRecord);
        System.out.println("Log query expression (service == 'billing-api'): " + matches);`,
};

/**
 * Builds enterprise project files for a pattern in Java.
 * Modeled after production distributed cloud architectures.
 * Guarantees Main.java is always the permanent starting tab (index 0).
 */
export function buildEnterpriseJavaProject(pattern: Partial<Pattern> & { id: string }): ProjectFile[] {
  const variant = ENTERPRISE_DATA[pattern.id] || pattern.enterprise;
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

  const runnerCode = ENTERPRISE_JAVA_MAIN_RUNNERS[pattern.id] || `        System.out.println("=== ${pattern.name || pattern.id} Pattern (Enterprise Cloud) ===");
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
      id: 'enterprise-java-main',
      name: 'Main.java',
      isEntryPoint: true,
      content: mainRunnerCode,
    },
    {
      id: 'enterprise-java-pattern',
      name: `${baseName}.java`,
      isEntryPoint: false,
      content: sanitizedCode,
    },
  ];
}

/**
 * Builds enterprise project files for a pattern in TypeScript.
 * Guarantees a modular multi-file project with index.ts at tab 0 importing from the pattern module.
 */
export function buildEnterpriseTsProject(pattern: Partial<Pattern> & { id: string }): ProjectFile[] {
  const variant = ENTERPRISE_DATA[pattern.id] || pattern.enterprise;
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
      id: 'enterprise-ts-main',
      name: 'index.ts',
      isEntryPoint: true,
      content: indexContent,
    },
    {
      id: 'enterprise-ts-module',
      name: `${baseName}.ts`,
      isEntryPoint: false,
      content: moduleContent,
    },
  ];
}

/**
 * Pre-indexed Enterprise Cloud projects for all 23 GoF design patterns in Java.
 */
export const ENTERPRISE_JAVA_PROJECTS: Record<string, ProjectFile[]> = Object.fromEntries(
  Object.keys(ENTERPRISE_DATA).map((patternId) => [
    patternId,
    buildEnterpriseJavaProject({ id: patternId, name: patternId, intent: ENTERPRISE_DATA[patternId].problem }),
  ])
);

/**
 * Pre-indexed Enterprise Cloud projects for all 23 GoF design patterns in TypeScript.
 */
export const ENTERPRISE_TS_PROJECTS: Record<string, ProjectFile[]> = Object.fromEntries(
  Object.keys(ENTERPRISE_DATA).map((patternId) => [
    patternId,
    buildEnterpriseTsProject({ id: patternId }),
  ])
);
