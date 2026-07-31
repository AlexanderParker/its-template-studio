import { useState } from "react";
import type { CompileOutcome } from "../compiler/browser";
import { exportPrompt } from "../compiler/io";

interface OutputPanelProps {
  outcome: CompileOutcome | null;
  compiling: boolean;
}

export function OutputPanel({ outcome, compiling }: OutputPanelProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  const copy = async (): Promise<void> => {
    if (!outcome?.prompt) return;
    await navigator.clipboard.writeText(outcome.prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="output" aria-label="Compiled prompt">
      <header className="output__header">
        <h2>Compiled prompt</h2>
        {outcome && (
          <span className={outcome.ok ? "output__status output__status--ok" : "output__status output__status--error"}>
            {outcome.engine === "browser"
              ? "its-compiler-js"
              : outcome.engine === "dotnet"
                ? "Its.Compiler (.NET)"
                : "its-compiler (Python)"}{" "}
            ·{" "}
            {outcome.durationMs.toFixed(0)} ms
          </span>
        )}
      </header>

      {compiling && <p className="output__placeholder">Compiling…</p>}

      {!compiling && !outcome && (
        <p className="output__placeholder">
          Choose a compiler and press Compile. The template, with the selected dataset's variables injected, becomes a
          structured AI prompt you can paste into any model.
        </p>
      )}

      {!compiling && outcome && !outcome.ok && (
        <div className="output__error" role="alert">
          <strong>Compilation failed</strong>
          <p>{outcome.error}</p>
        </div>
      )}

      {!compiling && outcome?.ok && outcome.prompt !== undefined && (
        <>
          {outcome.warnings.length > 0 && (
            <ul className="output__warnings">
              {outcome.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
          <pre className="output__prompt">{outcome.prompt}</pre>
          <div className="output__actions">
            <button type="button" onClick={() => void copy()}>
              {copied ? "Copied" : "Copy prompt"}
            </button>
            <button type="button" onClick={() => exportPrompt(outcome.prompt ?? "")}>
              Download .txt
            </button>
          </div>
        </>
      )}
    </section>
  );
}
