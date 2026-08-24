import { useState, useMemo } from "react";
import { PRESETS, CATEGORIES, getPresetsByCategory, makeJob, makeStep } from "./presets";
import { GENERATORS } from "./generators";
import { LANGUAGES } from "./languages";
import { highlightYaml, highlightGroovy } from "./highlight";
import "./App.css";

const DEFAULT_JOBS = [makeJob("Frontend", "react"), makeJob("Backend", "dotnet")];

export default function App() {
  const [jobs, setJobs] = useState(DEFAULT_JOBS);
  const [platform, setPlatform] = useState("github");
  const [copied, setCopied] = useState(false);
  const [newJobName, setNewJobName] = useState("");
  const [newJobPreset, setNewJobPreset] = useState("react");

  function updateJob(id, patch) {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }

  function removeJob(id) {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }

  function applyPresetToJob(id, presetKey) {
    const preset = PRESETS[presetKey];
    updateJob(id, { presetKey, language: preset.language, version: preset.version, steps: preset.steps() });
  }

  function addJob() {
    const name = newJobName.trim() || PRESETS[newJobPreset].label;
    setJobs((prev) => [...prev, makeJob(name, newJobPreset)]);
    setNewJobName("");
  }

  function updateStep(jobId, stepId, field, value) {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, steps: j.steps.map((s) => (s.id === stepId ? { ...s, [field]: value } : s)) } : j
      )
    );
  }

  function removeStep(jobId, stepId) {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, steps: j.steps.filter((s) => s.id !== stepId) } : j)));
  }

  function addStep(jobId) {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, steps: [...j.steps, makeStep("New step", "echo hello")] } : j)));
  }

  function moveStep(jobId, index, dir) {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== jobId) return j;
        const steps = [...j.steps];
        const target = index + dir;
        if (target < 0 || target >= steps.length) return j;
        [steps[index], steps[target]] = [steps[target], steps[index]];
        return { ...j, steps };
      })
    );
  }

  const generator = GENERATORS[platform];
  const output = useMemo(() => generator.generate(jobs), [generator, jobs]);
  const highlighted = useMemo(
    () => (platform === "jenkins" ? highlightGroovy(output) : highlightYaml(output)),
    [output, platform]
  );

  function copyOutput() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadOutput() {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = generator.filename.split("/").pop();
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">⚙</span>
          <div>
            <h1>Pipeline Generator</h1>
            <p className="subtitle">Combine frontend, backend, and database jobs into one pipeline.</p>
          </div>
        </div>
        <div className="platform-tabs">
          {Object.entries(GENERATORS).map(([key, g]) => (
            <button key={key} className={"tab" + (platform === key ? " active" : "")} onClick={() => setPlatform(key)}>
              {g.label}
            </button>
          ))}
        </div>
      </header>

      <div className="layout">
        <div className="jobs-column">
          {jobs.map((job) => {
            const lang = LANGUAGES[job.language] || LANGUAGES.none;
            return (
              <div className="panel job-card" key={job.id}>
                <div className="job-head">
                  <input
                    className="job-name"
                    value={job.name}
                    onChange={(e) => updateJob(job.id, { name: e.target.value })}
                  />
                  <select
                    className="job-preset-select"
                    value={job.presetKey}
                    onChange={(e) => applyPresetToJob(job.id, e.target.value)}
                  >
                    {CATEGORIES.map((cat) => (
                      <optgroup key={cat.key} label={cat.label}>
                        {getPresetsByCategory(cat.key).map(([key, p]) => (
                          <option key={key} value={key}>{p.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button className="remove" onClick={() => removeJob(job.id)} title="Remove job">✕</button>
                </div>

                {lang.defaultVersion !== "" && (
                  <label className="version-field">
                    {lang.label} version
                    <input value={job.version} onChange={(e) => updateJob(job.id, { version: e.target.value })} />
                  </label>
                )}

                <div className="steps">
                  {job.steps.map((s, i) => (
                    <div className="step" key={s.id}>
                      <div className="step-order">
                        <button onClick={() => moveStep(job.id, i, -1)} disabled={i === 0} title="Move up">▲</button>
                        <button onClick={() => moveStep(job.id, i, 1)} disabled={i === job.steps.length - 1} title="Move down">▼</button>
                      </div>
                      <div className="step-fields">
                        <input
                          className="step-name"
                          value={s.name}
                          onChange={(e) => updateStep(job.id, s.id, "name", e.target.value)}
                          placeholder="Step name"
                        />
                        <input
                          className="step-command"
                          value={s.command}
                          onChange={(e) => updateStep(job.id, s.id, "command", e.target.value)}
                          placeholder="Command"
                        />
                      </div>
                      <button className="remove" onClick={() => removeStep(job.id, s.id)} title="Remove step">✕</button>
                    </div>
                  ))}
                  {job.steps.length === 0 && <p className="empty">No steps yet. Add one below.</p>}
                </div>
                <button className="add-step" onClick={() => addStep(job.id)}>+ Add step</button>
              </div>
            );
          })}

          <div className="panel add-job-card">
            <div className="section-head">
              <h2>Add a job</h2>
            </div>
            <div className="add-job-row">
              <input
                className="new-job-name"
                placeholder="Job name (optional)"
                value={newJobName}
                onChange={(e) => setNewJobName(e.target.value)}
              />
              <select value={newJobPreset} onChange={(e) => setNewJobPreset(e.target.value)}>
                {CATEGORIES.map((cat) => (
                  <optgroup key={cat.key} label={cat.label}>
                    {getPresetsByCategory(cat.key).map(([key, p]) => (
                      <option key={key} value={key}>{p.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <button className="primary-btn" onClick={addJob}>+ Add job</button>
            </div>
          </div>
        </div>

        <div className="panel output-panel">
          <div className="output-header">
            <span className="output-filename">{generator.filename}</span>
            <div className="output-actions">
              <button className="ghost-btn" onClick={copyOutput}>{copied ? "Copied ✓" : "Copy"}</button>
              <button className="primary-btn" onClick={downloadOutput}>Download</button>
            </div>
          </div>
          <pre className="output">
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
        </div>
      </div>
    </div>
  );
}
