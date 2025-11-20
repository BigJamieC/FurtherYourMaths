document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.getElementById("lp-input");
  const parseBtn = document.getElementById("parse-problem");
  const output = document.getElementById("parsed-result");

  // -------------------------
  // Symbol insertion buttons
  // -------------------------
  document.querySelectorAll(".symbol-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const symbol = btn.dataset.symbol || btn.textContent;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      textarea.value = text.slice(0, start) + symbol + text.slice(end);
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + symbol.length;
    });
  });

  // -------------------------
  // Helpers / Normalization
  // -------------------------
  // Normalize raw user text: unify symbols and UK/US spellings
  function normalizeRaw(raw) {
    return raw
      .replace(/[–—]/g, "-")               // different dashes -> minus
      .replace(/≤/g, "<=")
      .replace(/≥/g, ">=")
      .replace(/←|→/g, "=>")
      .replace(/×/g, "x")
      .replace(/\t/g, " ")
      .replace(/\r/g, "")                  // remove CR
      .replace(/[ ]{2,}/g, " ")            // collapse multiple spaces
      // normalize british/us spellings to short forms (max/min)
      .replace(/\bmaximise\b/ig, "max")
      .replace(/\bmaximize\b/ig, "max")
      .replace(/\bminimise\b/ig, "min")
      .replace(/\bminimize\b/ig, "min")
      .trim();
  }

  // Term regex: matches coefficient (optional) and variable like x and index, e.g. "-3.5x12", "x2", "+x3"
  // Accept whitespace between parts and support decimals
  const termRegex = /([+-]?\s*(?:\d*\.?\d+)?\s*)x\s*(\d+)/gi;

  // Parse terms from an expression, returning array of { index, coeff }
  function parseTerms(expr) {
    const terms = [];
    let m;
    termRegex.lastIndex = 0;
    while ((m = termRegex.exec(expr)) !== null) {
      let rawCoeff = (m[1] || "").replace(/\s+/g, "");
      const idx = parseInt(m[2], 10);
      if (rawCoeff === "" || rawCoeff === "+") rawCoeff = "1";
      if (rawCoeff === "-") rawCoeff = "-1";
      const coeff = parseFloat(rawCoeff);
      terms.push({ index: idx, coeff: isNaN(coeff) ? 0 : coeff });
    }
    return terms;
  }

  // Find maximum variable index across lines
  function findMaxIndexFromLines(lines) {
    let maxIdx = 0;
    for (const line of lines) {
      let m;
      termRegex.lastIndex = 0;
      while ((m = termRegex.exec(line)) !== null) {
        const idx = parseInt(m[2], 10);
        if (!Number.isNaN(idx) && idx > maxIdx) maxIdx = idx;
      }
    }
    return maxIdx;
  }

  // Small util to set error display
  function showError(message) {
    output.style.color = "red";
    output.textContent = "❌ " + message;
  }

  // -------------------------
  // Main parse handler
  // -------------------------
  parseBtn.addEventListener("click", () => {
    const raw = textarea.value;
    if (!raw || raw.trim().length === 0) {
      showError("Please enter a simplex problem first.");
      return;
    }

    const normalized = normalizeRaw(raw);

    // Split into lines; also split out common 'subject to' markers
    const lines = normalized
      .split(/\n+/)
      .map(l => l.trim())
      .flatMap(l => {
        return l.split(/Subject to:|Subject To:|Subject To|ST:|Constraints:|Constraints|constraint:|constraint/i);
      })
      .map(l => l.trim())
      .filter(Boolean);

    // Identify objective line (look for 'max' or 'min' or 'z=')
    let objectiveLineIndex = -1;
    let objectiveType = null;

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (/\b(max|min)\b/i.test(l) || /z\s*[:=]/i.test(l)) {
        objectiveLineIndex = i;
        if (/\bmin\b/i.test(l)) objectiveType = "min";
        if (/\bmax\b/i.test(l)) objectiveType = "max";
        break;
      }
    }

    // If we didn't detect an objective, produce error (do not default)
    if (objectiveType === null) {
      showError("Error: Could not find whether to 'Maximise' or 'Minimise' the objective. Please include 'Maximise/Maximize/Minimise/Minimize' or 'max/min'.");
      return;
    }

    // Collect constraint candidates: lines (excluding objective) that contain <=, >= or =
    const constraintCandidates = [];
    for (let i = 0; i < lines.length; i++) {
      if (i === objectiveLineIndex) continue;
      if (/[<>]=|=/.test(lines[i])) {
        constraintCandidates.push(lines[i]);
      } else {
        // If no comparator but line looks like var list "x1, x2 >= 0" might already match above; otherwise ignore
      }
    }

    // Extract objective expression and clean it
    let objectiveExpr = lines[objectiveLineIndex] || "";
    objectiveExpr = objectiveExpr
      .replace(/\b(max|min)\b\s*/i, "")  // remove leading max/min
      .replace(/^z\s*[:=]\s*/i, "")      // remove leading Z = or Z:
      .replace(/^\s*:/, "")
      .trim();
    objectiveExpr = objectiveExpr.split(/subject to:|subject to|st:/i)[0].trim();

    // Determine number of variables
    const maxVar = Math.max(
      findMaxIndexFromLines([objectiveExpr]),
      findMaxIndexFromLines(constraintCandidates)
    ) || 0;
    const numVariables = maxVar;

    // Build objective array sized numVariables
    const objectiveArray = new Array(numVariables).fill(0);
    const objTerms = parseTerms(objectiveExpr);
    for (const t of objTerms) {
      if (t.index >= 1 && t.index <= numVariables) {
        objectiveArray[t.index - 1] = t.coeff;
      }
    }

    // Parse constraints
    const constraints = [];
    for (const rawLine of constraintCandidates) {
      const match = rawLine.match(/(.*?)(<=|>=|=)(.*)/);
      if (!match) continue;
      let lhs = match[1].trim();
      let comp = match[2].trim();
      let rhsStr = match[3].trim();

      // Extract numerical RHS if present
      const rhsMatch = rhsStr.match(/([+-]?\d*\.?\d+)/);
      const rhs = rhsMatch ? parseFloat(rhsMatch[1]) : null;

      // Parse coefficients in LHS
      const lhsTerms = parseTerms(lhs);
      const coeffRow = new Array(numVariables).fill(0);
      for (const t of lhsTerms) {
        if (t.index >= 1 && t.index <= numVariables) coeffRow[t.index - 1] = t.coeff;
      }

      constraints.push({ coeffs: coeffRow, sign: comp, rhs });
    }

    // If no constraints parsed, attempt a secondary pass (defensive)
    if (constraints.length === 0) {
      for (let i = 0; i < lines.length; i++) {
        if (i === objectiveLineIndex) continue;
        const l = lines[i];
        const m = l.match(/(.*?)(<=|>=|=)(.*)/);
        if (!m) continue;
        const lhs = m[1].trim();
        const comp = m[2].trim();
        const rhsMatch = m[3].trim().match(/([+-]?\d*\.?\d+)/);
        const rhs = rhsMatch ? parseFloat(rhsMatch[1]) : null;
        const lhsTerms = parseTerms(lhs);
        const coeffRow = new Array(numVariables).fill(0);
        for (const t of lhsTerms) {
          if (t.index >= 1 && t.index <= numVariables) coeffRow[t.index - 1] = t.coeff;
        }
        constraints.push({ coeffs: coeffRow, sign: comp, rhs });
      }
    }

    // Ensure coefficient vector sizes match numVariables
    for (const c of constraints) {
      while (c.coeffs.length < numVariables) c.coeffs.push(0);
      if (c.coeffs.length > numVariables) c.coeffs.length = numVariables;
    }

    // Final parsed object
    const parsed = {
      type: objectiveType,
      numVariables,
      objective: objectiveArray,
      constraints
    };

    // Output success
    output.style.color = "black";
    output.textContent = JSON.stringify(parsed, null, 2);
  });
});