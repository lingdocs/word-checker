import { FormEvent, useEffect, useState, MouseEvent } from "react";
import { useMediaQuery } from "react-responsive";
import { getTextFromShareTarget } from "./lib/text-from-share-target";
import Highlighter from "react-highlight-words";

function App() {
  const [text, setText] = useState<string>("");
  const [missing, setMissing] = useState<string[]>([]);
  const isBigScreen = useMediaQuery({ query: "(min-width: 500px)" });
  useEffect(() => {
    if (window.location.pathname === "/share-target") {
      setText(getTextFromShareTarget(window.location));
    }
  }, []);
  function handleCheck(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    fetch("https://account.lingdocs.com/dictionary/script-to-phonetics", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ text, accents: true }),
    }).then(res => res.json()).then(res => {
      if (res.ok) {
        // @ts-ignore
        setMissing(res.results.missing);
      } else {
        // @ts-ignore
        alert(res.error);
      }
    }).catch((e) => {
      console.error(e);
      alert("Connection or server error");
      setMissing([]);
    });
  }
  function handleClear() {
    setMissing([]);
    setText("");
  }
  function handlePaste() {
    navigator.clipboard.readText()
      .then(text => setText(prev => prev + text))
      .catch(console.error);
  }
  function handleCopy(s: string) {
    return () => navigator.clipboard.writeText(s);
  }
  return (
    <div className="container py-3" style={{ maxWidth: "45rem" }}>
      <h2 className="mb-4">Pashto Word Checker</h2>
      <p className="text-muted">Check which words are not present in the LingDocs Pashto Dictionary in a given text</p>
      <form onSubmit={handleCheck}>
        <div className="form-group mb-2">
          <label htmlFor="pashto-text">Pashto Text</label>
          <textarea
              className="form-control"
              id="pashto-text"
              rows={8}
              value={text}
              onChange={e => setText(e.target.value)}
              dir="rtl"
              spellCheck="false"
              autoCapitalize="false"
              autoComplete="false"
              autoCorrect="false"
          />
        </div>
        <div className="d-flex flex-row justify-content-between align-items-center">
          <button type="submit" className="btn btn-primary" disabled={!text}>
            Check
          </button>
          <div>
            {isBigScreen && <button type="button" onClick={handlePaste} className="btn btn-secondary me-2">
              Paste
            </button>}
            <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={!text}>
              Clear
            </button>
          </div>
        </div>
      </form>
      <div className="mt-3">
        {missing.length > 0 && <>
          <h5>Missing Words</h5>
          <div className="d-flex flex-row flex-wrap mb-2">
            {missing.map((m) => <button type="button" className="btn btn-light me-2" onClick={handleCopy(m)}>
              {m}
            </button>)}
          </div>
        </>}
      </div>
      <div className="mt-3 mb-4" style={{ direction: "rtl", whiteSpace: "pre-line" }}>
        <Highlighter
          searchWords={missing}
          textToHighlight={text}
        />
      </div>
    </div>
  );
}

export default App;
