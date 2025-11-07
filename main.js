document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const toggleButton = document.getElementById('theme-toggle');

    /* === Math Tip === */
    const tips = [
        "Further Maths Core Pure Fact: The conjugate of a complex number z = a + bi is z̄ = a - bi",
        "Further Maths Core Pure Fact: The modulus of z = a + bi is |z| = √(a² + b²)",
        "Further Maths Core Pure Fact: The argument of z = a + bi is arg(z) = tan⁻¹(b/a)",
        "Further Maths Core Pure Fact: Euler's formula states e^(iθ) = cosθ + i sinθ",
        "Further Maths Core Pure Fact: De Moivre's theorem says (cosθ + i sinθ)ⁿ = cos(nθ) + i sin(nθ)",
        "Further Maths Core Pure Fact: Roots of unity are equally spaced around the unit circle",
        "Further Maths Core Pure Tip: Always express complex numbers in modulus-argument form for multiplication/division",
        "Further Maths Core Pure Tip: Use conjugates to rationalise denominators involving i",
        "Further Maths Core Pure Fact: Proof by induction involves base case, assumption, and inductive step",
        "Further Maths Core Pure Tip: When proving divisibility by induction, express terms in factorised form",
        "Further Maths Core Pure Fact: The Maclaurin series expands functions about x = 0",
        "Further Maths Core Pure Fact: The nth term of the Maclaurin series is f⁽ⁿ⁾(0)xⁿ/n!",
        "Further Maths Core Pure Tip: Check the radius of convergence before using a power series",
        "Further Maths Core Pure Fact: The derivative of sinh(x) is cosh(x)",
        "Further Maths Core Pure Fact: The derivative of cosh(x) is sinh(x)",
        "Further Maths Core Pure Fact: arsinh(x) = ln(x + √(x² + 1))",
        "Further Maths Core Pure Tip: Hyperbolic identities mirror trigonometric ones, e.g. cosh²x - sinh²x = 1",
        "Further Maths Core Pure Fact: A second order ODE with constant coefficients uses characteristic equations",
        "Further Maths Core Pure Tip: For repeated roots in ODEs, multiply by x for the second solution",
        "Further Maths Core Pure Fact: A particular integral is added to the complementary solution to solve nonhomogeneous ODEs",
        "Further Maths Core Pure Tip: Use substitution to reduce higher-order ODEs where possible",
        "Further Maths Core Pure Fact: A plane can be written as r·n = a·n",
        "Further Maths Core Pure Fact: Distance from a point to a plane = |n·(r₀ - a)| / |n|",
        "Further Maths Core Pure Fact: The angle between two planes equals the angle between their normals",
        "Further Maths Core Pure Tip: Always use vector form before converting to Cartesian equations",
        "Further Maths Core Pure Fact: The determinant of a 2*2 matrix [a b; c d] is ad - bc",
        "Further Maths Core Pure Fact: det(A) = 0 means the matrix is singular",
        "Further Maths Core Pure Fact: Eigenvalues satisfy det(A - λI) = 0",
        "Further Maths Core Pure Fact: Eigenvectors satisfy (A - λI)x = 0",
        "Further Maths Core Pure Tip: Use diagonalisation to simplify matrix powers",
        "Further Maths Core Pure Fact: The trace of a matrix equals the sum of its eigenvalues",
        "Further Maths Core Pure Tip: Matrices represent linear transformations such as rotation and scaling",
        "Further Maths Mechanics Fact: Momentum = mass * velocity",
        "Further Maths Mechanics Fact: Impulse = change in momentum",
        "Further Maths Mechanics Fact: Angular momentum L = Iω",
        "Further Maths Mechanics Fact: For a rigid body, I = ∫r² dm",
        "Further Maths Mechanics Tip: Use the parallel axis theorem to find moment of inertia about new axes",
        "Further Maths Mechanics Fact: Centripetal acceleration = v²/r",
        "Further Maths Mechanics Fact: Centripetal force = mv²/r",
        "Further Maths Mechanics Tip: Angular speed ω = 2π/T and v = ωr",
        "Further Maths Mechanics Fact: Work done = torque * angle (in radians)",
        "Further Maths Mechanics Fact: Power = rate of work done = Fv",
        "Further Maths Mechanics Fact: The condition for equilibrium is that resultant force and moment both equal zero",
        "Further Maths Mechanics Fact: In simple harmonic motion, acceleration a = -ω²x",
        "Further Maths Mechanics Fact: Period of SHM = 2π√(m/k)",
        "Further Maths Mechanics Tip: Compare motion equations to SHM form to identify ω",
        "Further Maths Mechanics Tip: Always define the direction of positive displacement clearly",
        "Further Maths Mechanics Fact: Energy in SHM is constant, alternating between potential and kinetic forms",
        "Further Maths Decision Fact: An algorithm is a finite sequence of well-defined steps",
        "Further Maths Decision Tip: Trace tables help verify algorithm logic",
        "Further Maths Decision Fact: A graph is a set of vertices connected by edges",
        "Further Maths Decision Fact: A tree is a connected graph with no cycles",
        "Further Maths Decision Fact: A spanning tree connects all vertices with no cycles",
        "Further Maths Decision Fact: Kruskal's algorithm builds a minimum spanning tree by adding smallest available edges",
        "Further Maths Decision Fact: Prim's algorithm grows a minimum spanning tree from a starting vertex",
        "Further Maths Decision Fact: Dijkstra's algorithm finds the shortest path from one node to others",
        "Further Maths Decision Tip: Label permanent nodes only when shortest path is confirmed",
        "Further Maths Decision Fact: The nearest neighbour algorithm estimates a travelling salesman route",
        "Further Maths Decision Fact: A complete graph joins every vertex to all others",
        "Further Maths Decision Fact: A bipartite graph has two distinct vertex sets with edges only between sets",
        "Further Maths Decision Fact: A matching pairs vertices between two sets",
        "Further Maths Decision Tip: Use alternating paths to improve matchings",
        "Further Maths Decision Fact: The simplex method solves linear programming problems",
        "Further Maths Decision Tip: Always pivot on the most negative entry in the objective row",
        "Further Maths Decision Fact: Critical path analysis identifies the minimum project duration",
        "Further Maths Decision Tip: Float = latest start - earliest start time",
        "Further Maths Decision Fact: In network flow, the max flow equals the min cut",
        "Further Maths Decision Tip: Label flows clearly to avoid exceeding arc capacities",
        "Pure Maths Fact: The binomial expansion works for fractional and negative powers with |x| < 1",
        "Pure Maths Fact: Differentiation gives gradient; integration gives area",
        "Pure Maths Tip: Always check domain restrictions before integrating",
        "Pure Maths Fact: The chain rule is used for composite functions",
        "Pure Maths Fact: The product rule is used for multiplied functions",
        "Pure Maths Fact: The quotient rule is used for divided functions",
        "Pure Maths Fact: The derivative of tan(x) is sec²(x)",
        "Pure Maths Fact: The integral of sec²(x) is tan(x) + c",
        "Pure Maths Fact: The integral of 1/(1 + x²) is tan⁻¹(x) + c",
        "Pure Maths Tip: Sketch functions before solving integration limits",
        "Pure Maths Fact: A vector has both magnitude and direction",
        "Pure Maths Fact: The dot product equals |a||b|cosθ",
        "Pure Maths Tip: Use unit vectors to represent direction only",
        "Pure Maths Fact: The area under velocity-time graph = displacement",
        "Pure Maths Tip: Use numerical integration when functions are not analytically integrable",
        "Mechanics Fact: Resultant force = mass * acceleration",
        "Mechanics Fact: Friction always opposes motion",
        "Mechanics Fact: Maximum friction = μR",
        "Mechanics Tip: Draw a clear FBD (free-body diagram) before solving",
        "Mechanics Fact: Work done = force * distance * cosθ",
        "Mechanics Fact: Power = force * velocity",
        "Mechanics Fact: Momentum is conserved in isolated systems",
        "Mechanics Fact: Impulse = area under force-time graph",
        "Mechanics Fact: Kinetic energy = ½mv²",
        "Mechanics Fact: Potential energy = mgh",
        "Mechanics Tip: Use energy methods when motion involves varying forces",
        "Statistics Fact: Mean = Σx/n and variance = Σ(x-x̄)²/n",
        "Statistics Fact: Standard deviation = √variance",
        "Statistics Fact: Probability of all outcomes = 1",
        "Statistics Fact: For independent events, P(A∩B) = P(A)P(B)",
        "Statistics Tip: Draw a probability tree to visualise compound events",
        "Statistics Fact: A binomial distribution models discrete independent trials",
        "Statistics Fact: Normal distribution is continuous and symmetric about μ",
        "Statistics Fact: Z = (X - μ)/σ standardises normal variables",
        "Statistics Fact: Hypothesis testing compares sample data to population claims",
        "Statistics Tip: Use a two-tailed test when deviations in both directions matter",
        "Statistics Fact: The correlation coefficient r measures strength of linear relationship",
        "Statistics Tip: Correlation does not imply causation",
        "Statistics Fact: In regression, y = a + bx predicts dependent variable y",
        "Statistics Tip: Always check residuals for randomness to validate a linear model"
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    const tipElement = document.querySelector(".math-tip p");
    if (tipElement) tipElement.textContent = randomTip;

    const closeBtn = document.querySelector(".close-tip");
    const mathTip = document.querySelector(".math-tip");
    if (closeBtn && mathTip) {
        closeBtn.addEventListener("click", () => {
            mathTip.classList.add("hidden");
            setTimeout(() => mathTip.style.display = "none", 400);
        });
    }

    /* === Dark Mode Toggle === */
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        toggleButton.textContent = '☀️';
    }

    toggleButton.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            toggleButton.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        } else {
            toggleButton.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        }
    });

    /* === Page Fade In / Out === */
    body.classList.add('fade-in'); // fade in on page load

    const links = document.querySelectorAll('a.NavItem, a.home');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            body.classList.remove('fade-in');
            body.classList.add('fade-out');
            setTimeout(() => window.location.href = href, 300); // faster transition
        });
    });
});
