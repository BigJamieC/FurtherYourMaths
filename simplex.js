// wait till the page is loaded, otherwise elements might not exist
document.addEventListener("DOMContentLoaded", () => {

    // grab main elements from the page
    const textarea = document.getElementById("lp-input"); // user input box
    const parseBtn = document.getElementById("parse-problem"); // parse button
    const output = document.getElementById("parsed-result"); // where we will show the result

    // symbol buttons
    const symbolButtons = document.querySelectorAll(".symbol-btn");
    for (let i = 0; i < symbolButtons.length; i++) {
        symbolButtons[i].addEventListener("click", () => {
            let btn = symbolButtons[i];
            let sym = btn.dataset.symbol || btn.textContent;
            let start = textarea.selectionStart;
            let end = textarea.selectionEnd;
            let txt = textarea.value;
            // insert symbol at cursor
            textarea.value = txt.substring(0, start) + sym + txt.substring(end);
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + sym.length;
        });
    }

    // helper to clean up input text
    function normalizeRaw(raw) {
        let t = raw;
        t = t.replace(/[–—]/g, "-"); // change dashes to minus
        t = t.replace(/≤/g, "<=");
        t = t.replace(/≥/g, ">=");
        t = t.replace(/←|→/g, "=>");
        t = t.replace(/×/g, "x");
        t = t.replace(/\t/g, " ").replace(/\r/g, "");
        t = t.replace(/[ ]{2,}/g, " ");
        // normalise british/us spellings
        t = t.replace(/\bmaximise\b/ig, "max");
        t = t.replace(/\bmaximize\b/ig, "max");
        t = t.replace(/\bminimise\b/ig, "min");
        t = t.replace(/\bminimize\b/ig, "min");
        return t.trim();
    }

    // regex to parse terms like 3x1, -x2
    const termRegex = /([+-]?\s*(?:\d*\.?\d+)?\s*)x\s*(\d+)/gi;

    function parseTerms(expr) {
        let terms = [];
        termRegex.lastIndex = 0;
        let match;
        while ((match = termRegex.exec(expr)) !== null) {
            let c = (match[1] || "").replace(/\s+/g, "");
            let idx = parseInt(match[2], 10);
            if (c === "" || c == "+") c = "1";
            if (c === "-" || c === " -") c = "-1";
            let coeff = parseFloat(c);
            terms.push({ index: idx, coeff: isNaN(coeff) ? 0 : coeff });
        }
        return terms;
    }

    function findMaxIndexFromLines(lines) {
        let maxI = 0;
        for (let i = 0; i < lines.length; i++) {
            termRegex.lastIndex = 0;
            let m;
            while ((m = termRegex.exec(lines[i])) !== null) {
                let idx = parseInt(m[2], 10);
                if (!isNaN(idx) && idx > maxI) maxI = idx;
            }
        }
        return maxI;
    }

    var errorTrue = false;
    function showError(msg) {
        output.style.color = "red";
        output.textContent = "❌ " + msg;
        errorTrue = true;
    }
    function removeError() {
        output.textContent = "";
        errorTrue = false;
    }

    parseBtn.addEventListener("click", function () {
        removeError();

        const rawInput = textarea.value;
        const input = normalizeRaw(rawInput);
        if (input.length === 0 || !rawInput) {
            showError("Input is empty!");
            return;
        }

        const normalised = normalizeRaw(rawInput);
        let line = normalised.split(/[\n,]+/).map(e => e.trim())
            .flatMap(l => {
                return l.split(
                    /Subject to:|Subject To:|Subject To|ST:|S\.T\.|s\.t\.|Where|Such that|With|Conditions:|Conditions|Limits:|Limits|Restrictions:|Restrictions|Constraints:|Constraints|constraint:|The:|The|the:|the|constraint/i
                );
            });

        // remove empty elements
        line = line.filter(l => l.trim() !== "");

        // find objective function
        let objectiveLineIndex = -1;
        let objectiveType = null;
        for (let i = 0; i < line.length; i++) {
            const l = line[i];
            if (l.toLowerCase().includes("max")) {
                objectiveLineIndex = i;
                objectiveType = "max";
            } else if (l.toLowerCase().includes("min")) {
                objectiveLineIndex = i;
                objectiveType = "min";
            }
        }

        if (!objectiveType) {
            showError("Please specify min or max!");
            return;
        }

        const objLine = line[objectiveLineIndex];
        if (!(/\bp\b/i.test(objLine) || /\bz\b/i.test(objLine) || /\bf\b/i.test(objLine))) {
            showError("Objective function does not include (F OR Z OR P)");
            return;
        }

        // collect constraint lines
        const constraintCandidates = [];
        for (let i = 0; i < line.length; i++) {
            if (i !== objectiveLineIndex && (line[i].includes("=") || line[i].includes(">") || line[i].includes("<"))) {
                constraintCandidates.push(line[i]);
            }
        }

        // clean objective expression
        let objectiveExpr = objLine.replace(/\b(max|min)\b\s*/i, "").replace(/^z\s*[:=]\s*/i, "").replace(/^p\s*[:=]\s*/i, "").replace(/^f\s*[:=]\s*/i, "").replace(/^\s*:/, "").trim();
        objectiveExpr = objectiveExpr.replace(/x(?!\d)/gi, "x1");

        const maxVar = Math.max(findMaxIndexFromLines([objectiveExpr]), findMaxIndexFromLines(constraintCandidates)) || 0;

        // build objective array
        const objectiveArray = new Array(maxVar).fill(0);
        const objTerms = parseTerms(objectiveExpr);
        for (const t of objTerms) {
            if (t.index >= 1 && t.index <= maxVar) objectiveArray[t.index - 1] = t.coeff;
        }

        // parse constraints
        const constraints = [];
        for (const rawLine of constraintCandidates) {
            const match = rawLine.match(/(.*?)(<=|>=|=)(.*)/);
            if (!match) continue;

            let leftSide = match[1].trim();
            leftSide = leftSide.replace(/x(?!\d)/gi, "x1");
            let middle = match[2].trim();
            let rightSide = match[3].trim();

            // numeric RHS
            const rightSideMatch = rightSide.match(/([+-]?\d*\.?\d+)/);
            if (rightSideMatch) {
                rightSide = parseFloat(rightSideMatch[1]);
            } else {
                rightSide = null;
            }

            // parse LHS coefficients
            const leftSideTerms = parseTerms(leftSide);
            const coeffRow = new Array(maxVar).fill(0);
            for (const t of leftSideTerms) {
                if ((t.index >= 1 && t.index) <= maxVar) {
                    coeffRow[t.index - 1] = t.coeff;
                }
            }

            constraints.push({ coeffs: coeffRow, sign: middle, rhs: rightSide });
        }

        if (constraints.length == 0) {
            showError("Error parsing constraints, please ensure constraints follow stated standard.");
            return;
        }

        // pad or trim constraint arrays
        for (const x of constraints) {
            while (x.coeffs.length < maxVar) {
                x.coeffs.push(0)
                if (x.coeffs.length > maxVar) {
                    x.coeffs.length = maxVar;
                }
            }
        }

        const namedObjective = [];
        for (let i = 0; i < objectiveArray.length; i++) {
            const item = {
                variable: "x" + (i + 1),
                coeff: objectiveArray[i]
            };
            namedObjective.push(item);
        }

        const namedConstraints = [];

        for (let i = 0; i < constraints.length; i++) {

            const oldConstraint = constraints[i];

            const newConstraint = {
                sign: oldConstraint.sign,
                rhs: oldConstraint.rhs,
                coeffs: []
            };

            for (let j = 0; j < oldConstraint.coeffs.length; j++) {
                const coeffItem = {
                    variable: "x" + (j + 1),
                    coeff: oldConstraint.coeffs[j]
                };

                newConstraint.coeffs.push(coeffItem);
            }

            namedConstraints.push(newConstraint);
        }

        const parsed = {
            "Objective Type": objectiveType, "Highest variable": maxVar, "Objective Function": namedObjective, "Constraints": namedConstraints
        };

        output.style.color = "black";
        output.textContent = JSON.stringify(parsed, null, 2);

    });
});
