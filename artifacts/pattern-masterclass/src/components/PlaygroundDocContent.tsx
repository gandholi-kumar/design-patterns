import React, { useState } from 'react';
import {
  Code2,
  Terminal,
  FileCode2,
  AlertTriangle,
  Copy,
  Check,
  CheckCircle2,
  Layers,
  Sparkles,
  Info,
  Clock,
  ShieldAlert,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export interface PlaygroundDocContentProps {
  activeLanguage: 'java' | 'typescript';
  onSelectLanguage?: (lang: 'java' | 'typescript') => void;
}

type DocTab = 'overview' | 'java' | 'typescript' | 'diagnostics';

export function PlaygroundDocContent({
  activeLanguage,
  onSelectLanguage,
}: PlaygroundDocContentProps) {
  const [tab, setTab] = useState<DocTab>(() =>
    activeLanguage === 'java' ? 'java' : 'typescript'
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const javaBoilerplate = `// PaymentService.java
public class PaymentService {
    public void processPayment(double amount) {
        System.out.println("Processing payment: $" + amount);
    }
}`;

  const tsBoilerplate = `// payment-service.ts
export class PaymentService {
    processPayment(amount: number): void {
        console.log(\`Processing payment: $\${amount}\`);
    }
}`;

  return (
    <div className="playground-doc-content">
      {/* Sub-navigation Tabs */}
      <nav className="playground-doc-tabs" role="tablist" aria-label="Documentation sections">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'overview'}
          className={`doc-tab-btn ${tab === 'overview' ? 'active' : ''}`}
          onClick={() => setTab('overview')}
        >
          <Layers size={13} />
          <span>Quick Start</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'java'}
          className={`doc-tab-btn ${tab === 'java' ? 'active' : ''}`}
          onClick={() => {
            setTab('java');
            onSelectLanguage?.('java');
          }}
        >
          <Code2 size={13} />
          <span>Java 25 LTS</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'typescript'}
          className={`doc-tab-btn ${tab === 'typescript' ? 'active' : ''}`}
          onClick={() => {
            setTab('typescript');
            onSelectLanguage?.('typescript');
          }}
        >
          <FileCode2 size={13} />
          <span>TypeScript</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'diagnostics'}
          className={`doc-tab-btn ${tab === 'diagnostics' ? 'active' : ''}`}
          onClick={() => setTab('diagnostics')}
        >
          <AlertTriangle size={13} />
          <span>Errors & Fixes</span>
        </button>
      </nav>

      {/* TAB 1: OVERVIEW & MULTI-FILE ARCHITECTURE */}
      {tab === 'overview' && (
        <section className="doc-section fade-in">
          <div className="doc-callout doc-callout-info">
            <Sparkles size={16} className="doc-callout-icon" />
            <div>
              <strong>Multi-File Virtual Workspace</strong>
              <p>
                The playground executes full modular projects rather than isolated code snippets.
                Interfaces, concrete classes, and client callers live in separate tabs and link together automatically.
              </p>
            </div>
          </div>

          <h3 className="doc-heading">1. Project Structure & Entry Points</h3>
          <p className="doc-text">
            Every GoF design pattern includes an official entry point file marked with the <span className="doc-badge-pill">⭐ Entry</span> badge:
          </p>
          <ul className="doc-list">
            <li>
              <strong>Java</strong>: Uses <code>Main.java</code> containing <code>public static void main(String[] args)</code>.
            </li>
            <li>
              <strong>TypeScript</strong>: Uses <code>index.ts</code> as the root orchestration script.
            </li>
          </ul>
          <p className="doc-caption">
            * Protected entry files cannot be renamed or deleted, ensuring the project always compiles and runs cleanly.
          </p>

          <h3 className="doc-heading">2. Multi-File Operations</h3>
          <div className="doc-card-grid">
            <div className="doc-card">
              <span className="doc-card-num">+ New File</span>
              <h4>Adding Files</h4>
              <p>
                Click <code>+ New File</code> in the tab strip. Extensions (<code>.java</code> or <code>.ts</code>) are auto-appended matching the active language mode.
              </p>
            </div>
            <div className="doc-card">
              <span className="doc-card-num">✏️ Rename</span>
              <h4>Renaming Files</h4>
              <p>
                Click the pencil icon on any non-entry tab (or double-click the tab label) to rename.
              </p>
            </div>
            <div className="doc-card">
              <span className="doc-card-num">✕ Delete</span>
              <h4>Deleting Files</h4>
              <p>
                Click the close icon on auxiliary tabs to remove them from project compilation.
              </p>
            </div>
            <div className="doc-card">
              <span className="doc-card-num">↺ Reset</span>
              <h4>Restoring Starter</h4>
              <p>
                Click <code>Reset</code> in the editor toolbar anytime to restore the pattern's pristine canonical starter files.
              </p>
            </div>
          </div>

          <h3 className="doc-heading">3. Keyboard Shortcuts</h3>
          <table className="doc-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Shortcut</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Compile & Run</strong></td>
                <td><kbd>Ctrl</kbd> + <kbd>Enter</kbd> / <kbd>Cmd</kbd> + <kbd>Enter</kbd></td>
                <td>Compiles all tabs and executes the entry point.</td>
              </tr>
              <tr>
                <td><strong>Word Wrap</strong></td>
                <td><kbd>Alt</kbd> + <kbd>Z</kbd></td>
                <td>Toggles soft code wrapping on or off.</td>
              </tr>
              <tr>
                <td><strong>Studio Focus</strong></td>
                <td><kbd>Alt</kbd> + <kbd>F</kbd></td>
                <td>Toggles full-width distraction-free view.</td>
              </tr>
              <tr>
                <td><strong>Indent Code</strong></td>
                <td><kbd>Tab</kbd></td>
                <td>Inserts 2 spaces without trapping keyboard focus.</td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {/* TAB 2: JAVA 25 LTS STANDARDS */}
      {tab === 'java' && (
        <section className="doc-section fade-in">
          <div className="doc-banner-java">
            <div className="doc-banner-icon">☕</div>
            <div>
              <strong>Java 25 LTS Execution Engine</strong>
              <p>
                Code runs through a genuine sandboxed backend JDK 25 runner. Standard output and compilation diagnostics are streamed live to the Terminal.
              </p>
            </div>
          </div>

          <h3 className="doc-heading">Rule 1: Class-to-Filename Matching Contract</h3>
          <p className="doc-text">
            Java strictly requires that any <code>public class X</code> must be located in a file named <code>X.java</code>.
          </p>
          <div className="doc-callout doc-callout-warning">
            <AlertTriangle size={15} className="doc-callout-icon" />
            <div>
              <strong>Package-Private Classes</strong>
              <p>
                If you define multiple classes in a single file, only ONE can be <code>public</code>. The others must omit the <code>public</code> keyword (package-private):
              </p>
            </div>
          </div>

          <h3 className="doc-heading">Rule 2: Zero-Import Default Package</h3>
          <p className="doc-text">
            All <code>.java</code> files in the playground are placed in the default package. <strong>You do NOT need import statements</strong> to reference classes in other tabs!
          </p>
          <div className="doc-code-block">
            <div className="doc-code-head">
              <span>Main.java</span>
              <button
                type="button"
                className="doc-copy-btn"
                onClick={() =>
                  handleCopy(
                    'java-main',
                    `public class Main {\n    public static void main(String[] args) {\n        PaymentService service = new PaymentService();\n        service.processPayment(99.0);\n    }\n}`
                  )
                }
              >
                {copiedKey === 'java-main' ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedKey === 'java-main' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre>
              <code>{`public class Main {
    public static void main(String[] args) {
        // PaymentService.java resolves automatically without import!
        PaymentService service = new PaymentService();
        service.processPayment(99.0);
    }
}`}</code>
            </pre>
          </div>

          <h3 className="doc-heading">Rule 3: Auxiliary Class Boilerplate</h3>
          <div className="doc-code-block">
            <div className="doc-code-head">
              <span>PaymentService.java</span>
              <button
                type="button"
                className="doc-copy-btn"
                onClick={() => handleCopy('java-helper', javaBoilerplate)}
              >
                {copiedKey === 'java-helper' ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedKey === 'java-helper' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre>
              <code>{javaBoilerplate}</code>
            </pre>
          </div>

          <h3 className="doc-heading">Runtime Limits & Capabilities</h3>
          <div className="doc-limits-grid">
            <div className="doc-limit-item">
              <Clock size={15} />
              <div>
                <strong>5.0s Timeout</strong>
                <span>Infinite loops auto-terminate.</span>
              </div>
            </div>
            <div className="doc-limit-item">
              <Terminal size={15} />
              <div>
                <strong>100 KB Buffer</strong>
                <span>Maximum console output size.</span>
              </div>
            </div>
            <div className="doc-limit-item">
              <ShieldAlert size={15} />
              <div>
                <strong>JDK 25 Libraries</strong>
                <span>Full access to java.util, java.io, etc.</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: TYPESCRIPT WEB WORKER STANDARDS */}
      {tab === 'typescript' && (
        <section className="doc-section fade-in">
          <div className="doc-banner-ts">
            <div className="doc-banner-icon">⚡</div>
            <div>
              <strong>TypeScript Browser Web Worker</strong>
              <p>
                Transpiles in-memory and resolves modules dynamically inside an isolated Web Worker for near-instant execution feedback.
              </p>
            </div>
          </div>

          <h3 className="doc-heading">Rule 1: Virtual Module System</h3>
          <p className="doc-text">
            Each tab is compiled into an in-memory virtual module registered under its base name without extension (e.g. <code>payment-service.ts</code> <span className="doc-inline-arrow">→</span> <code>'./payment-service'</code>).
          </p>

          <h3 className="doc-heading">Rule 2: Export & Relative Imports</h3>
          <p className="doc-text">
            Always declare symbols with <code>export</code>, and import them into <code>index.ts</code> using standard relative syntax:
          </p>
          <div className="doc-code-block">
            <div className="doc-code-head">
              <span>index.ts</span>
              <button
                type="button"
                className="doc-copy-btn"
                onClick={() =>
                  handleCopy(
                    'ts-import',
                    `import { PaymentService } from './payment-service';\n\nconst service = new PaymentService();\nservice.processPayment(150);`
                  )
                }
              >
                {copiedKey === 'ts-import' ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedKey === 'ts-import' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre>
              <code>{`import { PaymentService } from './payment-service';

const service = new PaymentService();
service.processPayment(150);`}</code>
            </pre>
          </div>

          <h3 className="doc-heading">Rule 3: Auxiliary Module Boilerplate</h3>
          <div className="doc-code-block">
            <div className="doc-code-head">
              <span>payment-service.ts</span>
              <button
                type="button"
                className="doc-copy-btn"
                onClick={() => handleCopy('ts-helper', tsBoilerplate)}
              >
                {copiedKey === 'ts-helper' ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedKey === 'ts-helper' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre>
              <code>{tsBoilerplate}</code>
            </pre>
          </div>

          <h3 className="doc-heading">Web Worker Constraints</h3>
          <ul className="doc-list">
            <li>
              <strong>No DOM APIs</strong>: <code>document</code>, <code>window</code>, and <code>HTMLElement</code> are undefined in Web Workers.
            </li>
            <li>
              <strong>Console Interception</strong>: <code>console.log()</code>, <code>console.warn()</code>, and <code>console.error()</code> stream cleanly to the Terminal pane.
            </li>
            <li>
              <strong>Async & Promises</strong>: Top-level <code>async/await</code> and Promises are fully supported.
            </li>
          </ul>
        </section>
      )}

      {/* TAB 4: COMMON ERRORS & INSTANT FIXES */}
      {tab === 'diagnostics' && (
        <section className="doc-section fade-in">
          <div className="doc-callout doc-callout-warning">
            <AlertTriangle size={16} className="doc-callout-icon" />
            <div>
              <strong>Troubleshooting Guide</strong>
              <p>
                Here are the most common compilation and runtime errors encountered in the playground and how to fix them in seconds.
              </p>
            </div>
          </div>

          <div className="doc-error-card">
            <span className="doc-error-tag java">JAVA</span>
            <h4>"class X is public, should be declared in a file named X.java"</h4>
            <p><strong>Cause:</strong> You declared <code>public class Foo</code> inside a file named something else (e.g. <code>Bar.java</code>).</p>
            <p className="doc-fix">
              <CheckCircle2 size={13} />
              <span><strong>Fix:</strong> Rename the tab to <code>Foo.java</code>, or remove the <code>public</code> modifier so it becomes <code>class Foo</code>.</span>
            </p>
          </div>

          <div className="doc-error-card">
            <span className="doc-error-tag java">JAVA</span>
            <h4>"cannot find symbol"</h4>
            <p><strong>Cause:</strong> A class or method referenced in <code>Main.java</code> does not exist, has a typo, or hasn't been saved in another tab.</p>
            <p className="doc-fix">
              <CheckCircle2 size={13} />
              <span><strong>Fix:</strong> Verify spelling of the class and method signatures across all open tabs.</span>
            </p>
          </div>

          <div className="doc-error-card">
            <span className="doc-error-tag ts">TYPESCRIPT</span>
            <h4>"Cannot find module './Foo'"</h4>
            <p><strong>Cause:</strong> The imported file name does not match any open tab in the project.</p>
            <p className="doc-fix">
              <CheckCircle2 size={13} />
              <span><strong>Fix:</strong> Check your tab names. If the tab is <code>Foo.ts</code>, import with <code>import &#123; ... &#125; from './Foo'</code>.</span>
            </p>
          </div>

          <div className="doc-error-card">
            <span className="doc-error-tag ts">TYPESCRIPT</span>
            <h4>"ReferenceError: document is not defined"</h4>
            <p><strong>Cause:</strong> Attempting to access browser DOM elements inside the Web Worker runtime.</p>
            <p className="doc-fix">
              <CheckCircle2 size={13} />
              <span><strong>Fix:</strong> The playground is a pure computational runtime. Use <code>console.log()</code> to inspect output.</span>
            </p>
          </div>

          <div className="doc-error-card">
            <span className="doc-error-tag universal">ALL RUNTIMES</span>
            <h4>"Execution timed out after 25000ms"</h4>
            <p><strong>Cause:</strong> An unbounded <code>while(true)</code> loop or unhandled recursion.</p>
            <p className="doc-fix">
              <CheckCircle2 size={13} />
              <span><strong>Fix:</strong> Ensure termination conditions are met in loops, or click <code>Reset</code> to revert to working code.</span>
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
