export type Category = 'Creational' | 'Structural' | 'Behavioral';
export type Perspective = 'canonical' | 'enterprise';

export interface CodeImplementation {
  fileName: string;
  explanation: string;
  code: string;
}

export interface DomainVariant {
  title: string;
  scenario: string;
  problem: string;
  solution: string;
  whenToUse: string[];
  whenNotToUse: string[];
  typeScript: CodeImplementation;
  java: CodeImplementation;
  asciiShape: string;
  diagramUml: string;
  diagramFlowchart: string;
}

export interface SolidAssessment {
  principle:
    | 'Single Responsibility Principle'
    | 'Open/Closed Principle'
    | 'Liskov Substitution Principle'
    | 'Interface Segregation Principle'
    | 'Dependency Inversion Principle';
  impact: 'adheres' | 'trades-off';
  explanation: string;
}

export interface PatternRelation {
  targetPattern: string;
  keyDifference: string;
  decisionRule: string;
}

export interface Pattern {
  id: string;
  name: string;
  category: Category;
  tagline: string;
  intent: string;
  memoryHook: string;
  canonical: DomainVariant;
  enterprise: DomainVariant;
  solidPrinciples: SolidAssessment[];
  confusedWith: PatternRelation[];
  interviewTraps: string[];

  // Backward-compatible properties derived from active/default perspective
  problem: string;
  solution: string;
  whenToUse: string[];
  whenNotToUse: string[];
  realWorldEnterpriseScenario: string;
  asciiShape: string;
  javaImplementation: CodeImplementation;
  typeScriptImplementation: CodeImplementation;
  runnableCode: string;
}

export type QuizOption = {
  id: string;
  patternName: string;
  isCorrect: boolean;
  distractorRationale: string;
};

export type Question = {
  id: string;
  scenarioNumber: number;
  category: string;
  difficulty: string;
  title: string;
  systemScenario: string;
  architecturalConstraints: string[];
  options: QuizOption[];
  correctPattern: string;
  deepExplanation: string;
  memoryRule: string;
};
