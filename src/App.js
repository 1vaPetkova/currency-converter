import { useEffect, useState } from "react";

const currencies = ["USD", "EUR", "CAD", "BGN", "INR"];

export default function App() {
  const [amount, setAmount] = useState("");
  const [output, setOutput] = useState(0.0);
  const [inputCurrency, setInputCurrency] = useState("EUR");
  const [outputCurrency, setOutputCurrency] = useState("BGN");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      const controller = new AbortController();
      async function calculateOutput() {
        try {
          const result = await fetch(
            `https://api.frankfurter.app/latest?amount=${amount}&from=${inputCurrency}&to=${outputCurrency}`,
            { signal: controller.signal }
          );

          if (!result.ok) {
            throw new Error(
              "Something went wrong while fetching the amount! :("
            );
          }
          const data = await result.json();
          if (!data || !data.rates || !(outputCurrency in data.rates)) {
            throw new Error("No amount found! :(");
          }
          setOutput(data.rates[outputCurrency]);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (inputCurrency === outputCurrency) {
        return setOutput(amount);
      }
      calculateOutput();

      //Cleanup function
      return function () {
        controller.abort();
      };
    },
    [amount, inputCurrency, outputCurrency]
  );

  return (
    <div>
      <input
        type="number"
        min=""
        step="0.01"
        placeholder="0.00"
        onChange={(e) => setAmount(Number(e.target.value))}
        disabled={isLoading}
      />
      <select
        value={inputCurrency}
        onChange={(e) => {
          setInputCurrency(e.target.value);
        }}
        disabled={isLoading}
      >
        {currencies.map((c) => (
          <option value={c}>{c}</option>
        ))}
      </select>
      <select
        value={outputCurrency}
        onChange={(e) => {
          setOutputCurrency(e.target.value);
        }}
        disabled={isLoading}
      >
        {currencies.map((c) => (
          <option value={c}>{c}</option>
        ))}
      </select>
      {isLoading && <Loader />}
      {!isLoading && !error && (
        <p>
          {output.toFixed(2)} {outputCurrency}
        </p>
      )}
      {error && <ErrorMessage message={error} />}
    </div>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  );
}
