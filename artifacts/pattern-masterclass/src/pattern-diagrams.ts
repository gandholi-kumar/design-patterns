export type PatternDiagramDefinition = {
  uml: string;
  mermaid: string;
};

export const PATTERN_DIAGRAMS: Record<string, PatternDiagramDefinition> = {
  'factory-method': {
    uml: `classDiagram
direction LR
class Creator {
  +factoryMethod()
  +operation()
}
class ConcreteCreatorA {
  +factoryMethod()
}
class Product {
  <<interface>>
  +use()
}
class ConcreteProductA
Creator <|-- ConcreteCreatorA
Product <|.. ConcreteProductA
Creator ..> Product : creates`,
    mermaid: `flowchart LR
Client["Client"] -->|calls| Creator["Creator"]
Creator -->|factory method| ConcreteCreator["Concrete creator"]
ConcreteCreator -->|creates| Product["Concrete product"]
ConcreteProduct -.->|implements| ProductContract["Product interface"]`,
  },
  'abstract-factory': {
    uml: `classDiagram
direction LR
class AbstractFactory {
  <<interface>>
  +createCompute()
  +createStorage()
}
class AwsFactory
class GcpFactory
class Compute {
  <<interface>>
}
class Storage {
  <<interface>>
}
class AwsCompute
class AwsStorage
class GcpCompute
class GcpStorage
AbstractFactory <|.. AwsFactory
AbstractFactory <|.. GcpFactory
Compute <|.. AwsCompute
Compute <|.. GcpCompute
Storage <|.. AwsStorage
Storage <|.. GcpStorage
AwsFactory ..> AwsCompute : creates
AwsFactory ..> AwsStorage : creates
GcpFactory ..> GcpCompute : creates
GcpFactory ..> GcpStorage : creates`,
    mermaid: `flowchart LR
Client["Client"] --> Factory["Cloud factory"]
Factory -->|one provider family| Aws["AWS factory"]
Factory -->|one provider family| Gcp["GCP factory"]
Aws --> AwsProducts["AWS compute + storage"]
Gcp --> GcpProducts["GCP compute + storage"]`,
  },
  builder: {
    uml: `classDiagram
direction LR
class Director {
  +construct()
}
class Builder {
  <<interface>>
  +setParts()
  +build()
}
class RequestBuilder {
  +setUrl()
  +setHeaders()
  +build()
}
class Request
Director --> Builder : directs
Builder <|.. RequestBuilder
RequestBuilder ..> Request : creates`,
    mermaid: `flowchart LR
Client["Client"] --> Director["Director"]
Director -->|ordered steps| Builder["Builder"]
Builder -->|sets optional parts| Parts["Configured request"]
Parts -->|validated build| Product["Request product"]`,
  },
  prototype: {
    uml: `classDiagram
direction LR
class Prototype {
  <<interface>>
  +clone()
}
class ReportPrototype {
  +clone()
}
class Report
class Client
Prototype <|.. ReportPrototype
ReportPrototype ..> Report : copies
Client --> Prototype : requests clone`,
    mermaid: `flowchart LR
Client["Client"] -->|clone request| Prototype["Configured prototype"]
Prototype -->|copies state| Copy["New configured object"]
Copy -->|independent edits| Result["Customized copy"]`,
  },
  singleton: {
    uml: `classDiagram
direction LR
class ConfigRegistry {
  -instance
  -ConfigRegistry()
  +getInstance()
  +get()
  +set()
}
class Client
Client --> ConfigRegistry : shared access
ConfigRegistry --> ConfigRegistry : returns same instance`,
    mermaid: `flowchart LR
ModuleA["Module A"] --> Accessor["getInstance()"]
ModuleB["Module B"] --> Accessor
Accessor -->|same reference| Instance["Single shared registry"]
Instance --> Config["Shared configuration"]`,
  },
  adapter: {
    uml: `classDiagram
direction LR
class Client
class Target {
  <<interface>>
  +recordMetric()
}
class MetricsAdapter {
  +recordMetric()
}
class VendorSdk {
  +sendCounter()
}
Client --> Target : expects
Target <|.. MetricsAdapter
MetricsAdapter --> VendorSdk : translates to`,
    mermaid: `flowchart LR
Client["Telemetry client"] -->|recordMetric(name, value)| Target["Target contract"]
Target --> Adapter["Metrics adapter"]
Adapter -->|maps arguments| Vendor["Vendor SDK sendCounter()"]`,
  },
  bridge: {
    uml: `classDiagram
direction LR
class Abstraction {
  +notify()
}
class UrgentAlert {
  +notify()
}
class Delivery {
  <<interface>>
  +send()
}
class EmailDelivery
class SmsDelivery
Abstraction o--> Delivery : implementor
Abstraction <|-- UrgentAlert
Delivery <|.. EmailDelivery
Delivery <|.. SmsDelivery`,
    mermaid: `flowchart LR
Alert["Urgent alert"] -->|uses| Port["Delivery interface"]
Port --> Email["Email transport"]
Port --> Sms["SMS transport"]
Alert -->|independent variation| Routine["Message type"]`,
  },
  composite: {
    uml: `classDiagram
direction LR
class Component {
  <<interface>>
  +size()
}
class File {
  +size()
}
class Folder {
  +add()
  +size()
}
Component <|.. File
Component <|.. Folder
Folder "1" *-- "0..*" Component : children`,
    mermaid: `flowchart TD
Client["Client"] --> Root["Folder / composite"]
Root --> FileA["File / leaf"]
Root --> Nested["Nested folder / composite"]
Nested --> FileB["File / leaf"]
Root -->|same operation| Total["Recursive size()"]`,
  },
  decorator: {
    uml: `classDiagram
direction LR
class Component {
  <<interface>>
  +cost()
}
class Espresso {
  +cost()
}
class Decorator {
  +cost()
}
class OatMilk
class ExtraShot
Component <|.. Espresso
Component <|.. Decorator
Decorator o--> Component : wraps
Decorator <|-- OatMilk
Decorator <|-- ExtraShot`,
    mermaid: `flowchart LR
Client["Client"] -->|same component contract| Oat["Oat milk decorator"]
Oat --> Shot["Extra shot decorator"]
Shot --> Base["Espresso component"]
Base -->|result flows outward| Total["Cost + description"]`,
  },
  facade: {
    uml: `classDiagram
direction LR
class Client
class ExportFacade {
  +export()
}
class Codec {
  +encode()
}
class Storage {
  +upload()
}
class Metadata {
  +write()
}
Client --> ExportFacade : simple entry point
ExportFacade --> Codec
ExportFacade --> Storage
ExportFacade --> Metadata`,
    mermaid: `flowchart LR
Client["Client"] -->|one call| Facade["Export facade"]
Facade --> Codec["Codec"]
Facade --> Storage["Object storage"]
Facade --> Metadata["Metadata service"]
Facade --> Notify["Notification service"]`,
  },
  flyweight: {
    uml: `classDiagram
direction LR
class Client
class FlyweightFactory {
  +getFlyweight()
}
class Glyph {
  +draw(context)
}
class GlyphContext {
  +position
  +color
}
Client --> FlyweightFactory : requests shared object
FlyweightFactory --> Glyph : caches
GlyphContext --> Glyph : supplies extrinsic state`,
    mermaid: `flowchart LR
Client["Map renderer"] --> Factory["Flyweight factory"]
Factory -->|reuse by intrinsic key| Shared["Shared glyph + style"]
Client -->|position and label| Context["External context"]
Shared --> Draw["Render many labels"]
Context --> Draw`,
  },
  proxy: {
    uml: `classDiagram
direction LR
class Subject {
  <<interface>>
  +open()
}
class RemoteDocument {
  +open()
}
class PermissionProxy {
  +open()
  +checkAccess()
}
class Client
Subject <|.. RemoteDocument
Subject <|.. PermissionProxy
PermissionProxy --> RemoteDocument : delegates when allowed
Client --> Subject : uses`,
    mermaid: `flowchart LR
Client["Client"] --> Proxy["Access proxy"]
Proxy --> Check{"Permission allowed?"}
Check -->|yes| Real["Remote service"]
Check -->|no| Denied["Reject request"]
Real -->|response| Client`,
  },
  strategy: {
    uml: `classDiagram
direction LR
class Context {
  +execute()
}
class Strategy {
  <<interface>>
  +plan()
}
class FastRoute
class ScenicRoute
class TransitRoute
Context o--> Strategy : selected algorithm
Strategy <|.. FastRoute
Strategy <|.. ScenicRoute
Strategy <|.. TransitRoute`,
    mermaid: `flowchart LR
Client["Client"] -->|selects| Context["Navigator / context"]
Context --> Strategy["Route strategy"]
Strategy --> Fast["Fast route"]
Strategy --> Scenic["Scenic route"]
Strategy --> Transit["Transit route"]`,
  },
  observer: {
    uml: `classDiagram
direction LR
class Subject {
  <<interface>>
  +subscribe()
  +notify()
}
class Topic
class Observer {
  <<interface>>
  +update()
}
class EmailSubscriber
class AnalyticsSubscriber
Subject <|.. Topic
Observer <|.. EmailSubscriber
Observer <|.. AnalyticsSubscriber
Topic o--> Observer : subscribers`,
    mermaid: `flowchart LR
Publisher["Order event"] --> Subject["Subject"]
Subject -->|notify| Email["Email subscriber"]
Subject -->|notify| Inventory["Inventory subscriber"]
Subject -->|notify| Analytics["Analytics subscriber"]`,
  },
  command: {
    uml: `classDiagram
direction LR
class Invoker {
  +execute()
}
class Command {
  <<interface>>
  +execute()
  +undo()
}
class AppendCommand {
  +execute()
  +undo()
}
class Editor {
  +append()
}
Invoker o--> Command : stores or runs
Command <|.. AppendCommand
AppendCommand --> Editor : receiver`,
    mermaid: `flowchart LR
Client["Client"] -->|creates request object| Command["Append command"]
Invoker["Invoker / history"] -->|execute or undo| Command
Command -->|changes| Receiver["Editor receiver"]
Invoker -->|stores for later| History["Command history"]`,
  },
  state: {
    uml: `classDiagram
direction LR
class Context {
  +request()
  +changeState()
}
class State {
  <<interface>>
  +handle()
}
class Draft
class Moderation
class Published
Context o--> State : current state
State <|.. Draft
State <|.. Moderation
State <|.. Published
Draft ..> Moderation : transition`,
    mermaid: `flowchart LR
Context["Order / context"] --> Draft["Draft state"]
Draft -->|submit| Review["Review state"]
Review -->|approve| Paid["Paid state"]
Paid -->|ship| Shipped["Shipped state"]
Context -->|delegates current action| Draft`,
  },
  'chain-of-responsibility': {
    uml: `classDiagram
direction LR
class Handler {
  <<abstract>>
  +handle()
  +setNext()
}
class AuthHandler
class RateLimitHandler
class ValidationHandler
Handler <|-- AuthHandler
Handler <|-- RateLimitHandler
Handler <|-- ValidationHandler
Handler o--> Handler : next handler`,
    mermaid: `flowchart LR
Request["Request"] --> Auth["Authentication"]
Auth -->|pass| Rate["Rate limit"]
Rate -->|pass| Validate["Validation"]
Validate -->|pass| Service["Business handler"]
Auth -.->|reject| Stop["Stop"]
Rate -.->|reject| Stop
Validate -.->|reject| Stop`,
  },
  iterator: {
    uml: `classDiagram
direction LR
class Aggregate {
  <<interface>>
  +createIterator()
}
class TreeCollection
class Iterator {
  <<interface>>
  +hasNext()
  +next()
}
class TreeIterator
class Client
Aggregate <|.. TreeCollection
Iterator <|.. TreeIterator
TreeCollection ..> TreeIterator : creates
TreeIterator --> TreeCollection : traverses
Client --> Iterator : consumes`,
    mermaid: `flowchart LR
Client["Client"] -->|requests traversal| Collection["Collection"]
Collection -->|creates| Iterator["Iterator"]
Iterator -->|hasNext() / next()| Items["Elements in order"]
Iterator -.->|hides representation| Storage["Internal structure"]`,
  },
  mediator: {
    uml: `classDiagram
direction LR
class Mediator {
  <<interface>>
  +notify()
}
class ChatRoom
class Colleague {
  <<abstract>>
  +send()
}
class UserA
class UserB
Mediator <|.. ChatRoom
Colleague <|-- UserA
Colleague <|-- UserB
Colleague o--> Mediator : reports events`,
    mermaid: `flowchart LR
UserA["User A"] -->|sends message| Hub["Chat room mediator"]
Hub -->|routes message| UserB["User B"]
UserB -->|sends reply| Hub
Hub -->|routes reply| UserA`,
  },
  memento: {
    uml: `classDiagram
direction LR
class Originator {
  +createMemento()
  +restore()
}
class Memento {
  -snapshot
}
class Caretaker {
  +save()
  +undo()
}
Originator ..> Memento : creates and restores
Caretaker o--> Memento : stores opaque snapshot`,
    mermaid: `flowchart LR
Originator["Originator state"] -->|create snapshot| Token["Memento"]
Token -->|stored by| Caretaker["Caretaker history"]
Caretaker -->|restore token| Originator
Originator -->|resume prior state| Restored["Restored state"]`,
  },
  'template-method': {
    uml: `classDiagram
direction LR
class AbstractClass {
  <<abstract>>
  +templateMethod()
  +stepOne()
  +stepTwo()
}
class CsvPipeline
class JsonPipeline
class Client
AbstractClass <|-- CsvPipeline
AbstractClass <|-- JsonPipeline
Client --> AbstractClass : starts fixed workflow`,
    mermaid: `flowchart LR
Client["Client"] --> Template["Template method"]
Template --> StepA["Shared step: validate"]
StepA --> Hook{"Subclass hook"}
Hook --> Csv["CSV extraction"]
Hook --> Json["JSON extraction"]
Csv --> StepB["Shared step: load"]
Json --> StepB`,
  },
  visitor: {
    uml: `classDiagram
direction LR
class Element {
  <<interface>>
  +accept(visitor)
}
class TextNode
class ImageNode
class Visitor {
  <<interface>>
  +visitText()
  +visitImage()
}
class ExportVisitor
Element <|.. TextNode
Element <|.. ImageNode
Visitor <|.. ExportVisitor
TextNode ..> Visitor : dispatches
ImageNode ..> Visitor : dispatches`,
    mermaid: `flowchart LR
Client["Client"] -->|accept(visitor)| Node["Element node"]
Node -->|double dispatch| Visitor["Visitor operation"]
Visitor --> Text["visitText(node)"]
Visitor --> Image["visitImage(node)"]
Visitor --> Result["Export / lint / inspect"]`,
  },
  interpreter: {
    uml: `classDiagram
direction LR
class Expression {
  <<interface>>
  +interpret(context)
}
class NumberExpression
class AddExpression {
  +left
  +right
}
class Context
class Client
Expression <|.. NumberExpression
Expression <|.. AddExpression
AddExpression o--> Expression : child expressions
AddExpression --> Context : evaluates with
Client --> Expression : builds syntax tree`,
    mermaid: `flowchart LR
Input["Expression: 10 + 25"] --> Parse["Build expression tree"]
Parse --> Left["Terminal: 10"]
Parse --> Right["Terminal: 25"]
Left --> Eval["Interpret with context"]
Right --> Eval
Eval --> Result["Result: 35"]`,
  },
};
