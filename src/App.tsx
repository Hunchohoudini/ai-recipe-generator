import type { FormEvent } from "react";
import "./App.css";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";

const client = generateClient<Schema>();

export default function App() {
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const ingredients = ingredientsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const { data, errors } = await client.queries.askBedrock({ ingredients });

      if (errors && errors.length) {
        setError(errors.map((er) => er.message).join(", "));
      } else if (data) {
        setResult(data.body || data.error || "No response from model.");
      } else {
        setError("No data returned from API.");
      }
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-container">
      <h1>AI Recipe Generator</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="chicken, garlic, rice..."
          value={ingredientsInput}
          onChange={(e) => setIngredientsInput(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Recipe"}
        </button>
      </form>

      {error && (
        <div>
          <strong>Error:</strong> {error}
        </div>
      )}
      {result && <pre>{result}</pre>}
    </div>
  );
}

