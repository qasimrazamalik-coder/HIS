import React from "react";
import ReactDOM from "react-dom/client";
import { Bot, FileText, LockKeyhole, LogOut, Search, Send, ShieldCheck, UploadCloud } from "lucide-react";
import "./styles.css";

const apiUrl = import.meta.env.VITE_RAG_API_URL ?? "http://localhost:8100";

type Source = {
  source: string;
  chunk_id: string;
  text: string;
  score?: number;
};

type Message = {
  question: string;
  answer: string;
  sources: Source[];
  cached: boolean;
};

function App() {
  const [token, setToken] = React.useState(localStorage.getItem("rag_token") ?? "");
  const [role, setRole] = React.useState(localStorage.getItem("rag_role") ?? "");

  const saveSession = (nextToken: string, nextRole: string) => {
    localStorage.setItem("rag_token", nextToken);
    localStorage.setItem("rag_role", nextRole);
    setToken(nextToken);
    setRole(nextRole);
  };

  const logout = () => {
    localStorage.removeItem("rag_token");
    localStorage.removeItem("rag_role");
    setToken("");
    setRole("");
  };

  return (
    <main className="app-shell">
      <aside>
        <div className="brand">
          <Bot aria-hidden />
          <div>
            <strong>AI Support Agent</strong>
            <span>RAG knowledge assistant</span>
          </div>
        </div>
        <div className="status-card">
          <ShieldCheck aria-hidden />
          <span>{token ? `Signed in as ${role}` : "Sign in to ask questions"}</span>
        </div>
        {token && (
          <button className="ghost" onClick={logout}>
            <LogOut aria-hidden /> Sign out
          </button>
        )}
      </aside>

      <section className="workspace">
        {!token ? <LoginForm onLogin={saveSession} /> : <AgentWorkspace token={token} role={role} />}
      </section>
    </main>
  );
}

function LoginForm({ onLogin }: { onLogin: (token: string, role: string) => void }) {
  const [email, setEmail] = React.useState("admin@example.com");
  const [password, setPassword] = React.useState("admin12345");
  const [error, setError] = React.useState("");

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      setError("Invalid email or password");
      return;
    }
    const body = await response.json();
    onLogin(body.access_token, body.role);
  };

  return (
    <section className="auth-panel">
      <LockKeyhole aria-hidden />
      <h1>Secure Knowledge Base Login</h1>
      <form onSubmit={login}>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">
          <ShieldCheck aria-hidden /> Continue
        </button>
      </form>
    </section>
  );
}

function AgentWorkspace({ token, role }: { token: string; role: string }) {
  const [question, setQuestion] = React.useState("What does the refund policy say?");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState("");
  const [documents, setDocuments] = React.useState<{ source: string; chunks: number }[]>([]);

  const authHeaders = React.useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const refreshDocuments = React.useCallback(async () => {
    const response = await fetch(`${apiUrl}/documents`, { headers: authHeaders });
    if (response.ok) {
      const body = await response.json();
      setDocuments(body.documents ?? []);
    }
  }, [authHeaders]);

  React.useEffect(() => {
    void refreshDocuments();
  }, [refreshDocuments]);

  const ask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!question.trim()) return;
    setIsLoading(true);
    const response = await fetch(`${apiUrl}/query`, {
      method: "POST",
      headers: { ...authHeaders, "content-type": "application/json" },
      body: JSON.stringify({ question, top_k: 5 })
    });
    setIsLoading(false);
    if (!response.ok) return;
    const body = await response.json();
    setMessages((items) => [{ question, answer: body.answer, sources: body.sources, cached: body.cached }, ...items]);
  };

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    const form = new FormData();
    Array.from(files).forEach((file) => form.append("files", file));
    setUploadStatus("Uploading and indexing...");
    const response = await fetch(`${apiUrl}/documents/upload`, { method: "POST", headers: authHeaders, body: form });
    if (!response.ok) {
      setUploadStatus("Upload failed. Admin role is required.");
      return;
    }
    const body = await response.json();
    setUploadStatus(`Indexed ${body.chunks} chunks from ${body.files} uploaded file(s).`);
    await refreshDocuments();
  };

  return (
    <>
      <header className="hero">
        <div>
          <p>Retrieval augmented generation</p>
          <h1>Ask trustworthy questions across your documents</h1>
        </div>
        {role === "admin" && (
          <label className="upload-button">
            <UploadCloud aria-hidden /> Upload documents
            <input type="file" multiple accept=".pdf,.docx,.txt,.md" onChange={upload} />
          </label>
        )}
      </header>

      <section className="grid">
        <section className="chat-panel">
          <form className="question-box" onSubmit={ask}>
            <Search aria-hidden />
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={3} />
            <button disabled={isLoading} type="submit">
              <Send aria-hidden /> {isLoading ? "Thinking" : "Ask"}
            </button>
          </form>
          {uploadStatus && <p className="notice">{uploadStatus}</p>}

          <div className="answers">
            {messages.map((message, index) => (
              <article className="answer-card" key={`${message.question}-${index}`}>
                <div className="answer-heading">
                  <strong>{message.question}</strong>
                  {message.cached && <span>cached</span>}
                </div>
                <p>{message.answer}</p>
                <div className="sources">
                  {message.sources.map((source) => (
                    <details key={source.chunk_id}>
                      <summary>
                        {source.source} · {source.chunk_id}
                      </summary>
                      <mark>{source.text}</mark>
                    </details>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="documents-panel">
          <h2>Knowledge Base</h2>
          {documents.length === 0 ? (
            <p>No indexed documents yet. Upload files as admin or mount a document folder and run ingest.</p>
          ) : (
            documents.map((document) => (
              <div className="document-row" key={document.source}>
                <FileText aria-hidden />
                <span>{document.source}</span>
                <strong>{document.chunks}</strong>
              </div>
            ))
          )}
        </aside>
      </section>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

