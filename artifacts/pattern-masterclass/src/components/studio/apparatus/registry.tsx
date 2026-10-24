import React from 'react';
import type { StudioPerspective } from '../PerspectiveSwitch';
import type { MethodDispatch, GofRole } from '../CorrelationDock';
import { AbstractFactoryApparatus } from './AbstractFactoryApparatus';
import { ObserverApparatus } from './ObserverApparatus';
import { StrategyApparatus } from './StrategyApparatus';
import { Plate } from '../../../lib/anatomy/Plate';
import { Solid, Line } from '../../../lib/anatomy/Solid';
import { buildBasePlate } from '../kits/MechanicalKit';
import { buildServerRack } from '../kits/EnterpriseKit';
import { buildIsoWindow, buildIsoButton } from '../kits/CanonicalKit';
import type { Projection } from '../../../lib/anatomy/iso-kit';

const defaultP: Projection = {
  origin: [360, 220],
  scale: 1.5,
  azimuth: 45,
  elevation: 30,
};

export interface PatternApparatusConfig {
  id: string;
  name: string;
  category: 'Creational' | 'Structural' | 'Behavioral';
  roles: GofRole[];
  conceptSummary?: string;
  render: (props: {
    perspective: StudioPerspective;
    onPerspectiveChange?: (p: StudioPerspective) => void;
    theme?: string;
    onDispatch: (dispatch: MethodDispatch) => void;
  }) => React.ReactNode;
}

// Generic fallback apparatus utilizing composable kits for remaining patterns
function GenericDomainApparatus({
  patternId,
  patternName,
  category,
  perspective,
  theme,
  onDispatch,
}: {
  patternId: string;
  patternName: string;
  category: string;
  perspective: StudioPerspective;
  theme?: string;
  onDispatch: (dispatch: MethodDispatch) => void;
}) {
  const [activeStep, setActiveStep] = React.useState(0);
  const basePlate = React.useMemo(() => buildBasePlate({ x: -140, y: -70, w: 280, d: 140, r: 8 }, 10, 7, defaultP), []);
  const cloudRack = React.useMemo(() => buildServerRack({ x: -60, y: -50, w: 120, d: 90, r: 4 }, 0, 70, 3, defaultP), []);
  const desktopWin = React.useMemo(() => buildIsoWindow({ x: -120, y: -60, w: 240, d: 120, r: 6 }, 0, 'mac', defaultP), []);
  const button = React.useMemo(() => buildIsoButton({ x: -30, y: -10, w: 60, d: 24, r: 4 }, 8, 4, 'mac', defaultP), []);

  const handleInteract = () => {
    setActiveStep((s) => (s >= 3 ? 0 : s + 1));
    onDispatch({
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString(),
      caller: `${patternName.replace(/\s+/g, '')}Context`,
      method: 'executeOperation',
      status: 'ok',
      detail: `Transitioned ${patternName} to operational stage #${activeStep + 1} (${perspective}).`,
    });
  };

  if (perspective === 'enterprise') {
    return (
      <Plate
        fig={`FIG ${patternId.slice(0, 3).toUpperCase()}`}
        title={`${patternName.toUpperCase()} / CLOUD INFRASTRUCTURE TOPOLOGY`}
        category={category}
        hint="Click stage to trigger cloud operation event"
        readout={`STAGE: ${activeStep + 1}/4 · ENVIRONMENT: PROD-US-EAST · METRIC: OPERATIONAL`}
        theme={theme}
      >
        <g className="cursor-pointer" onClick={handleInteract}>
          <Solid paths={cloudRack.basePlate} tone="lo" />
          <Solid paths={cloudRack.chassis} tone="hi" lit={activeStep > 0}>
            {cloudRack.bays.map((bay, i) => (
              <Solid key={i} paths={bay} tone={i === activeStep ? 'hi' : 'mid'} lit={i === activeStep} />
            ))}
          </Solid>
        </g>
      </Plate>
    );
  }

  if (perspective === 'canonical') {
    return (
      <Plate
        fig={`FIG ${patternId.slice(0, 3).toUpperCase()}`}
        title={`${patternName.toUpperCase()} / DESKTOP OBJECT ALLOCATION & VTABLE`}
        category={category}
        hint="Click window button to trigger polymorphic method dispatch"
        readout={`HEAP REF: 0x7FFF · OBJECTS ALLOCATED: ${activeStep + 1} · GC: 0`}
        theme={theme}
      >
        <Solid paths={desktopWin.frame} tone="mid" />
        <Solid paths={desktopWin.titleBar} tone="hi" />
        <Line d={desktopWin.contentPane} tone="faint" />
        <g className="cursor-pointer" onClick={handleInteract}>
          <Solid paths={button.slab} tone="hi" lit={activeStep > 0} />
          <Line d={button.highlight} tone="lit" />
        </g>
      </Plate>
    );
  }

  return (
    <Plate
      fig={`FIG ${patternId.slice(0, 3).toUpperCase()}`}
      title={`${patternName.toUpperCase()} / PRECISION APPARATUS BENCH`}
      category={category}
      hint="Click apparatus to advance mechanical cycle"
      readout={`CYCLE: ${activeStep + 1}/4 · DETENT: INDEXED · TOLERANCE: ±0.01mm`}
      theme={theme}
    >
      <Solid paths={basePlate.slab} tone="mid" halo />
      <Line d={basePlate.groove} tone="faint" />
      <g className="cursor-pointer" onClick={handleInteract}>
        <Solid paths={cloudRack.bays[0]!} tone="hi" lit={activeStep > 0} />
      </g>
    </Plate>
  );
}

// Complete 23 GoF Pattern Registry
export const PATTERN_APPARATUS_REGISTRY: Record<string, PatternApparatusConfig> = {
  // --- 1. ABSTRACT FACTORY ---
  'abstract-factory': {
    id: 'abstract-factory',
    name: 'Abstract Factory',
    category: 'Creational',
    conceptSummary:
      'Guarantees that families of related or dependent objects (Compute + Storage, or Button + Checkbox) are created together without specifying their concrete classes, preventing cross-cloud or cross-OS mismatches.',
    roles: [
      { role: 'AbstractFactory', implementation: 'CloudResourceFactory / GUIFactory / VehicleFactory', description: 'Declares abstract creation interface for product families.' },
      { role: 'ConcreteFactory', implementation: 'AwsResourceFactory / MacFactory / ElectricVehicleFactory', description: 'Implements operations to create concrete matched products.' },
      { role: 'AbstractProductA', implementation: 'ComputeInstance (EC2) / Button / BatteryPack', description: 'Declares interface for primary product category.' },
      { role: 'AbstractProductB', implementation: 'StorageBucket (S3) / Checkbox / CockpitDash', description: 'Declares interface for secondary product category.' },
    ],
    render: (props) => <AbstractFactoryApparatus {...props} />,
  },

  // --- 2. OBSERVER ---
  'observer': {
    id: 'observer',
    name: 'Observer',
    category: 'Behavioral',
    roles: [
      { role: 'Subject', implementation: 'OrderService / StockTicker', description: 'Maintains observer list and notifies them upon state change.' },
      { role: 'Observer', implementation: 'EventSubscriber / ChartView', description: 'Defines an updating interface for objects.' },
      { role: 'ConcreteObserver', implementation: 'EmailService / LedgerService', description: 'Maintains state consistency with Subject.' },
    ],
    render: (props) => <ObserverApparatus {...props} />,
  },

  // --- 3. STRATEGY ---
  'strategy': {
    id: 'strategy',
    name: 'Strategy',
    category: 'Behavioral',
    roles: [
      { role: 'Strategy', implementation: 'RoutingAlgorithm / LoadBalancingPolicy', description: 'Common interface for supported algorithms.' },
      { role: 'ConcreteStrategy', implementation: 'FastestRoute / LeastConnections', description: 'Implements the algorithm using Strategy contract.' },
      { role: 'Context', implementation: 'Navigator / IngressGateway', description: 'Maintains reference to a Strategy object.' },
    ],
    render: (props) => <StrategyApparatus {...props} />,
  },

  // --- REMAINING 20 GOF PATTERNS ---
  'factory-method': {
    id: 'factory-method',
    name: 'Factory Method',
    category: 'Creational',
    roles: [
      { role: 'Creator', implementation: 'Dialog / LogisticsManager', description: 'Declares factory method returning Product.' },
      { role: 'ConcreteCreator', implementation: 'WindowsDialog / SeaLogistics', description: 'Overrides factory method to return concrete product.' },
      { role: 'Product', implementation: 'Button / Transport', description: 'Common product contract.' },
    ],
    render: (props) => <GenericDomainApparatus patternId="factory-method" patternName="Factory Method" category="Creational" {...props} />,
  },

  'builder': {
    id: 'builder',
    name: 'Builder',
    category: 'Creational',
    roles: [
      { role: 'Builder', implementation: 'DocumentBuilder / ClusterBuilder', description: 'Specifies abstract interface for creating parts.' },
      { role: 'ConcreteBuilder', implementation: 'PdfBuilder / AwsClusterBuilder', description: 'Constructs and assembles parts of complex object.' },
      { role: 'Director', implementation: 'DocumentConverter / CloudDirector', description: 'Constructs object using Builder interface.' },
    ],
    render: (props) => <GenericDomainApparatus patternId="builder" patternName="Builder" category="Creational" {...props} />,
  },

  'prototype': {
    id: 'prototype',
    name: 'Prototype',
    category: 'Creational',
    roles: [
      { role: 'Prototype', implementation: 'CloneableShape / VmSnapshot', description: 'Declares interface for cloning itself.' },
      { role: 'ConcretePrototype', implementation: 'Circle / WorkerInstance', description: 'Implements operation for cloning itself.' },
    ],
    render: (props) => <GenericDomainApparatus patternId="prototype" patternName="Prototype" category="Creational" {...props} />,
  },

  'singleton': {
    id: 'singleton',
    name: 'Singleton',
    category: 'Creational',
    roles: [
      { role: 'Singleton', implementation: 'ConnectionPool / LeaderElection', description: 'Defines instance operation letting clients access unique instance.' },
    ],
    render: (props) => <GenericDomainApparatus patternId="singleton" patternName="Singleton" category="Creational" {...props} />,
  },

  'adapter': {
    id: 'adapter',
    name: 'Adapter',
    category: 'Structural',
    roles: [
      { role: 'Target', implementation: 'PaymentProcessor / JsonProvider', description: 'Defines domain-specific interface Client uses.' },
      { role: 'Adaptee', implementation: 'StripeSdk / XmlFeed', description: 'Defines existing interface that needs adapting.' },
      { role: 'Adapter', implementation: 'StripePaymentAdapter', description: 'Adapts Adaptee interface to Target interface.' },
    ],
    render: (props) => <GenericDomainApparatus patternId="adapter" patternName="Adapter" category="Structural" {...props} />,
  },

  'bridge': {
    id: 'bridge',
    name: 'Bridge',
    category: 'Structural',
    roles: [
      { role: 'Abstraction', implementation: 'RemoteControl / NotificationService', description: 'Defines abstraction interface.' },
      { role: 'Implementor', implementation: 'Device / MessageProvider', description: 'Defines interface for implementation classes.' },
    ],
    render: (props) => <GenericDomainApparatus patternId="bridge" patternName="Bridge" category="Structural" {...props} />,
  },

  'composite': {
    id: 'composite',
    name: 'Composite',
    category: 'Structural',
    roles: [
      { role: 'Component', implementation: 'UiNode / IamEntity', description: 'Declares interface for objects in composition.' },
      { role: 'Leaf', implementation: 'Button / IamUser', description: 'Represents leaf objects in composition.' },
      { role: 'Composite', implementation: 'Panel / IamOrgUnit', description: 'Defines behavior for components having children.' },
    ],
    render: (props) => <GenericDomainApparatus patternId="composite" patternName="Composite" category="Structural" {...props} />,
  },

  'decorator': {
    id: 'decorator',
    name: 'Decorator',
    category: 'Structural',
    roles: [
      { role: 'Component', implementation: 'Beverage / HttpClient', description: 'Defines interface for objects that can have responsibilities added.' },
      { role: 'Decorator', implementation: 'MilkDecorator / AuthFilterDecorator', description: 'Maintains reference to Component object and defines matching interface.' },
    ],
    render: (props) => <GenericDomainApparatus patternId="decorator" patternName="Decorator" category="Structural" {...props} />,
  },

  'facade': {
    id: 'facade',
    name: 'Facade',
    category: 'Structural',
    roles: [
      { role: 'Facade', implementation: 'VideoConverter / CheckoutFacade', description: 'Delegates client requests to appropriate subsystem objects.' },
    ],
    render: (props) => <GenericDomainApparatus patternId="facade" patternName="Facade" category="Structural" {...props} />,
  },

  'flyweight': {
    id: 'flyweight',
    name: 'Flyweight',
    category: 'Structural',
    roles: [
      { role: 'Flyweight', implementation: 'TreeModel / CurrencyMetadata', description: 'Declares interface through which flyweights receive extrinsic state.' },
      { role: 'FlyweightFactory', implementation: 'TreeFactory / SymbolPool', description: 'Creates and manages flyweight objects.' },
    ],
    render: (props) => <GenericDomainApparatus patternId="flyweight" patternName="Flyweight" category="Structural" {...props} />,
  },

  'proxy': {
    id: 'proxy',
    name: 'Proxy',
    category: 'Structural',
    roles: [
      { role: 'Subject', implementation: 'Image / ApiService', description: 'Common contract for RealSubject and Proxy.' },
      { role: 'Proxy', implementation: 'VirtualImageProxy / GatewayProxy', description: 'Maintains reference to RealSubject and controls access.' },
    ],
    render: (props) => <GenericDomainApparatus patternId="proxy" patternName="Proxy" category="Structural" {...props} />,
  },

  'chain-of-responsibility': {
    id: 'chain-of-responsibility',
    name: 'Chain of Responsibility',
    category: 'Behavioral',
    roles: [
      { role: 'Handler', implementation: 'MiddlewareFilter / EventHandler', description: 'Defines interface for handling requests and optional successor link.' },
      { role: 'ConcreteHandler', implementation: 'AuthFilter / RateLimitFilter', description: 'Handles request or passes it to successor.' },
    ],
    render: (props) => <GenericDomainApparatus patternId="chain-of-responsibility" patternName="Chain of Responsibility" category="Behavioral" {...props} />,
  },

  'command': {
    id: 'command',
    name: 'Command',
    category: 'Behavioral',
    roles: [
      { role: 'Command', implementation: 'EditorCommand / SagaTransaction', description: 'Declares execution and undo interface.' },
      { role: 'Invoker', implementation: 'CommandHistory / Orchestrator', description: 'Asks command to carry out request.' },
    ],
    render: (props) => <GenericDomainApparatus patternId="command" patternName="Command" category="Behavioral" {...props} />,
  },

  'interpreter': {
    id: 'interpreter',
    name: 'Interpreter',
    category: 'Behavioral',
    roles: [
      { role: 'Expression', implementation: 'SqlExpression / RegoRule', description: 'Declares abstract Interpret operation.' },
    ],
    render: (props) => <GenericDomainApparatus patternId="interpreter" patternName="Interpreter" category="Behavioral" {...props} />,
  },

  'iterator': {
    id: 'iterator',
    name: 'Iterator',
    category: 'Behavioral',
    roles: [
      { role: 'Iterator', implementation: 'CollectionCursor / ApiPaginator', description: 'Defines interface for accessing and traversing elements.' },
    ],
    render: (props) => <GenericDomainApparatus patternId="iterator" patternName="Iterator" category="Behavioral" {...props} />,
  },

  'mediator': {
    id: 'mediator',
    name: 'Mediator',
    category: 'Behavioral',
    roles: [
      { role: 'Mediator', implementation: 'FormMediator / MessageBroker', description: 'Defines interface for communicating with Colleague objects.' },
    ],
    render: (props) => <GenericDomainApparatus patternId="mediator" patternName="Mediator" category="Behavioral" {...props} />,
  },

  'memento': {
    id: 'memento',
    name: 'Memento',
    category: 'Behavioral',
    roles: [
      { role: 'Originator', implementation: 'DocumentEditor / ClusterState', description: 'Creates memento containing snapshot of internal state.' },
      { role: 'Caretaker', implementation: 'SnapshotManager / BackupHistory', description: 'Safekeeps memento without operating on its contents.' },
    ],
    render: (props) => <GenericDomainApparatus patternId="memento" patternName="Memento" category="Behavioral" {...props} />,
  },

  'state': {
    id: 'state',
    name: 'State',
    category: 'Behavioral',
    roles: [
      { role: 'Context', implementation: 'OrderContext / DocumentLifecycle', description: 'Maintains instance of ConcreteState that defines current state.' },
      { role: 'State', implementation: 'PaidState / DraftState', description: 'Defines interface for encapsulating behavior.' },
    ],
    render: (props) => <GenericDomainApparatus patternId="state" patternName="State" category="Behavioral" {...props} />,
  },

  'template-method': {
    id: 'template-method',
    name: 'Template Method',
    category: 'Behavioral',
    roles: [
      { role: 'AbstractClass', implementation: 'DataMiner / CiPipelineTemplate', description: 'Defines abstract primitive operations and templateMethod skeleton.' },
    ],
    render: (props) => <GenericDomainApparatus patternId="template-method" patternName="Template Method" category="Behavioral" {...props} />,
  },

  'visitor': {
    id: 'visitor',
    name: 'Visitor',
    category: 'Behavioral',
    roles: [
      { role: 'Visitor', implementation: 'ExportVisitor / ComplianceScanner', description: 'Declares Visit operation for each ConcreteElement class.' },
    ],
    render: (props) => <GenericDomainApparatus patternId="visitor" patternName="Visitor" category="Behavioral" {...props} />,
  },
};
