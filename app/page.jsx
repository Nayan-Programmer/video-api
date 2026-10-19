 "use client";

import { useState } from "react";

function findMediaUrls(value, found = []) {
  if (!value) return found;
  if (typeof value === "string") {
    if (/^https?:\/\//i.test(value) && /\.(mp4|webm|mov)(?:[?#].*)?$/i.test(value)) {
      found.push(value);
    }
    return found;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => findMediaUrls(item, found));
    return found;
  }
  if (typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (["url", "path", "video", "src"].includes(key.toLowerCase())) {
        if (typeof child === "string" && /^https?:\/\//i.test(child)) {
          found.push(child);
        } else {
          findMediaUrls(child, found);
        }
      } else {
        findMediaUrls(child, found);
      }
    }
  }
  return found;
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed.");
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const mediaUrls = result ? [...new Set(findMediaUrls(result.result))] : [];

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand-mark">▶</div>
        <div>
          <p className="eyebrow">OPEN MODEL PLAYGROUND</p>
          <h1>Text to <span>Video</span></h1>
        </div>
        <div className="free-pill">FREE-ACCESS PROVIDER</div>
      </header>

      <section className="hero">
        <p className="eyebrow">TURN AN IDEA INTO A CLIP</p>
        <h2>Your words.<br /><span>Moving pictures.</span></h2>
        <p className="intro">
          Write a scene and send it to the Gradio text-to-video Space configured by the site owner.
          Free access depends on that Space&apos;s current availability and limits.
        </p>
      </section>

      <section className="workspace">
        <form onSubmit={submit} className="prompt-card">
          <label htmlFor="prompt">Describe your video</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            maxLength={1000}
            minLength={3}
            required
            placeholder="A cinematic aerial shot over a futuristic city at golden hour, clouds drifting between glass towers..."
          />
          <div className="form-footer">
            <span>{prompt.length}/1000 characters</span>
            <button disabled={busy || prompt.trim().length < 3}>
              {busy ? <><span className="spinner" /> Generating…</> : "Generate video →"}
            </button>
          </div>
          <p className="small-note">No paid fallback is configured. If the free Space is busy or unavailable, the request may fail.</p>
        </form>

        <section className="output-card" aria-live="polite">
          <div className="output-heading">
            <div><p className="eyebrow">YOUR RESULT</p><h3>Preview</h3></div>
            <span className="status-dot">{busy ? "WORKING" : result ? "READY" : "IDLE"}</span>
          </div>
          {busy ? (
            <div className="empty-state"><div className="loader-ring" /><p>Waiting for the provider…</p><span>Video generation can take several minutes.</span></div>
          ) : error ? (
            <div className="error-state"><strong>Could not generate video</strong><p>{error}</p><span>Check your Space ID, endpoint, inputs, and free availability.</span></div>
          ) : mediaUrls.length ? (
            <div className="video-results">
              {mediaUrls.map((url) => <video key={url} src={url} controls playsInline />)}
            </div>
          ) : result ? (
            <div className="raw-result">
              <p>Provider responded. Its output may need a small adapter for this Space.</p>
              <pre>{JSON.stringify(result.result, null, 2)}</pre>
            </div>
          ) : (
            <div className="empty-state">
              <div className="play-outline">▶</div>
              <p>Your video will appear here</p>
              <span>First configure a compatible free-access Space.</span>
            </div>
          )}
        </section>
      </section>

      <footer>
        <span>Built with Next.js + Gradio Client</span>
        <span>Free access is not unlimited access.</span>
      </footer>
    </main>
  );
}
