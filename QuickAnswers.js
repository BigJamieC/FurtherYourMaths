document.addEventListener("DOMContentLoaded", () => {
    const parseBtn = document.getElementById("parse-problem");
    if (!parseBtn) return;
    parseBtn.addEventListener("click", () => {
        // Wait a little so simplex solver finishes rendering iterations
        setTimeout(() => {
            const container = document.getElementById("tableau-container");
            if (container) {
                // Remove all iteration tables and explanations
                container.innerHTML = "";
            }
        }, 100);
    });
});