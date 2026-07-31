import { useEffect, useMemo, useRef, useState } from "react";
import type { ItsTemplate } from "its-template-editor";
import { TemplateEditor } from "its-template-editor";
import { compileInBrowser, type CompileOutcome } from "./compiler/browser";
import { compileOnServer, DEFAULT_DOTNET_URL, DEFAULT_SERVER_URL } from "./compiler/server";
import { exportTemplate, importTemplate } from "./compiler/io";
import { loadInstructionTypes, paletteForExtends, type LoadedInstructionTypes } from "./data/instructionTypes";
import { datasetsForTemplate, sampleDatasets } from "./data/sampleDatasets";
import { sampleTemplates } from "./data/sampleTemplates";
import { OutputPanel } from "./components/OutputPanel";

type Engine = "browser" | "server" | "dotnet";

export function App(): JSX.Element {
  const [template, setTemplate] = useState<ItsTemplate>(() =>
    structuredClone(sampleTemplates[0].template),
  );
  const [templateId, setTemplateId] = useState<string | null>(sampleTemplates[0].id);
  const [datasetId, setDatasetId] = useState("none");
  const [engine, setEngine] = useState<Engine>("browser");
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);
  const [dotnetUrl, setDotnetUrl] = useState(DEFAULT_DOTNET_URL);
  const [inlineTypes, setInlineTypes] = useState(false);
  const [outcome, setOutcome] = useState<CompileOutcome | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [loadedTypes, setLoadedTypes] = useState<LoadedInstructionTypes | null>(null);
  const [paletteSource, setPaletteSource] = useState<"live" | "bundled" | "mixed" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    void loadInstructionTypes().then((loaded) => {
      if (!cancelled) {
        setLoadedTypes(loaded);
        setPaletteSource(loaded.source);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // The palette only offers types from libraries this template extends;
  // custom types declared in the template are merged by the editor itself
  const paletteTypes = useMemo(
    () => paletteForExtends(loadedTypes, template.extends),
    [loadedTypes, template.extends],
  );

  const datasets = useMemo(() => datasetsForTemplate(templateId), [templateId]);
  const activeDataset = sampleDatasets.find((dataset) => dataset.id === datasetId) ?? sampleDatasets[0];

  const loadSample = (id: string): void => {
    const sample = sampleTemplates.find((entry) => entry.id === id);
    if (!sample) return;
    setTemplate(structuredClone(sample.template));
    setTemplateId(sample.id);
    setDatasetId("none");
    setOutcome(null);
    setImportError(null);
  };

  const handleImportFile = async (file: File): Promise<void> => {
    try {
      const imported = await importTemplate(file);
      setTemplate(imported);
      setTemplateId(null);
      setDatasetId("none");
      setOutcome(null);
      setImportError(null);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : String(error));
    }
  };

  const runCompile = async (): Promise<void> => {
    setCompiling(true);
    const variables = activeDataset.variables;
    const result =
      engine === "browser"
        ? await compileInBrowser(template, variables, { inlineTypes })
        : engine === "dotnet"
          ? await compileOnServer(dotnetUrl, template, variables, "dotnet")
          : await compileOnServer(serverUrl, template, variables);
    setOutcome(result);
    setCompiling(false);
  };

  return (
    <div className="app">
      <header className="app__header">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">([{'{'}&lt;</span>
          <div>
            <h1>ITS Template Studio</h1>
            <p>Build Instruction Template Specification templates visually, then compile them into AI prompts.</p>
          </div>
        </div>
        <div className="header__links">
          <a href="https://alexanderparker.github.io/instruction-template-specification/" target="_blank" rel="noreferrer">
            Specification
          </a>
          <a href="https://github.com/alexanderparker/its-compiler-js" target="_blank" rel="noreferrer">
            JS compiler
          </a>
          <a href="https://github.com/alexanderparker/its-compiler-python" target="_blank" rel="noreferrer">
            Python compiler
          </a>
          <a href="https://github.com/alexanderparker/its-compiler-dotnet" target="_blank" rel="noreferrer">
            .NET compiler
          </a>
        </div>
      </header>

      <div className="app__layout">
        <aside className="sidebar">
          <section className="panel">
            <h2>Template</h2>
            <label className="panel__field">
              <span>Load a sample</span>
              <select
                value={templateId ?? ""}
                onChange={(event) => loadSample(event.target.value)}
              >
                {templateId === null && <option value="">Imported template</option>}
                {sampleTemplates.map((sample) => (
                  <option key={sample.id} value={sample.id}>
                    {sample.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="panel__row">
              <button type="button" onClick={() => fileInputRef.current?.click()}>
                Import JSON
              </button>
              <button type="button" onClick={() => exportTemplate(template)}>
                Export JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleImportFile(file);
                  event.target.value = "";
                }}
              />
            </div>
            {importError && <p className="panel__error" role="alert">{importError}</p>}
          </section>

          <section className="panel">
            <h2>Dataset</h2>
            <p className="panel__hint">
              Datasets are variable sets injected at compile time. They override the template's own defaults, the same
              as passing a variables file to the compiler.
            </p>
            <label className="panel__field">
              <span>Inject variables</span>
              <select value={datasetId} onChange={(event) => setDatasetId(event.target.value)}>
                {datasets.map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.label}
                  </option>
                ))}
              </select>
            </label>
            {activeDataset.id !== "none" && (
              <pre className="panel__preview">{JSON.stringify(activeDataset.variables, null, 2)}</pre>
            )}
          </section>

          <section className="panel">
            <h2>Compile</h2>
            <div className="engine-toggle" role="radiogroup" aria-label="Compiler engine">
              <label className={engine === "browser" ? "engine engine--active" : "engine"}>
                <input
                  type="radio"
                  name="engine"
                  checked={engine === "browser"}
                  onChange={() => setEngine("browser")}
                />
                <span className="engine__name">Browser</span>
                <span className="engine__detail">its-compiler-js, runs locally in this page</span>
              </label>
              <label className={engine === "server" ? "engine engine--active" : "engine"}>
                <input
                  type="radio"
                  name="engine"
                  checked={engine === "server"}
                  onChange={() => setEngine("server")}
                />
                <span className="engine__name">Server (Python)</span>
                <span className="engine__detail">its-compiler via the bundled API</span>
              </label>
              <label className={engine === "dotnet" ? "engine engine--active" : "engine"}>
                <input
                  type="radio"
                  name="engine"
                  checked={engine === "dotnet"}
                  onChange={() => setEngine("dotnet")}
                />
                <span className="engine__name">Server (.NET)</span>
                <span className="engine__detail">Its.Compiler via the bundled API</span>
              </label>
            </div>

            {engine === "browser" && (
              <label className="panel__check">
                <input
                  type="checkbox"
                  checked={inlineTypes}
                  onChange={(event) => setInlineTypes(event.target.checked)}
                />
                <span>
                  Inline bundled type libraries (skip fetching the schemas; useful offline)
                </span>
              </label>
            )}

            {engine === "server" && (
              <label className="panel__field">
                <span>Server URL</span>
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(event) => setServerUrl(event.target.value)}
                  spellCheck={false}
                />
              </label>
            )}

            {engine === "dotnet" && (
              <label className="panel__field">
                <span>Server URL</span>
                <input
                  type="text"
                  value={dotnetUrl}
                  onChange={(event) => setDotnetUrl(event.target.value)}
                  spellCheck={false}
                />
              </label>
            )}

            <button type="button" className="compile-button" onClick={() => void runCompile()} disabled={compiling}>
              {compiling ? "Compiling…" : "Compile template"}
            </button>

            {(paletteSource === "bundled" || paletteSource === "mixed") && (
              <p className="panel__hint">
                {paletteSource === "bundled"
                  ? "Type library schemas could not be fetched; the editor palette is using bundled copies."
                  : "Some type library schemas could not be fetched; the editor palette is partly using bundled copies."}
              </p>
            )}
          </section>
        </aside>

        <main className="editor-pane">
          <TemplateEditor value={template} onChange={setTemplate} instructionTypes={paletteTypes} />
        </main>

        <OutputPanel outcome={outcome} compiling={compiling} />
      </div>
    </div>
  );
}
