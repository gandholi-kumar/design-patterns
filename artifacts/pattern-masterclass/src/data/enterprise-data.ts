import type { DomainVariant } from '../pattern-types';

export const ENTERPRISE_DATA: Record<string, DomainVariant> = {
  'factory-method': {
    title: 'Multi-Cloud Object Storage Driver Provisioning',
    scenario: 'A multi-tenant SaaS document platform writes customer audit logs and generated PDF exports to object storage across AWS S3, Google Cloud Storage, and Azure Blob based on tenant region and data sovereignty laws.',
    problem: 'Directly calling concrete cloud SDK constructors (e.g. `new S3Client()`) tightly couples business services to proprietary vendor APIs, preventing local integration test mocking and cross-cloud migration.',
    solution: 'Encapsulate driver construction inside an overridable `StorageManager.createDriver()` factory method. Concrete managers (`AwsStorageManager`, `GcpStorageManager`) resolve vendor credentials and return standardized `StorageDriver` products.',
    whenToUse: [
      'When your microservices must write to different cloud object stores (S3, GCS, Azure Blob) without leaking vendor SDK types into domain services.',
      'When you need local mock drivers for CI/CD test pipelines without running costly cloud hardware.',
      'When storage provider resolution is determined at runtime via tenant configuration or environment flags.',
    ],
    whenNotToUse: [
      'When your organization is committed exclusively to a single cloud provider and will never swap storage backends.',
      'When performance requires direct access to vendor-proprietary byte stream features (e.g. S3 Select) that break uniform driver contracts.',
    ],
    asciiShape: `Tenant Service ──► StorageManager.saveDocument()
                        │
                        ▼
                 createDriver() [Factory Method]
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
      AwsStorageManager      GcpStorageManager
             │                     │
             ▼                     ▼
         S3Driver              GcsDriver`,
    typeScript: {
      fileName: 'StorageManager.ts',
      explanation: 'StorageManager defines the createDriver() factory method; AwsStorageManager returns configured S3Driver.',
      code: `interface UploadReceipt { storageKey: string; byteCount: number; timestamp: number; }

interface StorageDriver {
  upload(path: string, payload: Buffer): Promise<UploadReceipt>;
}

class S3Driver implements StorageDriver {
  async upload(path: string, payload: Buffer): Promise<UploadReceipt> {
    console.log(\`[AWS S3] Uploading \${payload.byteLength} bytes to s3://enterprise-prod-vault/\${path}\`);
    return { storageKey: \`s3://vault/\${path}\`, byteCount: payload.byteLength, timestamp: Date.now() };
  }
}

class GcsDriver implements StorageDriver {
  async upload(path: string, payload: Buffer): Promise<UploadReceipt> {
    console.log(\`[GCP GCS] Uploading \${payload.byteLength} bytes to gs://global-data-lake/\${path}\`);
    return { storageKey: \`gs://lake/\${path}\`, byteCount: payload.byteLength, timestamp: Date.now() };
  }
}

abstract class StorageManager {
  abstract createDriver(): StorageDriver;

  async saveDocument(filename: string, data: Buffer): Promise<UploadReceipt> {
    const driver = this.createDriver();
    console.log(\`[AuditLog] Starting compliant document persistence for: \${filename}\`);
    return await driver.upload(filename, data);
  }
}

class AwsStorageManager extends StorageManager {
  createDriver(): StorageDriver { return new S3Driver(); }
}

class GcpStorageManager extends StorageManager {
  createDriver(): StorageDriver { return new GcsDriver(); }
}

// Runtime tenant orchestration
const manager: StorageManager = new AwsStorageManager();
manager.saveDocument("compliance/2026_q1_audit.pdf", Buffer.from("SEC_REPORT"));`,
    },
    java: {
      fileName: 'StorageManager.java',
      explanation: 'Production Java Factory Method managing cloud object storage drivers.',
      code: `public interface StorageDriver {
    void upload(String path, byte[] content);
}

public class S3Driver implements StorageDriver {
    public void upload(String path, byte[] content) {
        System.out.println("[AWS S3] Uploaded " + content.length + " bytes to " + path);
    }
}

public abstract class StorageManager {
    public abstract StorageDriver createDriver();

    public void backupFile(String filename, byte[] data) {
        StorageDriver driver = createDriver();
        driver.upload(filename, data);
    }
}

public class AwsStorageManager extends StorageManager {
    public StorageDriver createDriver() { return new S3Driver(); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class StorageManager {
  +createDriver()* StorageDriver
  +saveDocument(path, data)
}
class AwsStorageManager {
  +createDriver() StorageDriver
}
class GcpStorageManager {
  +createDriver() StorageDriver
}
class StorageDriver {
  <<interface>>
  +upload(path, payload)
}
class S3Driver
class GcsDriver
StorageManager <|-- AwsStorageManager
StorageManager <|-- GcpStorageManager
StorageDriver <|.. S3Driver
StorageDriver <|.. GcsDriver
AwsStorageManager ..> S3Driver : creates
GcpStorageManager ..> GcsDriver : creates`,
    diagramFlowchart: `flowchart LR
Service["Tenant Document Service"] -->|"calls saveDocument()"| Manager["StorageManager"]
Manager -->|invokes| FactoryMethod["createDriver()"]
FactoryMethod -->|resolved in| AwsManager["AwsStorageManager"]
AwsManager -->|creates| S3["S3Driver"]
S3 -->|uploads to| Bucket["AWS S3 Bucket"]`,
  },

  'abstract-factory': {
    title: 'Multi-Cloud Infrastructure Resource Provisioner',
    scenario: 'An Infrastructure as Code (IaC) orchestrator provisions matched computing instances, blob storage buckets, and VPC security groups on AWS, Azure, or Google Cloud.',
    problem: 'A multi-cloud deployment must provision resources matched to one vendor; accidentally combining AWS EC2 with GCP Cloud Storage or Azure VNets creates network failures.',
    solution: 'Define a CloudResourceFactory interface with creation methods for each resource type (createCompute(), createStorage(), createFirewall()). Provide concrete factory implementations per cloud provider.',
    whenToUse: [
      'When your system must spin up matched infrastructure suites across different cloud providers.',
      'When you must prevent accidental cross-vendor resource configuration mismatches at compile time.',
    ],
    whenNotToUse: [
      'When your infrastructure requirements change frequently by adding new resource types (e.g. Serverless, Queues), requiring updates across all factory classes.',
    ],
    asciiShape: `CloudDeployment ──► CloudResourceFactory
                         ├── createCompute()
                         ├── createStorage()
                         └── createFirewall()
            ┌────────────┴────────────┐
            ▼                         ▼
    AwsResourceFactory        GcpResourceFactory
     ├── EC2Compute            ├── GcpCompute
     ├── S3Bucket              ├── GcsBucket
     └── AwsSecurityGroup      └── GcpFirewall`,
    typeScript: {
      fileName: 'CloudResourceFactory.ts',
      explanation: 'CloudResourceFactory produces compatible compute, storage, and firewall resources for a single cloud vendor.',
      code: `interface ComputeInstance { start(): void; }
interface StorageBucket { allocate(gb: number): void; }

class Ec2Instance implements ComputeInstance {
  start() { console.log("[AWS] EC2 m5.large instance launched with IAM instance profile."); }
}

class S3Bucket implements StorageBucket {
  allocate(gb: number) { console.log(\`[AWS] S3 Bucket provisioned with \${gb}GB AES-256 encryption.\`); }
}

class GcpCompute implements ComputeInstance {
  start() { console.log("[GCP] Compute Engine e2-standard-4 instance initialized."); }
}

class GcsBucket implements StorageBucket {
  allocate(gb: number) { console.log(\`[GCP] Cloud Storage bucket allocated with \${gb}GB multi-region SLA.\`); }
}

interface CloudResourceFactory {
  createCompute(): ComputeInstance;
  createStorage(): StorageBucket;
}

class AwsFactory implements CloudResourceFactory {
  createCompute() { return new Ec2Instance(); }
  createStorage() { return new S3Bucket(); }
}

class GcpFactory implements CloudResourceFactory {
  createCompute() { return new GcpCompute(); }
  createStorage() { return new GcsBucket(); }
}

// Client orchestrator guarantees single-provider compatibility
function provisionEnvironment(factory: CloudResourceFactory) {
  const compute = factory.createCompute();
  const storage = factory.createStorage();
  compute.start();
  storage.allocate(500);
}

provisionEnvironment(new AwsFactory());`,
    },
    java: {
      fileName: 'CloudResourceFactory.java',
      explanation: 'Production Java Abstract Factory producing compatible cloud resource suites.',
      code: `public interface Compute { void launch(); }
public interface Bucket { void allocate(); }
public interface CloudFactory { Compute compute(); Bucket bucket(); }

public class AwsFactory implements CloudFactory {
    public Compute compute() { return () -> System.out.println("EC2 launched"); }
    public Bucket bucket() { return () -> System.out.println("S3 allocated"); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class CloudResourceFactory {
  <<interface>>
  +createCompute() Compute
  +createStorage() Bucket
}
class AwsFactory
class GcpFactory
class Compute { <<interface>> }
class Bucket { <<interface>> }
CloudResourceFactory <|.. AwsFactory
CloudResourceFactory <|.. GcpFactory
AwsFactory ..> Compute : creates EC2
AwsFactory ..> Bucket : creates S3
GcpFactory ..> Compute : creates GCE
GcpFactory ..> Bucket : creates GCS`,
    diagramFlowchart: `flowchart LR
Client["IaC Deployment Service"] --> Factory["CloudResourceFactory"]
Factory -->|AWS Profile| Aws["AwsFactory"]
Aws --> EC2["EC2 Instance"]
Aws --> S3["S3 Storage Bucket"]`,
  },

  builder: {
    title: 'Signed Cloud API Request & IAM Token Builder',
    scenario: 'Microservice client constructing signed HTTP requests with mandatory endpoints and optional HMAC headers, correlation IDs, timeouts, and mTLS certificates.',
    problem: 'Constructing complex distributed HTTP requests with dozens of optional headers, idempotency keys, and security tokens leads to unreadable telescoping parameters.',
    solution: 'Extract request configuration into a CloudRequestBuilder with fluent step methods and validated build() producing an immutable HttpRequest.',
    whenToUse: [
      'When building complex HTTP requests, Kubernetes manifest specs, or database queries with many optional fields.',
      'When request objects must be strictly validated for missing credentials prior to network dispatch.',
    ],
    whenNotToUse: [
      'When creating simple REST GET calls with no custom headers or query parameters.',
    ],
    asciiShape: `RequestBuilder.url("https://api.internal/v1/metrics")
             .header("X-Correlation-ID", "req_9812")
             .hmacSignature("secret_key")
             .timeout(5000)
             .build() ──► Immutable CloudRequest`,
    typeScript: {
      fileName: 'CloudRequestBuilder.ts',
      explanation: 'CloudRequestBuilder stages headers, query parameters, timeouts, and signs requests before producing an immutable object.',
      code: `interface RequestSpec {
  method: string;
  url: string;
  headers: Record<string, string>;
  timeoutMs: number;
  body?: string;
}

class CloudRequestBuilder {
  private spec: RequestSpec = {
    method: "GET",
    url: "",
    headers: { "X-Client-Version": "2.4.0" },
    timeoutMs: 3000,
  };

  url(endpoint: string): this { this.spec.url = endpoint; return this; }
  method(m: "GET" | "POST" | "PUT" | "DELETE"): this { this.spec.method = m; return this; }
  withBearerToken(token: string): this { this.spec.headers["Authorization"] = \`Bearer \${token}\`; return this; }
  withCorrelationId(id: string): this { this.spec.headers["X-Correlation-ID"] = id; return this; }
  timeout(ms: number): this { this.spec.timeoutMs = ms; return this; }
  payload(data: object): this { this.spec.body = JSON.stringify(data); return this; }

  build(): Readonly<RequestSpec> {
    if (!this.spec.url) throw new Error("Validation Failed: URL endpoint is mandatory.");
    return Object.freeze({ ...this.spec, headers: { ...this.spec.headers } });
  }
}

const req = new CloudRequestBuilder()
  .url("https://kms.us-east-1.amazonaws.com/v1/decrypt")
  .method("POST")
  .withBearerToken("eyJhbGciOi...")
  .withCorrelationId("trace_841289")
  .timeout(5000)
  .payload({ ciphertext: "A89F1D==" })
  .build();

console.log("[HTTP Dispatcher] Outgoing Request:", req);`,
    },
    java: {
      fileName: 'CloudRequestBuilder.java',
      explanation: 'Production Java HttpRequest builder with validation and timeout management.',
      code: `public final class HttpRequest {
    private final String url, method;
    private final int timeout;
    private HttpRequest(Builder b) { this.url = b.url; this.method = b.method; this.timeout = b.timeout; }

    public static class Builder {
        private String url, method = "GET";
        private int timeout = 5000;
        public Builder url(String u) { this.url = u; return this; }
        public Builder timeout(int t) { this.timeout = t; return this; }
        public HttpRequest build() {
            if (url == null) throw new IllegalStateException("URL required");
            return new HttpRequest(this);
        }
    }
}`,
    },
    diagramUml: `classDiagram
direction LR
class CloudRequestBuilder {
  -spec: RequestSpec
  +url(string) this
  +withBearerToken(string) this
  +timeout(number) this
  +build() RequestSpec
}
class RequestSpec
CloudRequestBuilder ..> RequestSpec : builds`,
    diagramFlowchart: `flowchart LR
Client --> Builder["CloudRequestBuilder"]
Builder -->|"url()"| Builder
Builder -->|"withBearerToken()"| Builder
Builder -->|"timeout()"| Builder
Builder -->|"build()"| Immutable["Validated CloudRequest"]`,
  },

  prototype: {
    title: 'Tenant Workspace & Cloud IaC Spec Cloner',
    scenario: 'Spinning up new enterprise customer sandboxes by cloning a fully configured base infrastructure blueprint containing hundreds of IAM roles, VPC subnets, and alert thresholds.',
    problem: 'Constructing an enterprise environment from scratch via constructors takes minutes of CPU serialization and requires knowing concrete sub-resource types.',
    solution: 'Expose a clone() operation on prototype specifications. Clone the pre-configured base environment in memory and apply tenant-specific overrides.',
    whenToUse: [
      'When initialization of complex cloud configuration graphs is costly or decided dynamically at runtime.',
      'When spawning isolated tenant environments from a golden master configuration.',
    ],
    whenNotToUse: [
      'When environment configurations have circular dependencies that complicate deep clone operations.',
    ],
    asciiShape: `MasterWorkspaceTemplate.clone()
         │
    ┌────┴────┐
    ▼         ▼
TenantA   TenantB
(clone)   (clone)`,
    typeScript: {
      fileName: 'TenantWorkspacePrototype.ts',
      explanation: 'TenantWorkspace implements deep cloning of VPC, IAM roles, and security policies for rapid sandbox provisioning.',
      code: `interface WorkspacePrototype {
  clone(): WorkspacePrototype;
}

class TenantEnvironment implements WorkspacePrototype {
  constructor(
    public tenantId: string,
    public region: string,
    public vpcCidr: string,
    public iamRoles: string[],
    public maxNodes: number
  ) {}

  clone(): TenantEnvironment {
    // Perform deep copy of arrays and configuration
    return new TenantEnvironment(
      this.tenantId,
      this.region,
      this.vpcCidr,
      [...this.iamRoles],
      this.maxNodes
    );
  }
}

// Golden master template
const goldenMaster = new TenantEnvironment("master", "us-east-1", "10.0.0.0/16", ["Admin", "AuditRead", "BillingOperator"], 20);

// Rapid cloning for new customer onboarding
const customerA = goldenMaster.clone();
customerA.tenantId = "cust_acme_corp";
customerA.region = "eu-west-1";

console.log(\`Cloned sandbox for \${customerA.tenantId} in \${customerA.region} with \${customerA.iamRoles.length} IAM roles.\`);`,
    },
    java: {
      fileName: 'TenantWorkspacePrototype.java',
      explanation: 'Java deep-cloning implementation for tenant configuration blueprints.',
      code: `public interface Prototype<T> { T copy(); }
public class TenantConfig implements Prototype<TenantConfig> {
    private String tenantId, region;
    private List<String> roles;
    public TenantConfig copy() {
        TenantConfig c = new TenantConfig();
        c.tenantId = this.tenantId; c.region = this.region;
        c.roles = new ArrayList<>(this.roles);
        return c;
    }
}`,
    },
    diagramUml: `classDiagram
direction LR
class WorkspacePrototype {
  <<interface>>
  +clone() WorkspacePrototype
}
class TenantEnvironment {
  +tenantId
  +region
  +clone() WorkspacePrototype
}
WorkspacePrototype <|.. TenantEnvironment`,
    diagramFlowchart: `flowchart LR
GoldenMaster["Golden Master Blueprint"] -->|"calls .clone()"| Cloner["Memory Cloner"]
Cloner --> TenantA["Tenant A Sandbox (EU)"]
Cloner --> TenantB["Tenant B Sandbox (US)"]`,
  },

  singleton: {
    title: 'Distributed Cluster Configuration Registry',
    scenario: 'Application-wide configuration registry caching database connection pools, dynamic feature flags, and encryption keys across microservice worker threads.',
    problem: 'Repeated instantiation of connection pools exhausts database sockets, consumes memory, and causes thread lock starvation.',
    solution: 'Provide a single controlled accessor to an initialized instance, managing lifecycle and concurrency explicitly.',
    whenToUse: [
      'When a resource pool (DB connections, HTTP connection pools, hardware security modules) must be strictly centralized.',
      'When managing application-wide immutable configuration loaded at startup.',
    ],
    whenNotToUse: [
      'When state is mutable across independent request lifecycles; singletons create global coupling and hinder parallel unit testing.',
    ],
    asciiShape: `WorkerThread1 ──┐
WorkerThread2 ──┼──► ClusterConfig.shared() ──► Shared Connection Pool
WorkerThread3 ──┘`,
    typeScript: {
      fileName: 'ClusterConfigRegistry.ts',
      explanation: 'Process-wide singleton registry providing thread-safe caching of cluster connection parameters.',
      code: `class ClusterConfigRegistry {
  private static instance: ClusterConfigRegistry | null = null;
  private settings = new Map<string, string>();

  private constructor() {
    this.settings.set("env", "production");
    this.settings.set("db_pool_size", "50");
    this.settings.set("kafka_brokers", "b1.internal:9092,b2.internal:9092");
    console.log("[ClusterConfig] Initialized process-wide configuration singleton.");
  }

  public static shared(): ClusterConfigRegistry {
    if (!ClusterConfigRegistry.instance) {
      ClusterConfigRegistry.instance = new ClusterConfigRegistry();
    }
    return ClusterConfigRegistry.instance;
  }

  public get(key: string): string {
    return this.settings.get(key) || "";
  }
}

const config1 = ClusterConfigRegistry.shared();
const config2 = ClusterConfigRegistry.shared();
console.log("Single instance verified:", config1 === config2);
console.log("Kafka brokers:", config1.get("kafka_brokers"));`,
    },
    java: {
      fileName: 'ClusterConfigRegistry.java',
      explanation: 'Production Java Singleton with double-checked locking and volatile visibility.',
      code: `public final class ClusterConfigRegistry {
    private static volatile ClusterConfigRegistry instance;
    private final Map<String, String> values = new ConcurrentHashMap<>();
    private ClusterConfigRegistry() {}

    public static ClusterConfigRegistry getInstance() {
        if (instance == null) {
            synchronized (ClusterConfigRegistry.class) {
                if (instance == null) { instance = new ClusterConfigRegistry(); }
            }
        }
        return instance;
    }
}`,
    },
    diagramUml: `classDiagram
direction LR
class ClusterConfigRegistry {
  -instance$ ClusterConfigRegistry
  -ClusterConfigRegistry()
  +shared()$ ClusterConfigRegistry
  +get(key) string
}
Client --> ClusterConfigRegistry : shared()`,
    diagramFlowchart: `flowchart LR
ThreadA["Worker Thread A"] --> Get["shared()"]
ThreadB["Worker Thread B"] --> Get
Get -->|cached pointer| Singleton["Single Registry & Connection Pool"]`,
  },

  adapter: {
    title: 'OpenTelemetry SDK / Vendor Telemetry Adapter',
    scenario: 'Platform telemetry microservice expects a standard sendMetric(name, value) contract, but a proprietary vendor SDK (Datadog, Dynatrace) exposes submitCounter(key, count).',
    problem: 'Proprietary vendor monitoring SDKs cannot be edited, and baking vendor-specific calls directly into microservices creates vendor lock-in.',
    solution: 'Wrap the third-party telemetry SDK inside an adapter class implementing the internal platform telemetry interface.',
    whenToUse: [
      'When integrating third-party SaaS SDKs whose API signatures do not match your platform standards.',
      'When shielding core microservices from frequent vendor API breaking changes.',
    ],
    whenNotToUse: [
      'When the adapter layer grows into a complex transformation engine that duplicates business logic.',
    ],
    asciiShape: `PlatformTelemetry.recordMetric()
             ▲
             │ implements PlatformTelemetry
     DatadogMetricAdapter(DatadogClient)
             │ wraps
             ▼
     DatadogClient.sendCounter()`,
    typeScript: {
      fileName: 'TelemetryAdapter.ts',
      explanation: 'DatadogMetricAdapter implements PlatformTelemetry while delegating calls to vendor DatadogSdk.',
      code: `interface PlatformTelemetry {
  recordMetric(metricName: string, value: number, tags: Record<string, string>): void;
}

// Vendor proprietary SDK (cannot modify)
class DatadogVendorSdk {
  submitCounter(metricKey: string, amount: number, rawTags: string[]) {
    console.log(\`[Datadog API] Pushed: \${metricKey} = \${amount} [tags: \${rawTags.join(",")}]\`);
  }
}

class DatadogMetricAdapter implements PlatformTelemetry {
  constructor(private sdk: DatadogVendorSdk) {}

  recordMetric(metricName: string, value: number, tags: Record<string, string>): void {
    // Translate dictionary tags into Datadog's expected "k:v" string array format
    const formattedTags = Object.entries(tags).map(([k, v]) => \`\${k}:\${v}\`);
    const sanitizedKey = \`cloud.platform.\${metricName.replace(/\\s+/g, "_")}\`;
    this.sdk.submitCounter(sanitizedKey, value, formattedTags);
  }
}

const telemetry: PlatformTelemetry = new DatadogMetricAdapter(new DatadogVendorSdk());
telemetry.recordMetric("http.response_time", 142, { service: "auth-gateway", env: "production" });`,
    },
    java: {
      fileName: 'TelemetryAdapter.java',
      explanation: 'Adapter pattern in Java normalizing vendor metric SDKs.',
      code: `public interface Telemetry { void record(String name, double val); }
public class VendorSdk { public void sendCounter(String key, double count) { System.out.println(key + "=" + count); } }
public class TelemetryAdapter implements Telemetry {
    private VendorSdk sdk;
    public TelemetryAdapter(VendorSdk sdk) { this.sdk = sdk; }
    public void record(String name, double val) { sdk.sendCounter(name, val); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class PlatformTelemetry {
  <<interface>>
  +recordMetric(name, val)
}
class DatadogMetricAdapter {
  -sdk: DatadogVendorSdk
  +recordMetric(name, val)
}
class DatadogVendorSdk {
  +submitCounter(key, amount)
}
PlatformTelemetry <|.. DatadogMetricAdapter
DatadogMetricAdapter --> DatadogVendorSdk : translates`,
    diagramFlowchart: `flowchart LR
Microservice -->|"recordMetric()"| Adapter["DatadogMetricAdapter"]
Adapter -->|"formats tags & calls"| Sdk["DatadogVendorSdk.submitCounter()"]`,
  },

  bridge: {
    title: 'Multi-Channel Cloud Notification Dispatcher',
    scenario: 'Platform alert router supporting Urgent Alerts and Scheduled Batch Reports across independent cloud delivery transports (AWS SES Email, Twilio SMS, Slack Webhook).',
    problem: 'Combining message priority types with delivery mechanisms using inheritance creates an explosion of subclasses (UrgentEmail, UrgentSms, ScheduledEmail, ScheduledSms).',
    solution: 'Separate the Alert abstraction from the DeliveryChannel implementor; both vary independently.',
    whenToUse: [
      'When both high-level notification policies and transport integrations must evolve independently without subclass explosion.',
      'When you need to swap delivery channels dynamically at runtime based on customer preferences.',
    ],
    whenNotToUse: [
      'When notifications only ever use a single channel with fixed priority rules.',
    ],
    asciiShape: `Notification (Abstraction) ──► DeliveryTransport (Implementor)
     ├── CriticalAlarm                 ├── AwsSesEmailChannel
     └── ScheduledSummary              └── TwilioSmsChannel`,
    typeScript: {
      fileName: 'NotificationBridge.ts',
      explanation: 'Notification abstraction delegates message delivery to decoupled DeliveryTransport implementations.',
      code: `interface DeliveryTransport {
  sendPayload(recipient: string, message: string): Promise<void>;
}

class AwsSesEmailChannel implements DeliveryTransport {
  async sendPayload(recipient: string, message: string) {
    console.log(\`[AWS SES] Dispatched email to \${recipient}: \${message}\`);
  }
}

class TwilioSmsChannel implements DeliveryTransport {
  async sendPayload(recipient: string, message: string) {
    console.log(\`[Twilio SMS] Dispatched SMS to \${recipient}: \${message}\`);
  }
}

abstract class Notification {
  constructor(protected transport: DeliveryTransport) {}
  abstract notify(target: string, content: string): Promise<void>;
}

class CriticalAlarmNotification extends Notification {
  async notify(target: string, content: string) {
    const formatted = \`[CRITICAL ALERT - ACTION REQUIRED] \${content}\`;
    await this.transport.sendPayload(target, formatted);
  }
}

const alarm = new CriticalAlarmNotification(new TwilioSmsChannel());
alarm.notify("+1-555-0192", "K8s Node cpu_utilization exceeded 98%");`,
    },
    java: {
      fileName: 'NotificationBridge.java',
      explanation: 'Bridge pattern in Java decoupling notification logic from delivery transport.',
      code: `public interface Delivery { void send(String msg); }
public abstract class Notification {
    protected Delivery delivery;
    public Notification(Delivery d) { this.delivery = d; }
    public abstract void alert(String msg);
}
public class UrgentAlert extends Notification {
    public UrgentAlert(Delivery d) { super(d); }
    public void alert(String m) { delivery.send("URGENT: " + m); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class Notification {
  -transport: DeliveryTransport
  +notify()
}
class CriticalAlarm
class DeliveryTransport {
  <<interface>>
  +sendPayload()
}
class AwsSesEmail
class TwilioSms
Notification <|-- CriticalAlarm
Notification o--> DeliveryTransport
DeliveryTransport <|.. AwsSesEmail
DeliveryTransport <|.. TwilioSms`,
    diagramFlowchart: `flowchart LR
PlatformAlarm --> Notification["CriticalAlarm (Abstraction)"]
Notification -->|delegates to| Transport["DeliveryTransport"]
Transport --> SES["AWS SES Email Channel"]
Transport --> Twilio["Twilio SMS Channel"]`,
  },

  composite: {
    title: 'Hierarchical Cloud IAM & Resource Cost Tree',
    scenario: 'Cloud resource billing engine aggregating costs across an organizational tree: Root Organization → Business Units → Accounts → Individual EC2/S3 Resources.',
    problem: 'Clients must differentiate between calculating costs for a single AWS resource versus recursively summing costs across organizational units and nested folders.',
    solution: 'Implement a uniform CloudResourceNode interface for both leaf resources and composite organizational groups.',
    whenToUse: [
      'When representing hierarchical organizational models, cloud infrastructure trees, or nested IAM policies.',
      'When clients need to calculate totals or evaluate permissions recursively across parts and groups uniformly.',
    ],
    whenNotToUse: [
      'When leaves and groups have conflicting method contracts, violating the Interface Segregation Principle.',
    ],
    asciiShape: `CloudOrganization (totalCost)
   ├── Folder: Engineering (totalCost)
   │     ├── Account: Dev (totalCost) ──► S3Bucket ($40)
   │     └── Account: Prod (totalCost) ──► EC2Cluster ($320)
   └── Account: Shared-Services (totalCost) ──► CloudFront ($15)`,
    typeScript: {
      fileName: 'CloudCostComposite.ts',
      explanation: 'CloudResourceNode interface allows single resources and composite accounts to be totaled uniformly.',
      code: `interface CloudResourceNode {
  getName(): string;
  calculateMonthlyCost(): number;
}

class IndividualCloudResource implements CloudResourceNode {
  constructor(private name: string, private costUsd: number) {}
  getName() { return this.name; }
  calculateMonthlyCost() { return this.costUsd; }
}

class CloudResourceGroup implements CloudResourceNode {
  private children: CloudResourceNode[] = [];
  constructor(private name: string) {}

  add(node: CloudResourceNode): void { this.children.push(node); }
  getName() { return this.name; }

  calculateMonthlyCost(): number {
    return this.children.reduce((sum, child) => sum + child.calculateMonthlyCost(), 0);
  }
}

const rootOrg = new CloudResourceGroup("Enterprise Cloud Root Org");
const prodAccount = new CloudResourceGroup("Production AWS Account");
prodAccount.add(new IndividualCloudResource("Kubernetes Worker Nodes", 1240.0));
prodAccount.add(new IndividualCloudResource("Aurora PostgreSQL DB", 850.0));

rootOrg.add(prodAccount);
rootOrg.add(new IndividualCloudResource("Enterprise Support Plan", 500.0));

console.log(\`Total Organization Cloud Spend: $\${rootOrg.calculateMonthlyCost()} USD\`);`,
    },
    java: {
      fileName: 'CloudCostComposite.java',
      explanation: 'Composite pattern in Java calculating recursive cloud infrastructure expenditures.',
      code: `public interface ResourceNode { double getCost(); }
public class Resource implements ResourceNode {
    private double cost; public Resource(double c) { this.cost = c; }
    public double getCost() { return cost; }
}
public class ResourceGroup implements ResourceNode {
    private List<ResourceNode> nodes = new ArrayList<>();
    public void add(ResourceNode n) { nodes.add(n); }
    public double getCost() { return nodes.stream().mapToDouble(ResourceNode::getCost).sum(); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class CloudResourceNode {
  <<interface>>
  +calculateMonthlyCost() number
}
class IndividualResource
class CloudResourceGroup {
  -children: CloudResourceNode[]
  +add(CloudResourceNode)
  +calculateMonthlyCost() number
}
CloudResourceNode <|.. IndividualResource
CloudResourceNode <|.. CloudResourceGroup
CloudResourceGroup o--> CloudResourceNode`,
    diagramFlowchart: `flowchart LR
Billing --> Root["Cloud Organization (Root)"]
Root --> Group1["Prod AWS Account (Group)"]
Group1 --> Leaf1["EC2 Instance ($200)"]
Group1 --> Leaf2["RDS Database ($500)"]
Root --> Leaf3["CloudFront Distribution ($50)"]`,
  },

  decorator: {
    title: 'Resilient Microservice HTTP Client Pipeline',
    scenario: 'Outgoing microservice API client wrapping network transports with transparent layers: JWT Authentication, Correlation Tracing, Exponential Backoff, and Rate Limiting.',
    problem: 'Hardcoding retry, tracing, and authentication logic directly into an HTTP client creates a bloated, inflexible class where features cannot be composed dynamically.',
    solution: 'Wrap the base HTTP client in decorator layers implementing the same client interface, executing resilience policies before and after delegation.',
    whenToUse: [
      'When you need to dynamically layer resilience (retries, circuit breaker), observability (tracing), and security (auth tokens) around network calls.',
      'When different service endpoints require different combinations of interceptors at runtime.',
    ],
    whenNotToUse: [
      'When decorators have strict hidden order dependencies that make pipeline configuration fragile.',
    ],
    asciiShape: `Client ──► AuthHeaderDecorator
               └──► TracingHeaderDecorator
                       └──► RetryBackoffDecorator
                               └──► BaseHttpClient`,
    typeScript: {
      fileName: 'ResilientHttpClient.ts',
      explanation: 'HttpClientDecorator wraps BaseHttpClient to inject correlation tracing and automatic retry policies.',
      code: `interface HttpClient {
  request(url: string): Promise<string>;
}

class BaseHttpClient implements HttpClient {
  async request(url: string): Promise<string> {
    console.log(\`[Network] Executed raw HTTP fetch to \${url}\`);
    return "200 OK Response Payload";
  }
}

class HttpClientDecorator implements HttpClient {
  constructor(protected wrappee: HttpClient) {}
  request(url: string): Promise<string> {
    return this.wrappee.request(url);
  }
}

class TracingDecorator extends HttpClientDecorator {
  async request(url: string): Promise<string> {
    const traceId = "trace_" + Math.random().toString(36).substring(7);
    console.log(\`[Tracing] Injected X-Trace-ID: \${traceId}\`);
    return await super.request(url);
  }
}

class RetryDecorator extends HttpClientDecorator {
  async request(url: string): Promise<string> {
    try {
      return await super.request(url);
    } catch (e) {
      console.log("[Retry] Initial call failed. Retrying with exponential backoff...");
      return await super.request(url);
    }
  }
}

const client: HttpClient = new TracingDecorator(new RetryDecorator(new BaseHttpClient()));
client.request("https://payments.internal/v1/charge");`,
    },
    java: {
      fileName: 'ResilientHttpClient.java',
      explanation: 'Production Java Decorator layering resilience around HTTP requests.',
      code: `public interface HttpClient { String send(String url); }
public class BaseClient implements HttpClient { public String send(String u) { return "OK"; } }
public class TracingDecorator implements HttpClient {
    private HttpClient wrappee;
    public TracingDecorator(HttpClient c) { this.wrappee = c; }
    public String send(String u) {
        System.out.println("Injected Trace ID");
        return wrappee.send(u);
    }
}`,
    },
    diagramUml: `classDiagram
direction LR
class HttpClient {
  <<interface>>
  +request(url)
}
class BaseHttpClient
class HttpClientDecorator {
  -wrappee: HttpClient
}
class TracingDecorator
class RetryDecorator
HttpClient <|.. BaseHttpClient
HttpClient <|.. HttpClientDecorator
HttpClientDecorator o--> HttpClient
HttpClientDecorator <|-- TracingDecorator
HttpClientDecorator <|-- RetryDecorator`,
    diagramFlowchart: `flowchart LR
Service --> Layer1["TracingDecorator"]
Layer1 --> Layer2["RetryDecorator"]
Layer2 --> Transport["BaseHttpClient"]`,
  },

  facade: {
    title: 'Cloud Media Ingestion & Transcoding Pipeline',
    scenario: 'SaaS media platform ingest workflow coordinating S3 storage download, FFmpeg distributed transcoding, DynamoDB metadata recording, and AWS SNS notifications.',
    problem: 'Client endpoints must directly orchestrate dozens of low-level AWS SDK clients, creating brittle code and spreading setup complexity across microservices.',
    solution: 'Provide a single CloudMediaPipelineFacade exposing a clean processMediaUpload(uploadId) method that encapsulates all subsystem coordination.',
    whenToUse: [
      'When you need to provide a simplified, single-purpose entry point to a distributed microservice workflow or cloud subsystem.',
      'When decoupling client API controllers from complex backend service mesh interactions.',
    ],
    whenNotToUse: [
      'When the facade turns into a monolithic God Object that absorbs all application business rules.',
    ],
    asciiShape: `API Controller ──► CloudMediaPipelineFacade (processUpload)
                        ├── S3DownloadService
                        ├── DistributedTranscoder
                        ├── DynamoDbMetadataStore
                        └── SnsNotificationPublisher`,
    typeScript: {
      fileName: 'CloudMediaPipelineFacade.ts',
      explanation: 'Facade coordinating cloud storage, transcoding cluster, and database persistence.',
      code: `class S3DownloadService {
  download(key: string) { console.log(\`[S3] Downloaded object: \${key}\`); }
}
class DistributedTranscoder {
  transcode(key: string, preset: string) { console.log(\`[Transcoder] Rendered \${preset} HLS streams for \${key}\`); }
}
class MetadataStore {
  saveRecord(key: string) { console.log(\`[DynamoDB] Saved media metadata for \${key}\`); }
}

class CloudMediaPipelineFacade {
  private s3 = new S3DownloadService();
  private transcoder = new DistributedTranscoder();
  private db = new MetadataStore();

  async processUpload(uploadKey: string): Promise<void> {
    console.log(\`[Pipeline] Starting cloud media workflow for: \${uploadKey}\`);
    this.s3.download(uploadKey);
    this.transcoder.transcode(uploadKey, "1080p_60fps");
    this.db.saveRecord(uploadKey);
    console.log(\`[Pipeline] Workflow successfully completed for: \${uploadKey}\`);
  }
}

new CloudMediaPipelineFacade().processUpload("uploads/raw_video_981.mov");`,
    },
    java: {
      fileName: 'CloudMediaPipelineFacade.java',
      explanation: 'Java Facade orchestrating cloud media processing subsystems.',
      code: `public class MediaPipelineFacade {
    public void process(String fileKey) {
        System.out.println("Coordinating S3, Transcoding, and DynamoDB for: " + fileKey);
    }
}`,
    },
    diagramUml: `classDiagram
direction LR
class MediaPipelineFacade {
  +processUpload(key)
}
class S3DownloadService
class DistributedTranscoder
class MetadataStore
MediaPipelineFacade --> S3DownloadService
MediaPipelineFacade --> DistributedTranscoder
MediaPipelineFacade --> MetadataStore`,
    diagramFlowchart: `flowchart LR
Api --> Facade["MediaPipelineFacade"]
Facade --> S1["S3 Download"]
Facade --> S2["Transcoder Engine"]
Facade --> S3["DynamoDB Persistence"]`,
  },

  flyweight: {
    title: 'High-Throughput Geospatial & Tenant Metadata Pool',
    scenario: 'Real-time telemetry and IoT fleet tracker processing millions of location coordinates sharing immutable vehicle model specifications and tenant branding metadata.',
    problem: 'Instantiating tenant metadata (brand logos, permission sets, vehicle specs) for 10 million concurrent GPS tracking events exhausts server RAM.',
    solution: 'Separate shared intrinsic tenant/vehicle specifications into Flyweight instances; pass extrinsic dynamic location points (latitude, longitude, speed) at evaluation time.',
    whenToUse: [
      'When processing high-scale streams (IoT, financial ticks, geospatial points) where millions of records share immutable metadata.',
    ],
    whenNotToUse: [
      'When data volume is low and the CPU cost of passing extrinsic state exceeds memory savings.',
    ],
    asciiShape: `Telemetry Stream (10,000,000 GPS Events)
   └── GpsPing(lat, lon, speed) [Extrinsic Context]
          └── VehicleModelFlyweight(make, model, engine) [Shared Flyweight]`,
    typeScript: {
      fileName: 'TelemetryFlyweight.ts',
      explanation: 'VehicleModelFlyweight holds shared immutable specs; GpsPing holds lightweight runtime coordinates.',
      code: `class VehicleModelFlyweight {
  constructor(public make: string, public model: string, public engineType: string) {}
  renderLocation(vehicleId: string, lat: number, lon: number) {
    console.log(\`[Fleet Tracker] \${this.make} \${this.model} (ID: \${vehicleId}) at (\${lat.toFixed(4)}, \${lon.toFixed(4)})\`);
  }
}

class VehicleFlyweightFactory {
  private static cache = new Map<string, VehicleModelFlyweight>();

  static getModel(make: string, model: string, engine: string): VehicleModelFlyweight {
    const key = \`\${make}_\${model}_\${engine}\`;
    let existing = this.cache.get(key);
    if (!existing) {
      existing = new VehicleModelFlyweight(make, model, engine);
      this.cache.set(key, existing);
    }
    return existing;
  }
}

class GpsPing {
  constructor(private vehicleId: string, private lat: number, private lon: number, private model: VehicleModelFlyweight) {}
  log() { this.model.renderLocation(this.vehicleId, this.lat, this.lon); }
}

const teslaModelY = VehicleFlyweightFactory.getModel("Tesla", "Model Y", "Dual-Motor");
const ping1 = new GpsPing("v_01", 37.7749, -122.4194, teslaModelY);
const ping2 = new GpsPing("v_02", 37.7752, -122.4188, teslaModelY);
ping1.log();
ping2.log();`,
    },
    java: {
      fileName: 'TelemetryFlyweight.java',
      explanation: 'Flyweight pattern in Java deduplicating telemetry metadata in RAM.',
      code: `public class VehicleFlyweight {
    private String make, model;
    public VehicleFlyweight(String m, String mod) { this.make = m; this.model = mod; }
    public void track(double lat, double lon) { System.out.println(make + " at " + lat + "," + lon); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class VehicleFlyweightFactory {
  +getModel(key) VehicleModelFlyweight
}
class VehicleModelFlyweight {
  -make
  -model
  +renderLocation(id, lat, lon)
}
class GpsPing {
  -lat
  -lon
  -model: VehicleModelFlyweight
}
VehicleFlyweightFactory o--> VehicleModelFlyweight
GpsPing o--> VehicleModelFlyweight`,
    diagramFlowchart: `flowchart LR
Ingest --> Factory["VehicleFlyweightFactory"]
Factory -->|shares pointer| Flyweight["VehicleModelFlyweight (RAM: 1 instance)"]
Ingest --> Ping1["GpsPing A (Context)"]
Ingest --> Ping2["GpsPing B (Context)"]
Ping1 -.-> Flyweight
Ping2 -.-> Flyweight`,
  },

  proxy: {
    title: 'Zero-Trust API Gateway Protection & Caching Proxy',
    scenario: 'Protecting downstream microservices by placing an authentication, rate-limiting, and Redis response-caching proxy in front of the billing service.',
    problem: 'Direct calls to microservices lack automated DDoS throttling, distributed caching, and zero-trust JWT credential validation.',
    solution: 'Implement a proxy sharing the BillingService interface that intercepts requests to enforce token validation and cache lookups before delegating.',
    whenToUse: [
      'Zero-trust network boundaries where authentication must precede service execution.',
      'Distributed response caching to reduce load on heavy backend microservices.',
    ],
    whenNotToUse: [
      'Internal in-memory calls where adding proxy overhead introduces latency with zero security gain.',
    ],
    asciiShape: `Client ──────► ApiGatewayBillingProxy ───(cache miss)───► Downstream Billing Service
                    │                                            (SQL database query)
                    ▼ (cache hit / 401 reject)
             Redis Cache / Fast Fail
             (zero backend load)`,
    typeScript: {
      fileName: 'ApiGatewayProxy.ts',
      explanation: 'BillingServiceProxy enforces token verification and caches responses before reaching real billing service.',
      code: `interface BillingService {
  getInvoice(invoiceId: string, token: string): Promise<string>;
}

class RealBillingService implements BillingService {
  async getInvoice(invoiceId: string): Promise<string> {
    console.log(\`[Database] Querying SQL datastore for invoice: \${invoiceId}\`);
    return \`Invoice #\${invoiceId} Total: $4,200.00 USD\`;
  }
}

class BillingServiceProxy implements BillingService {
  private cache = new Map<string, string>();

  constructor(private target: BillingService) {}

  async getInvoice(invoiceId: string, token: string): Promise<string> {
    // 1. Security pre-flight check
    if (!token || !token.startsWith("valid_jwt_")) {
      throw new Error("401 Unauthorized: Invalid Zero-Trust security token.");
    }

    // 2. Redis / In-Memory Cache inspection
    if (this.cache.has(invoiceId)) {
      console.log(\`[Cache Proxy] HIT: Serving cached invoice \${invoiceId}\`);
      return this.cache.get(invoiceId)!;
    }

    console.log(\`[Cache Proxy] MISS: Delegating to RealBillingService...\`);
    const invoice = await this.target.getInvoice(invoiceId, token);
    this.cache.set(invoiceId, invoice);
    return invoice;
  }
}

const proxy = new BillingServiceProxy(new RealBillingService());
(async () => {
  await proxy.getInvoice("inv_8412", "valid_jwt_token_123");
  await proxy.getInvoice("inv_8412", "valid_jwt_token_123"); // Cached!
})();`,
    },
    java: {
      fileName: 'ApiGatewayProxy.java',
      explanation: 'Java Protection and Caching Proxy enforcing authentication checks.',
      code: `public interface BillingService { String getInvoice(String id, String token); }
public class BillingProxy implements BillingService {
    private BillingService realService;
    public BillingProxy(BillingService s) { this.realService = s; }
    public String getInvoice(String id, String token) {
        if (!token.equals("valid")) throw new SecurityException("Denied");
        return realService.getInvoice(id, token);
    }
}`,
    },
    diagramUml: `classDiagram
direction LR
class BillingService {
  <<interface>>
  +getInvoice(id, token)
}
class RealBillingService
class BillingServiceProxy {
  -target: BillingService
  +getInvoice(id, token)
}
BillingService <|.. RealBillingService
BillingService <|.. BillingServiceProxy
BillingServiceProxy o--> RealBillingService`,
    diagramFlowchart: `flowchart LR
Client --> Proxy["BillingServiceProxy"]
Proxy -->|verify JWT| AuthCheck{Valid?}
AuthCheck -->|No| Reject["401 Unauthorized"]
AuthCheck -->|Yes| CacheCheck{In Cache?}
CacheCheck -->|Yes| CacheHit["Return Cache"]
CacheCheck -->|No| RealService["RealBillingService"]`,
  },

  'chain-of-responsibility': {
    title: 'Zero-Trust HTTP Security Filter Pipeline',
    scenario: 'Incoming HTTP requests entering a cloud service mesh must pass through sequential security gates: IP Allowlist → JWT Authentication → Rate Limiting → Request Sanitization.',
    problem: 'Hardcoding security checks inside controllers creates tight coupling and prevents dynamic reordering of security policies across environments.',
    solution: 'Structure security checks as a linked chain of handlers. Each handler evaluates the request and either rejects it or forwards it to the next handler.',
    whenToUse: [
      'When an API request must satisfy multiple sequential security or business validation criteria.',
      'When different endpoints require different filter pipelines configured at deployment time.',
    ],
    whenNotToUse: [
      'When execution must fan out in parallel or when handlers should not be allowed to abort the request.',
    ],
    asciiShape: `HTTP Request ──► IpAllowlistFilter ──► JwtAuthFilter ──► RateLimitFilter ──► Controller`,
    typeScript: {
      fileName: 'SecurityFilterChain.ts',
      explanation: 'Sequential security middleware chain validating requests in order.',
      code: `interface HttpRequestContext {
  ip: string;
  token?: string;
  requestsInWindow: number;
}

abstract class SecurityFilter {
  private next: SecurityFilter | null = null;
  setNext(filter: SecurityFilter): SecurityFilter { this.next = filter; return filter; }

  handle(req: HttpRequestContext): boolean {
    if (this.next) return this.next.handle(req);
    return true; // Passed all filters
  }
}

class IpFilter extends SecurityFilter {
  handle(req: HttpRequestContext): boolean {
    if (req.ip.startsWith("10.") || req.ip.startsWith("192.168.")) {
      console.log(\`[Security] IP \${req.ip} allowed.\`);
      return super.handle(req);
    }
    console.log(\`[Security] 403 Forbidden: IP \${req.ip} blocked.\`);
    return false;
  }
}

class RateLimitFilter extends SecurityFilter {
  handle(req: HttpRequestContext): boolean {
    if (req.requestsInWindow > 100) {
      console.log("[Security] 429 Too Many Requests: Rate limit exceeded.");
      return false;
    }
    console.log("[Security] Rate limit quota OK.");
    return super.handle(req);
  }
}

const pipeline = new IpFilter();
pipeline.setNext(new RateLimitFilter());
pipeline.handle({ ip: "10.0.1.45", requestsInWindow: 42 });`,
    },
    java: {
      fileName: 'SecurityFilterChain.java',
      explanation: 'Chain of Responsibility security filter pipeline in Java.',
      code: `public abstract class SecurityFilter {
    protected SecurityFilter next;
    public SecurityFilter linkWith(SecurityFilter next) { this.next = next; return next; }
    public boolean check(String ip) { return next == null || next.check(ip); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class SecurityFilter {
  -next: SecurityFilter
  +setNext(SecurityFilter)
  +handle(req)
}
class IpFilter
class RateLimitFilter
SecurityFilter <|-- IpFilter
SecurityFilter <|-- RateLimitFilter
SecurityFilter o--> SecurityFilter : next`,
    diagramFlowchart: `flowchart LR
Request --> F1["IP Allowlist Filter"]
F1 -->|pass| F2["JWT Auth Filter"]
F2 -->|pass| F3["Rate Limiting Filter"]
F3 -->|pass| Controller["Microservice Controller"]`,
  },

  command: {
    title: 'Distributed Sagas & Cloud Transaction Log',
    scenario: 'Multi-service e-commerce saga: Reserve Inventory → Charge Payment → Schedule Shipment, with automated compensation rollback if payment fails.',
    problem: 'Distributed actions cannot use single database locks; if step 2 fails after step 1 succeeded, state is corrupted without reversible action objects.',
    solution: 'Package each step as a Command with execute() and compensate() operations, stored in a transaction execution ledger.',
    whenToUse: [
      'Distributed saga workflows requiring reversible compensation logic across microservices.',
      'Audit logging and replayable event execution pipelines.',
    ],
    whenNotToUse: [
      'Simple read-only microservices that do not perform state mutations.',
    ],
    asciiShape: `SagaOrchestrator ──► ReserveInventoryCommand.execute()
                 ──► ChargePaymentCommand.execute() [Fails!]
                 ──► ReverseInventoryCommand.compensate() [Rollback]`,
    typeScript: {
      fileName: 'SagaCommand.ts',
      explanation: 'Commands support execute() and compensate() for resilient distributed transaction rollbacks.',
      code: `interface SagaCommand {
  name: string;
  execute(): Promise<boolean>;
  compensate(): Promise<void>;
}

class ReserveInventoryCommand implements SagaCommand {
  name = "ReserveInventory";
  async execute() {
    console.log("[Inventory Service] Reserved 2 units of SKU-8492.");
    return true;
  }
  async compensate() {
    console.log("[Inventory Service - ROLLBACK] Released reserved units for SKU-8492.");
  }
}

class ChargeCardCommand implements SagaCommand {
  name = "ChargeCard";
  async execute() {
    console.log("[Payment Gateway] Failed to charge credit card: Card Expired.");
    return false; // Triggers saga compensation
  }
  async compensate() {
    console.log("[Payment Gateway - ROLLBACK] Refund issued.");
  }
}

class SagaCoordinator {
  private history: SagaCommand[] = [];

  async run(commands: SagaCommand[]): Promise<void> {
    for (const cmd of commands) {
      this.history.push(cmd);
      const ok = await cmd.execute();
      if (!ok) {
        console.log(\`[Saga Failed] Aborting saga at \${cmd.name}. Initiating rollback...\`);
        await this.rollback();
        return;
      }
    }
  }

  private async rollback(): Promise<void> {
    // Reverse historical commands in LIFO order
    while (this.history.length > 0) {
      const cmd = this.history.pop()!;
      await cmd.compensate();
    }
  }
}

new SagaCoordinator().run([new ReserveInventoryCommand(), new ChargeCardCommand()]);`,
    },
    java: {
      fileName: 'SagaCommand.java',
      explanation: 'Saga Command in Java with compensation support for distributed transactions.',
      code: `public interface SagaCommand {
    boolean execute();
    void compensate();
}`,
    },
    diagramUml: `classDiagram
direction LR
class SagaCoordinator {
  -history: SagaCommand[]
  +run(SagaCommand[])
  +rollback()
}
class SagaCommand {
  <<interface>>
  +execute() boolean
  +compensate()
}
class ReserveInventory
class ChargePayment
SagaCoordinator o--> SagaCommand
SagaCommand <|.. ReserveInventory
SagaCommand <|.. ChargePayment`,
    diagramFlowchart: `flowchart LR
Saga --> C1["Reserve Inventory .execute()"]
C1 -->|success| C2["Charge Card .execute()"]
C2 -->|failure| Rollback["Compensate: Release Inventory"]`,
  },

  iterator: {
    title: 'DynamoDB / Large Cloud Datastore Cursor Paginator',
    scenario: 'Querying millions of log records from DynamoDB or Elasticsearch using pagination tokens (ExclusiveStartKey) without loading full tables into memory.',
    problem: 'Loading millions of cloud records into application memory causes out-of-memory crashes; clients must manually manage cursor tokens across requests.',
    solution: 'Encapsulate cloud pagination inside an Iterator that automatically fetches the next page from the database only when the client advances.',
    whenToUse: [
      'Streaming large datasets from remote paginated cloud APIs (DynamoDB, AWS S3 listObjectsV2, GitHub API).',
      'Hiding cursor tokens, page sizes, and network batching behind a clean hasNext() / next() interface.',
    ],
    whenNotToUse: [
      'Small in-memory collections where native array iterators are already optimal.',
    ],
    asciiShape: `DynamoDbStream ──► hasNext() / next() ──► Auto-fetches next page with ExclusiveStartKey`,
    typeScript: {
      fileName: 'DynamoCursorIterator.ts',
      explanation: 'CloudCursorIterator transparently fetches pages using pagination tokens.',
      code: `interface CloudRecordIterator<T> {
  hasNext(): Promise<boolean>;
  next(): Promise<T | null>;
}

class DynamoLogIterator implements CloudRecordIterator<string> {
  private buffer: string[] = [];
  private nextToken: string | null = "page_1";

  async hasNext(): Promise<boolean> {
    if (this.buffer.length > 0) return true;
    if (this.nextToken === null) return false;
    await this.fetchNextPage();
    return this.buffer.length > 0;
  }

  async next(): Promise<string | null> {
    if (!(await this.hasNext())) return null;
    return this.buffer.shift() || null;
  }

  private async fetchNextPage() {
    console.log(\`[DynamoDB] Querying next batch with ExclusiveStartKey: \${this.nextToken}\`);
    this.buffer = [\`Log record \${Math.random().toString(36).substring(7)}\`, \`Log record \${Math.random().toString(36).substring(7)}\`];
    this.nextToken = this.nextToken === "page_1" ? "page_2" : null; // Simulates 2 pages
  }
}

(async () => {
  const iterator = new DynamoLogIterator();
  while (await iterator.hasNext()) {
    console.log("Read item:", await iterator.next());
  }
})();`,
    },
    java: {
      fileName: 'DynamoCursorIterator.java',
      explanation: 'Cursor pagination iterator in Java for AWS DynamoDB API.',
      code: `public interface CloudIterator<T> { boolean hasNext(); T next(); }
public class DynamoIterator implements CloudIterator<String> {
    public boolean hasNext() { return true; }
    public String next() { return "Record"; }
}`,
    },
    diagramUml: `classDiagram
direction LR
class CloudRecordIterator {
  <<interface>>
  +hasNext() boolean
  +next() T
}
class DynamoLogIterator {
  -buffer: string[]
  -nextToken: string
  +fetchNextPage()
}
CloudRecordIterator <|.. DynamoLogIterator`,
    diagramFlowchart: `flowchart LR
Client --> Iterator["CloudRecordIterator.next()"]
Iterator --> BufferCheck{Buffer Empty?}
BufferCheck -->|No| Pop["Return Local Item"]
BufferCheck -->|Yes| Fetch["Fetch Page via ExclusiveStartKey"]`,
  },

  mediator: {
    title: 'Microservices Event Mesh / Saga Coordinator',
    scenario: 'E-commerce order fulfillment orchestrating OrderService, InventoryService, PaymentGateway, and ShippingService without direct point-to-point coupling.',
    problem: 'Microservices calling each other directly create a spaghetti web of tight dependencies where a failure in Shipping halts Order processing.',
    solution: 'Introduce an OrderFulfillmentMediator that coordinates all inter-service conversations centrally in response to workflow events.',
    whenToUse: [
      'Complex multi-service business workflows where services should remain decoupled specialists.',
      'Centralized auditability and workflow transition tracking in microservice architectures.',
    ],
    whenNotToUse: [
      'Simple workflows where an event bus or direct async message queue is cleaner.',
    ],
    asciiShape: `OrderService ──┐
Inventory    ──┼──► OrderFulfillmentMediator ──► Dispatches Workflow Steps
Payment      ──┘`,
    typeScript: {
      fileName: 'OrderFulfillmentMediator.ts',
      explanation: 'OrderFulfillmentMediator coordinates interactions between microservices.',
      code: `interface WorkflowMediator {
  notify(sender: string, event: string, payload: any): void;
}

class OrderFulfillmentMediator implements WorkflowMediator {
  notify(sender: string, event: string, payload: any) {
    if (sender === "OrderService" && event === "order_created") {
      console.log(\`[Mediator] Order \${payload.id} created. Requesting inventory hold...\`);
      this.triggerInventory(payload);
    } else if (sender === "InventoryService" && event === "inventory_reserved") {
      console.log(\`[Mediator] Inventory confirmed. Triggering payment capture...\`);
      this.triggerPayment(payload);
    }
  }

  private triggerInventory(p: any) { console.log("[InventoryService] Hold placed."); this.notify("InventoryService", "inventory_reserved", p); }
  private triggerPayment(p: any) { console.log("[PaymentService] $99.00 charged successfully."); }
}

const mediator = new OrderFulfillmentMediator();
mediator.notify("OrderService", "order_created", { id: "ord_9182", amount: 99.00 });`,
    },
    java: {
      fileName: 'OrderFulfillmentMediator.java',
      explanation: 'Mediator pattern in Java orchestrating microservice transactions.',
      code: `public interface WorkflowMediator { void notify(String service, String event); }
public class FulfillmentMediator implements WorkflowMediator {
    public void notify(String s, String e) { System.out.println("Mediated event: " + e + " from " + s); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class WorkflowMediator {
  <<interface>>
  +notify(sender, event)
}
class OrderFulfillmentMediator
class OrderService
class InventoryService
WorkflowMediator <|.. OrderFulfillmentMediator
OrderFulfillmentMediator --> OrderService
OrderFulfillmentMediator --> InventoryService`,
    diagramFlowchart: `flowchart LR
OrderService -->|order_created| Mediator["OrderFulfillmentMediator"]
Mediator --> InventoryService["Inventory Service (Reserve)"]
Mediator --> PaymentService["Payment Gateway (Charge)"]`,
  },

  memento: {
    title: 'Cloud Infrastructure State Drift / Rollback Snapshot',
    scenario: 'Infrastructure as Code deployment engine creating revision snapshots of Kubernetes cluster states before applying helm upgrades, enabling one-click rollback on failure.',
    problem: 'Directly querying and storing raw mutable Kubernetes cluster descriptors breaks state encapsulation and makes rollback reconciliation fragile.',
    solution: 'Cluster manager exports an opaque ClusterStateSnapshot memento. A DeploymentCaretaker stores snapshots and restores state upon deployment failure.',
    whenToUse: [
      'Rollback safety in deployment tools, configuration editors, or database transaction managers.',
      'Audit logging of exact historical system states before automated updates.',
    ],
    whenNotToUse: [
      'Massive distributed state graphs where deep snapshotting consumes terabytes of storage.',
    ],
    asciiShape: `K8sClusterManager ──► exportSnapshot() ──► DeploymentCaretaker
K8sClusterManager ◄── rollback(snapshot) ◄── DeploymentCaretaker`,
    typeScript: {
      fileName: 'ClusterRollbackMemento.ts',
      explanation: 'K8sClusterOriginator generates opaque ClusterStateSnapshot mementos managed by DeploymentCaretaker.',
      code: `class ClusterStateSnapshot {
  constructor(private readonly configPayload: string, public readonly revision: number) {}
  getRawPayload(): string { return this.configPayload; }
}

class K8sClusterOriginator {
  private activeConfig = "replicas=3,image=app:v1.0";
  private revisionCounter = 1;

  deploy(newConfig: string) {
    this.activeConfig = newConfig;
    this.revisionCounter++;
    console.log(\`[K8s] Applied revision \${this.revisionCounter}: \${this.activeConfig}\`);
  }

  saveSnapshot(): ClusterStateSnapshot {
    console.log(\`[Snapshot] Saved revision \${this.revisionCounter} checkpoint.\`);
    return new ClusterStateSnapshot(this.activeConfig, this.revisionCounter);
  }

  rollback(snapshot: ClusterStateSnapshot): void {
    this.activeConfig = snapshot.getRawPayload();
    console.log(\`[ROLLBACK] Reverted cluster to revision \${snapshot.revision}: \${this.activeConfig}\`);
  }
}

const cluster = new K8sClusterOriginator();
const v1Snapshot = cluster.saveSnapshot();

cluster.deploy("replicas=10,image=app:v2.0-broken");
cluster.rollback(v1Snapshot); // Instantly safe!`,
    },
    java: {
      fileName: 'ClusterRollbackMemento.java',
      explanation: 'Java Memento pattern saving opaque deployment revisions.',
      code: `public class ClusterSnapshot {
    private final String state;
    public ClusterSnapshot(String s) { this.state = s; }
    public String getState() { return state; }
}`,
    },
    diagramUml: `classDiagram
direction LR
class K8sClusterOriginator {
  -activeConfig
  +saveSnapshot(): ClusterStateSnapshot
  +rollback(ClusterStateSnapshot)
}
class ClusterStateSnapshot {
  -configPayload
  +getRawPayload()
}
class DeploymentCaretaker {
  -revisions: ClusterStateSnapshot[]
}
K8sClusterOriginator ..> ClusterStateSnapshot : creates
DeploymentCaretaker o--> ClusterStateSnapshot`,
    diagramFlowchart: `flowchart LR
DeployEngine -->|"saveSnapshot()"| Originator["K8s Cluster Originator"]
Originator -->|emits snapshot| Snapshot["ClusterStateSnapshot"]
Snapshot -->|saved in| Caretaker["DeploymentCaretaker"]
DeployEngine -->|"failure detected -> rollback()"| Originator`,
  },

  observer: {
    title: 'Event-Driven Microservices / Pub-Sub Message Bus',
    scenario: 'When an OrderCompleted event occurs, Billing, Shipping, Notification, and Analytics microservices receive notifications via an asynchronous event bus.',
    problem: 'Synchronous REST calls from the checkout service to 5 downstream microservices create high latency, tight coupling, and cascading failures if any service is down.',
    solution: 'The order service publishes an event to an EventBus subject. Subscribed microservice consumers handle events asynchronously.',
    whenToUse: [
      'Event-driven architectures (Kafka, RabbitMQ, AWS SNS/SQS event streams).',
      'Asynchronous cross-microservice notifications where publishers must not know consumer identities.',
    ],
    whenNotToUse: [
      'Strict synchronous workflows where the publisher cannot proceed without an immediate verified return value.',
    ],
    asciiShape: `OrderService ──► CloudEventBus.publish("order.completed")
                     ├──► BillingServiceConsumer
                     ├──► ShippingServiceConsumer
                     └──► AnalyticsDataLakeConsumer`,
    typeScript: {
      fileName: 'CloudEventBus.ts',
      explanation: 'CloudEventBus manages asynchronous subscriber dispatches across microservices.',
      code: `interface DomainEventConsumer {
  onEvent(eventType: string, payload: any): Promise<void>;
}

class CloudEventBus {
  private consumers = new Map<string, DomainEventConsumer[]>();

  subscribe(topic: string, consumer: DomainEventConsumer): void {
    const list = this.consumers.get(topic) || [];
    list.push(consumer);
    this.consumers.set(topic, list);
  }

  async publish(topic: string, payload: any): Promise<void> {
    console.log(\`[Kafka Bus] Topic "\${topic}" published event.\`);
    const list = this.consumers.get(topic) || [];
    await Promise.all(list.map(c => c.onEvent(topic, payload)));
  }
}

class ShippingConsumer implements DomainEventConsumer {
  async onEvent(t: string, p: any) { console.log(\`[Shipping] Dispatched shipment for order: \${p.orderId}\`); }
}
class AnalyticsConsumer implements DomainEventConsumer {
  async onEvent(t: string, p: any) { console.log(\`[Analytics] Logged telemetry for order: \${p.orderId}\`); }
}

const bus = new CloudEventBus();
bus.subscribe("order.completed", new ShippingConsumer());
bus.subscribe("order.completed", new AnalyticsConsumer());
bus.publish("order.completed", { orderId: "ord_1084", totalUsd: 149.50 });`,
    },
    java: {
      fileName: 'CloudEventBus.java',
      explanation: 'Asynchronous event bus in Java for microservice message publishing.',
      code: `public interface EventSubscriber { void onEvent(String topic, String msg); }
public class EventBus {
    private List<EventSubscriber> subs = new ArrayList<>();
    public void register(EventSubscriber s) { subs.add(s); }
    public void publish(String t, String m) { for (EventSubscriber s : subs) s.onEvent(t, m); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class CloudEventBus {
  -consumers: DomainEventConsumer[]
  +subscribe(topic, consumer)
  +publish(topic, payload)
}
class DomainEventConsumer {
  <<interface>>
  +onEvent(topic, payload)
}
class ShippingConsumer
class AnalyticsConsumer
CloudEventBus o--> DomainEventConsumer
DomainEventConsumer <|.. ShippingConsumer
DomainEventConsumer <|.. AnalyticsConsumer`,
    diagramFlowchart: `flowchart LR
OrderService -->|publish event| Bus["CloudEventBus (Kafka / SNS)"]
Bus --> Shipping["ShippingConsumer"]
Bus --> Analytics["AnalyticsConsumer"]
Bus --> Billing["BillingConsumer"]`,
  },

  state: {
    title: 'Resilient Microservice Circuit Breaker',
    scenario: 'Protecting cloud microservices calling unstable third-party APIs by dynamically switching state across Closed (normal), Open (failing/short-circuit), and Half-Open (trial recovery).',
    problem: 'Repeatedly calling a failing downstream service wastes threads, ties up network sockets, and leads to cascading failure across the entire service mesh.',
    solution: 'Model the circuit breaker as a State machine. The context delegates calls to the active state; states transition automatically based on failure counts and timers.',
    whenToUse: [
      'Protecting microservices from cascading failures when calling remote external APIs.',
      'Complex multi-state distributed systems (e.g. order fulfillment lifecycles, payment status machines).',
    ],
    whenNotToUse: [
      'Simple in-process calls that do not cross network boundaries.',
    ],
    asciiShape: `[ClosedState] ──(Failures > Threshold)──► [OpenState]
       ▲                                          │
       │                                          ▼
   (Success) ◄─────── [HalfOpenState] ◄───(Timer Expired)`,
    typeScript: {
      fileName: 'CircuitBreakerState.ts',
      explanation: 'CircuitBreaker delegates network calls to Closed, Open, or HalfOpen state objects.',
      code: `interface CircuitState {
  execute<T>(action: () => Promise<T>): Promise<T>;
}

class CircuitBreaker {
  public state: CircuitState;
  public failureCount = 0;

  constructor() { this.state = new ClosedState(this); }
  setState(s: CircuitState) { this.state = s; }
}

class ClosedState implements CircuitState {
  constructor(private cb: CircuitBreaker) {}
  async execute<T>(action: () => Promise<T>): Promise<T> {
    try {
      const res = await action();
      this.cb.failureCount = 0;
      return res;
    } catch (e) {
      this.cb.failureCount++;
      console.log(\`[Circuit] Failure detected (Count: \${this.cb.failureCount})\`);
      if (this.cb.failureCount >= 3) {
        console.log("[Circuit TRIPPED] Transitioning to OpenState.");
        this.cb.setState(new OpenState(this.cb));
      }
      throw e;
    }
  }
}

class OpenState implements CircuitState {
  constructor(private cb: CircuitBreaker) {}
  async execute<T>(): Promise<T> {
    console.log("[Circuit OPEN] Fast-fail rejected call without hitting downstream service.");
    throw new Error("503 Service Unavailable: Circuit Breaker Open.");
  }
}

const breaker = new CircuitBreaker();
(async () => {
  try {
    await breaker.state.execute(async () => { throw new Error("Connection Timeout"); });
  } catch (e) {}
})();`,
    },
    java: {
      fileName: 'CircuitBreakerState.java',
      explanation: 'Production Java State pattern implementing a microservice Circuit Breaker.',
      code: `public interface CircuitState { String call(Supplier<String> s); }
public class CircuitBreaker {
    private CircuitState state = new ClosedState(this);
    public void setState(CircuitState s) { this.state = s; }
    public String execute(Supplier<String> s) { return state.call(s); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class CircuitBreaker {
  -state: CircuitState
  +setState(CircuitState)
  +execute()
}
class CircuitState {
  <<interface>>
  +execute()
}
class ClosedState
class OpenState
class HalfOpenState
CircuitBreaker o--> CircuitState
CircuitState <|.. ClosedState
CircuitState <|.. OpenState
CircuitState <|.. HalfOpenState`,
    diagramFlowchart: `flowchart LR
Request --> CB["CircuitBreaker"]
CB --> State["Current CircuitState"]
State -->|Normal| Closed["ClosedState (Executes API Call)"]
State -->|Trip| Open["OpenState (Fast Fails 503)"]
State -->|Probe| HalfOpen["HalfOpenState (Canary Probe)"]`,
  },

  strategy: {
    title: 'Dynamic Multi-Vendor Payment Gateway Orchestrator',
    scenario: 'E-commerce platform dynamically routing checkout payments between Stripe, Adyen, and PayPal based on transaction currency, fraud score, and merchant fee tiers.',
    problem: 'Hardcoding vendor payment calls inside the checkout service with massive if/else ladders makes adding new payment providers risky and complex.',
    solution: 'Define a PaymentStrategy interface with processPayment(). Concrete strategy classes encapsulate vendor APIs, and the checkout context injects the selected strategy.',
    whenToUse: [
      'Dynamic multi-vendor routing based on geographic region, currency, or performance SLAs.',
      'Pluggable algorithmic options (e.g. Compression algorithms, Pricing engines, Recommendation models).',
    ],
    whenNotToUse: [
      'When there is only a single fixed vendor algorithm that will never change.',
    ],
    asciiShape: `CheckoutService (Context) ──► PaymentStrategy
                                  ├── StripeStrategy
                                  ├── AdyenStrategy
                                  └── PayPalStrategy`,
    typeScript: {
      fileName: 'PaymentGatewayStrategy.ts',
      explanation: 'CheckoutService context delegates payment execution to interchangeable vendor payment strategies.',
      code: `interface PaymentResult { success: boolean; transactionId: string; feeUsd: number; }

interface PaymentStrategy {
  charge(amountCents: number, currency: string): Promise<PaymentResult>;
}

class StripeStrategy implements PaymentStrategy {
  async charge(amountCents: number, currency: string): Promise<PaymentResult> {
    console.log(\`[Stripe API] Processed \${currency} \${amountCents / 100} with 3D-Secure auth.\`);
    return { success: true, transactionId: "ch_stripe_9841", feeUsd: 0.30 };
  }
}

class AdyenStrategy implements PaymentStrategy {
  async charge(amountCents: number, currency: string): Promise<PaymentResult> {
    console.log(\`[Adyen API] Processed European SEPA/Card transaction: \${amountCents / 100} \${currency}\`);
    return { success: true, transactionId: "ch_adyen_1241", feeUsd: 0.22 };
  }
}

class CheckoutService {
  constructor(private strategy: PaymentStrategy) {}
  setStrategy(s: PaymentStrategy) { this.strategy = s; }

  async completeCheckout(orderId: string, amountCents: number, currency: string) {
    console.log(\`[Checkout] Processing payment for Order \${orderId}...\`);
    const receipt = await this.strategy.charge(amountCents, currency);
    console.log(\`[Checkout] Confirmed transaction \${receipt.transactionId}\`);
  }
}

const checkout = new CheckoutService(new StripeStrategy());
checkout.completeCheckout("ord_9182", 4999, "USD");
checkout.setStrategy(new AdyenStrategy());
checkout.completeCheckout("ord_9183", 2400, "EUR");`,
    },
    java: {
      fileName: 'PaymentGatewayStrategy.java',
      explanation: 'Strategy pattern in Java encapsulating payment vendor integrations.',
      code: `public interface PaymentStrategy { void pay(int cents); }
public class StripeStrategy implements PaymentStrategy { public void pay(int c) { System.out.println("Stripe: " + c); } }
public class PaymentContext {
    private PaymentStrategy strategy;
    public PaymentContext(PaymentStrategy s) { this.strategy = s; }
    public void checkout(int c) { strategy.pay(c); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class CheckoutService {
  -strategy: PaymentStrategy
  +setStrategy(PaymentStrategy)
  +completeCheckout()
}
class PaymentStrategy {
  <<interface>>
  +charge(amount, currency)
}
class StripeStrategy
class AdyenStrategy
CheckoutService o--> PaymentStrategy
PaymentStrategy <|.. StripeStrategy
PaymentStrategy <|.. AdyenStrategy`,
    diagramFlowchart: `flowchart LR
Client --> Context["CheckoutService (Context)"]
Context --> Strategy["PaymentStrategy"]
Strategy --> Stripe["StripeStrategy (US / Credit)"]
Strategy --> Adyen["AdyenStrategy (EU / Direct)"]`,
  },

  'template-method': {
    title: 'Cloud Data ETL & Snowflake Ingestion Pipeline',
    scenario: 'Batch data ingestion pipeline extracting files from S3 or Kafka, executing invariant schema validation, applying specialized format transforms, and loading into Snowflake.',
    problem: 'Multiple data ingestion pipelines duplicate overall extraction and staging logic, differing only in custom data cleaning and format transformation steps.',
    solution: 'Define the invariant ETL algorithm skeleton in a base template method (runPipeline). Let subclasses override the transform() step for CSV, JSON, or Parquet.',
    whenToUse: [
      'Cloud data pipelines sharing identical extract, validate, and load stages with format-specific transformations.',
      'Batch deployment pipelines with fixed pre-flight, deploy, and post-flight health verification steps.',
    ],
    whenNotToUse: [
      'When pipelines have diverging steps that do not fit into a single linear workflow.',
    ],
    asciiShape: `BaseCloudPipeline.runPipeline() [Template Method]
   ├── extractFromStorage()
   ├── validateSchema()
   ├── transformRecords() [Hook overridden by ParquetPipeline / CsvPipeline]
   └── loadToSnowflake()`,
    typeScript: {
      fileName: 'CloudEtlPipeline.ts',
      explanation: 'BaseCloudPipeline enforces the invariant ETL flow while ParquetPipeline implements specialized transformation.',
      code: `abstract class BaseCloudPipeline {
  // Invariant Template Method
  async runPipeline(sourceUri: string): Promise<void> {
    console.log(\`=== Starting Ingestion: \${sourceUri} ===\`);
    const raw = await this.extractFromStorage(sourceUri);
    this.validateSchema(raw);
    const clean = await this.transformRecords(raw);
    await this.loadToDataWarehouse(clean);
    console.log("=== Ingestion Successfully Finished ===\\n");
  }

  protected async extractFromStorage(uri: string): Promise<string> {
    console.log(\`[S3 Extract] Read raw bytes from \${uri}\`);
    return "raw_payload_data";
  }

  protected validateSchema(data: string): void {
    console.log("[Validator] Schema conformance verified.");
  }

  // Hook for concrete format processors
  protected abstract transformRecords(raw: string): Promise<string[]>;

  protected async loadToDataWarehouse(records: string[]): Promise<void> {
    console.log(\`[Snowflake] Ingested \${records.length} transformed records.\`);
  }
}

class ParquetPipeline extends BaseCloudPipeline {
  protected async transformRecords(raw: string): Promise<string[]> {
    console.log("[Parquet Transformer] Decompressed Snappy columnar blocks.");
    return ["record_1", "record_2", "record_3"];
  }
}

new ParquetPipeline().runPipeline("s3://analytics-lake/events/2026-10-10.parquet");`,
    },
    java: {
      fileName: 'CloudEtlPipeline.java',
      explanation: 'Template Method pattern in Java executing cloud data ETL workflows.',
      code: `public abstract class CloudEtl {
    public final void run() { extract(); transform(); load(); }
    protected void extract() { System.out.println("S3 Extract"); }
    protected abstract void transform();
    protected void load() { System.out.println("Snowflake Load"); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class BaseCloudPipeline {
  +runPipeline()
  #extractFromStorage()
  #validateSchema()
  #transformRecords()*
  #loadToDataWarehouse()
}
class ParquetPipeline
BaseCloudPipeline <|-- ParquetPipeline`,
    diagramFlowchart: `flowchart LR
Job --> Template["runPipeline() [Template Method]"]
Template --> S1["extractFromStorage() (S3)"]
Template --> S2["validateSchema()"]
Template --> S3["transformRecords() (Parquet Subclass Hook)"]
Template --> S4["loadToDataWarehouse() (Snowflake)"]`,
  },

  visitor: {
    title: 'Cloud IaC Security & CIS Compliance Policy Linter',
    scenario: 'Auditing Terraform and CloudFormation Infrastructure-as-Code abstract syntax trees across S3, EC2, and IAM nodes to enforce CIS benchmark security rules without polluting resource classes.',
    problem: 'Adding new compliance checks (HIPAA, PCI-DSS, CIS Benchmarks) across dozens of cloud resource node types forces developers to pollute node classes with security rules.',
    solution: 'Resource nodes implement accept(Visitor). External security linters implement visitS3(), visitEc2(), visitIam() using double dispatch.',
    whenToUse: [
      'AST traversal in static analysis, compiler linting, or Infrastructure-as-Code policy checkers.',
      'Applying complex operational checks over stable heterogeneous object graphs.',
    ],
    whenNotToUse: [
      'When cloud resource types are constantly being added, because every new node type forces editing all visitor interfaces.',
    ],
    asciiShape: `CloudResource.accept(Visitor) ──► CisComplianceVisitor.visitS3Bucket(S3Node)
                                └──► CisComplianceVisitor.visitEc2Instance(Ec2Node)`,
    typeScript: {
      fileName: 'IacPolicyVisitor.ts',
      explanation: 'CisComplianceVisitor inspects heterogeneous cloud resource AST nodes without nodes knowing security policies.',
      code: `interface IacVisitor {
  visitS3(node: S3ResourceNode): void;
  visitEc2(node: Ec2ResourceNode): void;
}

interface CloudResourceAstNode {
  accept(v: IacVisitor): void;
}

class S3ResourceNode implements CloudResourceAstNode {
  constructor(public bucketName: string, public isPublic: boolean, public encrypted: boolean) {}
  accept(v: IacVisitor) { v.visitS3(this); }
}

class Ec2ResourceNode implements CloudResourceAstNode {
  constructor(public instanceId: string, public hasImdsV2: boolean) {}
  accept(v: IacVisitor) { v.visitEc2(this); }
}

class CisComplianceVisitor implements IacVisitor {
  visitS3(s3: S3ResourceNode) {
    if (s3.isPublic) console.log(\`[CIS ALARM] S3 \${s3.bucketName} has public read enabled!\`);
    if (!s3.encrypted) console.log(\`[CIS ALARM] S3 \${s3.bucketName} lacks SSE-KMS encryption!\`);
  }

  visitEc2(ec2: Ec2ResourceNode) {
    if (!ec2.hasImdsV2) console.log(\`[CIS ALARM] EC2 \${ec2.instanceId} permits legacy IMDSv1 metadata service!\`);
  }
}

const resources: CloudResourceAstNode[] = [
  new S3ResourceNode("company-customer-exports", true, false),
  new Ec2ResourceNode("i-081294812", false),
];

const linter = new CisComplianceVisitor();
resources.forEach(r => r.accept(linter));`,
    },
    java: {
      fileName: 'IacPolicyVisitor.java',
      explanation: 'Visitor pattern in Java auditing cloud infrastructure nodes.',
      code: `public interface IacVisitor { void visit(S3Node s); void visit(Ec2Node e); }
public interface IacNode { void accept(IacVisitor v); }
public class S3Node implements IacNode { public void accept(IacVisitor v) { v.visit(this); } }`,
    },
    diagramUml: `classDiagram
direction LR
class CloudResourceAstNode {
  <<interface>>
  +accept(IacVisitor)
}
class S3ResourceNode
class Ec2ResourceNode
class IacVisitor {
  <<interface>>
  +visitS3(S3ResourceNode)
  +visitEc2(Ec2ResourceNode)
}
class CisComplianceVisitor
CloudResourceAstNode <|.. S3ResourceNode
CloudResourceAstNode <|.. Ec2ResourceNode
IacVisitor <|.. CisComplianceVisitor`,
    diagramFlowchart: `flowchart LR
Linter --> Node["ResourceNode.accept(visitor)"]
Node -->|double dispatch| Visitor["CisComplianceVisitor.visitS3(this)"]
Visitor --> AuditReport["CIS Security Compliance Report"]`,
  },

  interpreter: {
    title: 'Dynamic Cloud SQL & Elasticsearch Boolean Filter Parser',
    scenario: 'SaaS multi-tenant analytics engine allowing users to execute dynamic boolean search expressions (e.g. region = "us-east-1" AND (status = 500 OR latency > 200)).',
    problem: 'Evaluating dynamic user-provided boolean queries without an expression grammar leads to unsafe eval() statements or unmaintainable string parsing regexes.',
    solution: 'Represent the grammar as an Abstract Syntax Tree of Terminal and NonTerminal Expression classes that evaluate boolean criteria against resource contexts.',
    whenToUse: [
      'Evaluating dynamic query filter languages, permission rules, or dynamic pricing formulas in SaaS platforms.',
    ],
    whenNotToUse: [
      'Complex query languages with full SQL syntax, where dedicated parser generators (e.g. ANTLR) are required.',
    ],
    asciiShape: `AndExpression(AND)
   ├── EqualityExpression(region == "us-east-1")
   └── OrExpression(OR)
         ├── EqualityExpression(status == 500)
         └── GreaterThanExpression(latency > 200)`,
    typeScript: {
      fileName: 'CloudQueryInterpreter.ts',
      explanation: 'Composite grammar expression tree evaluating boolean conditions against a cloud log record context.',
      code: `interface FilterExpression {
  evaluate(context: Record<string, any>): boolean;
}

class FieldEqualsExpression implements FilterExpression {
  constructor(private field: string, private expected: any) {}
  evaluate(ctx: Record<string, any>): boolean { return ctx[this.field] === this.expected; }
}

class AndExpression implements FilterExpression {
  constructor(private left: FilterExpression, private right: FilterExpression) {}
  evaluate(ctx: Record<string, any>): boolean { return this.left.evaluate(ctx) && this.right.evaluate(ctx); }
}

// Query: region === "us-east-1" AND status === 500
const query = new AndExpression(
  new FieldEqualsExpression("region", "us-east-1"),
  new FieldEqualsExpression("status", 500)
);

const logRecordA = { region: "us-east-1", status: 500, service: "gateway" };
const logRecordB = { region: "eu-west-1", status: 500, service: "gateway" };

console.log("Log A matched query?", query.evaluate(logRecordA)); // true
console.log("Log B matched query?", query.evaluate(logRecordB)); // false`,
    },
    java: {
      fileName: 'CloudQueryInterpreter.java',
      explanation: 'Interpreter pattern in Java parsing boolean cloud queries.',
      code: `public interface QueryExpr { boolean eval(Map<String, Object> ctx); }
public class EqualsExpr implements QueryExpr {
    private String key; private Object val;
    public EqualsExpr(String k, Object v) { this.key = k; this.val = v; }
    public boolean eval(Map<String, Object> ctx) { return val.equals(ctx.get(key)); }
}`,
    },
    diagramUml: `classDiagram
direction LR
class FilterExpression {
  <<interface>>
  +evaluate(context) boolean
}
class FieldEqualsExpression {
  -field: string
  -expected: any
  +evaluate(context) boolean
}
class AndExpression {
  -left: FilterExpression
  -right: FilterExpression
  +evaluate(context) boolean
}
FilterExpression <|.. FieldEqualsExpression
FilterExpression <|.. AndExpression`,
    diagramFlowchart: `flowchart LR
QueryEngine --> Root["AndExpression"]
Root --> Left["FieldEquals (region == 'us-east-1')"]
Root --> Right["FieldEquals (status == 500)"]
Root -->|"eval(record)"| MatchResult["true / false"]`,
  },
};
