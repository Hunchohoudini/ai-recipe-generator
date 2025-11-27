import { useState, FormEvent } from "react";
import "./App.css";

import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";

// Configure Amplify with the outputs from your sandbox
Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const ingredients = ingredientsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const { data, errors } = await client.queries.askBedrock({
        ingredients,
      });

      if (errors && errors.length) {
        setError(errors.map((e) => e.message).join(", "));
      } else if (data) {
        // BedrockResponse has { body, error }
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
      <div className="header-container">
        <h1 className="main-header">
          AI-Powered <span className="highlight">Recipe Generator</span>
        </h1>
        <p className="description">
          Enter a list of ingredients and let Claude 3 Sonnet suggest a recipe idea.
        </p>
      </div>

      <form className="form-container" onSubmit={handleSubmit}>
        <div className="search-container">
          <input
            className="wide-input"
            type="text"
            placeholder="e.g. chicken, garlic, rice, broccoli"
            value={ingredientsInput}
            onChange={(e) => setIngredientsInput(e.target.value)}
          />
          <button className="search-button" type="submit" disabled={loading}>
            {loading ? "Generating..." : "Generate Recipe"}
          </button>
        </div>
      </form>

      <div className="result-container">
        {loading && <div className="loader-container">Calling Bedrock…</div>}
        {error && (
          <div className="result">
            <strong>Error:</strong> {error}
          </div>
        )}
        {result && (
          <div className="result">
            <pre>{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

