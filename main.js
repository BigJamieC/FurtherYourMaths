document.addEventListener("DOMContentLoaded", () => {
    const tips = [
        "The sum of the first n odd numbers equals n².",
        "A circle has infinite lines of symmetry.",
        "Zero is the only number that is neither positive nor negative.",
        "The Fibonacci sequence appears in nature more often than you’d expect!",
        "The number π (pi) never repeats and never ends.",
        "Multiplying any number by 9 and summing its digits will always equal 9.",
        "A negative times a negative equals a positive — think of flipping direction twice.",
        "An isosceles triangle has two sides of equal length — and two equal angles.",
        "Dividing by zero is undefined — because no number times zero can get you back!",
        "Prime numbers are the building blocks of all whole numbers."
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    const tipElement = document.querySelector(".math-tip p");

    if (tipElement) {
        tipElement.textContent = randomTip;
    }

    // Handle closing the tip
    const closeBtn = document.querySelector(".close-tip");
    const mathTip = document.querySelector(".math-tip");

    if (closeBtn && mathTip) {
        closeBtn.addEventListener("click", () => {
            mathTip.classList.add("hidden");
            setTimeout(() => {
                mathTip.style.display = "none";
            }, 400); // Wait for fade animation
        });
    }
});