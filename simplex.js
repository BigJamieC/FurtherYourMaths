// wait till the page is loaded, otherwise elements might not exist
document.addEventListener("DOMContentLoaded", () => {

    // grab main elements from the page
    const textarea = document.getElementById("lp-input"); // user input box
    const parseBtn = document.getElementById("parse-problem"); // parse button
    const output = document.getElementById("parsed-result"); // where we will show the result

    // -------------------------
    // symbol buttons
    // -------------------------
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

    // -------------------------
    // helper to clean up input text
    // -------------------------
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

    // -------------------------
    // regex to parse terms like 3x1, -x2
    // -------------------------
    const termRegex = /([+-]?\s*(?:\d*\.?\d+)?\s*)x\s*(\d+)/gi;

    function parseTerms(expr) {
        let terms = [];
        termRegex.lastIndex = 0;
        let match;
        while ((match = termRegex.exec(expr)) !== null) {
            let c = (match[1] || "").replace(/\s+/g, "");
            let idx = parseInt(match[2], 10);
            if (c === "" || c == "+") c = "1";
            if (c === "-" || c === " -") c = "-1"; // student might forget spacing sometimes
            let coeff = parseFloat(c);
            terms.push({ index: idx, coeff: isNaN(coeff) ? 0 : coeff });
        }
        return terms;
    }

    // -------------------------
    // find max variable index
    // -------------------------
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

    function showError(msg) {
        output.style.color = "red";
        output.textContent = "❌ " + msg;
    }
    function removeError(){
        output.textContent =""
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
        //console.log(normalised);
        const line = normalised.split(/[\n,]+/).map(function (e) { //Some problems may have the constraints seperated via commas or new lines, this accounts for both.
            return e.trim()
        })
        .flatMap(l => {
            return l.split(
                /Subject to:|Subject To:|Subject To|ST:|S\.T\.|s\.t\.|Where|Such that|With|Conditions:|Conditions|Limits:|Limits|Restrictions:|Restrictions|Constraints:|Constraints|constraint:|The:|The|the:|the|constraint/i // split on common constraint indicators, case-insensitive
            );
        })
        //Removes any elements in the array that are blank or have spaces
        for (let i = 0; i < line.length; i++) {
            if (line[i] == "" || line[i] == " ") {
                line.splice(i, 1)
                i--
            }
        }
        let objectiveLineIndex = -1; //Sets to not have been found
        let objectiveType = null;//sets to no type
        for (let i = 0; i < line.length; i++) {//loops through each element in array to find objective function
            const l = line[i]
            let testResult =l.toLowerCase().includes("max") || l.toLowerCase().includes("min")
            if (testResult == true){
                objectiveLineIndex = i;
                if (l.toLowerCase().includes("max")){
                    objectiveType = "max";
            }
                else 
                    objectiveType = "min"
            }
        }
        if (!objectiveType) {
            showError("Please specify min or max!");
        }
        console.log(line)
            // console.log(testResult)
            console.log(objectiveLineIndex)
            console.log(objectiveType)
    })
})