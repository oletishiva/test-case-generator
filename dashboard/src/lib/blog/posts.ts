export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: "interview" | "testing" | "tools" | "agile";
  readTime: number; // minutes
  content: string; // HTML string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 109,
    slug: "deloitte-qa-interview-questions",
    title: "Deloitte QA Interview Questions",
    excerpt: "Three interview rounds at Deloitte — covering data-driven frameworks, Maven, TestNG, Selenium, and HR discussions. Real questions from a recent QA interview.",
    date: "2025-03-02",
    category: "interview",
    readTime: 5,
    content: `
<h2>Round 1 — Technical</h2>
<ul>
  <li>What is a Data Driven Framework? How do you implement it?</li>
  <li>Difference between <strong>Scenario</strong> and <strong>Scenario Outline</strong> in Cucumber</li>
  <li>XPath vs CSS selectors — when to use which?</li>
  <li>What is the <strong>Actions class</strong> in Selenium? Give examples.</li>
  <li>How do you perform a right-click on a button using Selenium?</li>
  <li>Difference between <strong>Exception</strong> and <strong>Error</strong> in Java</li>
  <li>What is error recovery in Java? How does <code>try-catch-finally</code> work?</li>
  <li>Array vs ArrayList — differences and use cases</li>
  <li>Can an ArrayList have duplicate values?</li>
  <li>Write Java code to insert elements into an array and remove duplicates</li>
</ul>

<h2>Round 2 — Technical (Advanced)</h2>
<ul>
  <li>What is <strong>Maven</strong>? What are its advantages in a test project?</li>
  <li>Differences between <code>mvn clean</code>, <code>mvn verify</code>, and <code>mvn test</code></li>
  <li>How do you execute TestNG tests from <code>pom.xml</code>?</li>
  <li>What reporting frameworks have you used? (Allure, ExtentReports, etc.)</li>
  <li>What is <strong>JavaScriptExecutor</strong>? When do you use it?</li>
  <li>How do you handle <strong>StaleElementReferenceException</strong>?</li>
  <li>Describe your framework development experience from scratch</li>
  <li>Write code to count the occurrences of a character in a string</li>
  <li>Difference between Test Cases, Test Scenarios, and Epics</li>
  <li>What is a <strong>Requirement Traceability Matrix (RTM)</strong>?</li>
</ul>

<h2>Round 3 — HR</h2>
<ul>
  <li>Salary expectations and negotiation</li>
  <li>Notice period and joining date</li>
  <li>Final selection discussion</li>
</ul>

<p><em>Tip: For Deloitte QA interviews, be ready with hands-on Selenium + Java code examples and a clear explanation of your framework architecture. RTM and test documentation are commonly tested.</em></p>
    `.trim(),
  },
  {
    id: 68,
    slug: "sherlock-holmes-principles-software-testing",
    title: "How are SHERLOCK HOLMES Principles Related to Software Testing?",
    excerpt: "The legendary detective's investigative methodology maps surprisingly well to how great QA engineers approach bugs and test design.",
    date: "2024-04-24",
    category: "testing",
    readTime: 4,
    content: `
<p>Sherlock Holmes was the world's greatest detective — and his methodology holds timeless lessons for software testers. Here's how each SHERLOCK principle maps to QA:</p>

<h2>S — Systematic Observation</h2>
<p>Holmes never missed a detail. Similarly, effective testers observe application behaviour systematically, documenting every step rather than jumping to conclusions.</p>

<h2>H — Hypothesis Testing</h2>
<p>Holmes formed a hypothesis and tested it with evidence. Testers do the same: write a test case based on expected behaviour, execute it, and compare results.</p>

<h2>E — Evidence Collection</h2>
<p>Good bug reports include screenshots, logs, network traces and reproduction steps — the "evidence" that helps developers reproduce and fix issues.</p>

<h2>R — Reasoning from Data</h2>
<p>Holmes never guessed. Test coverage decisions should be driven by risk analysis and historical defect data, not gut feeling.</p>

<h2>L — Lateral Thinking</h2>
<p>Some defects only appear in unusual combinations of inputs. Exploratory testing and boundary-value analysis reflect Holmes-style lateral thinking.</p>

<h2>O — Open Mind</h2>
<p>Holmes discarded theories when evidence contradicted them. Testers should approach each test without bias — even if a feature "always works".</p>

<h2>C — Curiosity</h2>
<p>The best testers are naturally curious. They ask "what happens if…?" beyond the happy path.</p>

<h2>K — Knowledge Application</h2>
<p>Domain knowledge makes testing sharper. A tester who understands the business can spot logical defects that automated tools miss.</p>

<p><em>Next time you hunt a bug, channel your inner Sherlock: observe, hypothesise, collect evidence, and reason — never guess.</em></p>
    `.trim(),
  },
  {
    id: 65,
    slug: "globalization-internationalization-testing",
    title: "Major Components in Globalization / Internationalization Testing",
    excerpt: "Building apps for a global audience? Here are the critical components you must test to ensure your software works across locales, languages, and cultures.",
    date: "2024-04-23",
    category: "testing",
    readTime: 3,
    content: `
<p>Globalization (G11N) and Internationalization (I18N) testing ensures your application works correctly for users worldwide. Here are the key components to test:</p>

<h2>1. Language Translations</h2>
<p>Verify all UI text is correctly translated. Watch for truncation when translated strings are longer than English originals, and ensure special characters (ü, ñ, 汉字) render correctly.</p>

<h2>2. Currency Handling</h2>
<p>Different countries use different currency symbols, decimal separators, and grouping separators. Test that prices format correctly: <code>$1,234.56</code> vs <code>€1.234,56</code>.</p>

<h2>3. Phone Number Formats</h2>
<p>Phone numbers vary significantly by country (+91 for India, +1 for US). Validate both the input format and display format for all supported regions.</p>

<h2>4. ZIP / Postal Codes</h2>
<p>US ZIP codes are 5 digits; UK postcodes follow a different alphanumeric pattern; India uses 6-digit PIN codes. Validation logic must handle all formats.</p>

<h2>5. Date & Time Formats</h2>
<p>MM/DD/YYYY (US) vs DD/MM/YYYY (UK/India) vs YYYY/MM/DD (ISO). Also test timezone handling, daylight saving time, and 12h vs 24h clock display.</p>

<h2>6. Numeric Formats</h2>
<p>The Indian numbering system (lakhs, crores) differs from the Western system. Decimal and thousand separators also vary by locale.</p>

<h2>7. Legal & Compliance</h2>
<p>Cookie consent (GDPR in Europe), data residency requirements, age verification, and content restrictions differ by jurisdiction. Each market may require specific legal text.</p>

<h2>8. Right-to-Left (RTL) Languages</h2>
<p>Arabic and Hebrew are written right-to-left. UI layout, text alignment, and navigation flow must be mirrored for RTL locales.</p>
    `.trim(),
  },
  {
    id: 63,
    slug: "what-is-crowdtesting",
    title: "What is Crowdtesting?",
    excerpt: "Crowdtesting lets real users test your product under real conditions before release. Here's how it works, when to use it, and its pros and cons.",
    date: "2024-04-20",
    category: "testing",
    readTime: 3,
    content: `
<blockquote><p>"Crowdtesting is all about allowing people to test your products in real-world conditions."</p></blockquote>

<p>Traditional QA is performed in controlled lab environments on a limited set of devices and configurations. Crowdtesting breaks this constraint by engaging a distributed crowd of real testers — customers, freelancers, and beta users — to test your product on their own devices, browsers, and networks.</p>

<h2>How It Works</h2>
<ol>
  <li>The company defines the scope, test goals, and target devices/platforms</li>
  <li>The crowdtesting platform recruits testers matching the desired demographic</li>
  <li>Testers explore the application and report bugs with logs and screenshots</li>
  <li>Results are aggregated, deduplicated, and delivered to the QA team</li>
</ol>

<h2>Benefits</h2>
<ul>
  <li><strong>Real-world coverage</strong> — thousands of device/OS combinations no lab can replicate</li>
  <li><strong>Diverse user perspectives</strong> — different skill levels and usage patterns surface unexpected bugs</li>
  <li><strong>Speed</strong> — large crowds test in parallel, compressing timelines</li>
  <li><strong>Cost-effective</strong> — pay per bug or per tester, no need for a large in-house team</li>
</ul>

<h2>Challenges</h2>
<ul>
  <li>Variable tester quality — bug reports may be incomplete or duplicated</li>
  <li>Security and NDA concerns for pre-release software</li>
  <li>Requires strong coordination and triage processes</li>
</ul>

<h2>When to Use Crowdtesting</h2>
<p>Crowdtesting is most valuable for consumer-facing products that will run on hundreds of device configurations, or when you need rapid usability feedback before a major release.</p>
    `.trim(),
  },
  {
    id: 61,
    slug: "optimizing-testing-strategies-in-agile-sprints",
    title: "Optimizing Testing Strategies in Agile Sprints",
    excerpt: "Running Scrum? Here's how to fit smoke, regression, integration, system, and acceptance testing into a time-boxed sprint without burning out your QA team.",
    date: "2024-04-19",
    category: "agile",
    readTime: 4,
    content: `
<p>In Agile, the sprint is sacred — typically 2 weeks, always time-boxed. Fitting all the necessary testing types into that window requires deliberate prioritisation and smart automation.</p>

<h2>Testing Types Within a Sprint</h2>

<h3>1. Smoke Testing (Day 1-2)</h3>
<p>Run smoke tests on every new build to verify the build is stable enough for deeper testing. Keep smoke suites small (15-30 minutes) and fully automated.</p>

<h3>2. Functional / Story Testing (Throughout)</h3>
<p>Test new user stories as soon as developers move them to "Ready for QA". Shift-left by reviewing acceptance criteria during sprint planning.</p>

<h3>3. Integration Testing (Mid-sprint)</h3>
<p>Verify that new features integrate correctly with existing modules and external services. API contract testing (Pact, REST Assured) fits well here.</p>

<h3>4. Regression Testing (Day 8-10)</h3>
<p>Run automated regression suites to ensure new changes haven't broken existing functionality. A well-maintained regression suite should run overnight in CI.</p>

<h3>5. System Testing (Pre-release)</h3>
<p>End-to-end flows across the entire application. These are the most expensive tests — run the critical paths manually, automate the stable ones.</p>

<h3>6. User Acceptance Testing (Sprint Review)</h3>
<p>Involve the Product Owner and stakeholders in validating stories against acceptance criteria during the sprint review or a dedicated UAT session.</p>

<h2>Key Principles</h2>
<ul>
  <li><strong>Automate relentlessly</strong> — anything that can be automated should be automated</li>
  <li><strong>Shift left</strong> — involve QA in story refinement, not just execution</li>
  <li><strong>Risk-based prioritisation</strong> — test the highest-risk areas first</li>
  <li><strong>Definition of Done</strong> — include testing completion as a DoD criterion</li>
</ul>
    `.trim(),
  },
  {
    id: 59,
    slug: "bug-identification-and-prioritization-strategies",
    title: "Strategies for Efficient Bug Identification and Prioritization in Testing",
    excerpt: "Not all bugs are equal. These 7 strategies help QA teams identify the right bugs and prioritize them by business impact — so the most critical fixes ship first.",
    date: "2024-04-18",
    category: "testing",
    readTime: 4,
    content: `
<p>With hundreds of bugs in a backlog, deciding what to fix first is one of the hardest challenges in QA. Here are seven battle-tested strategies for efficient bug identification and prioritization:</p>

<h2>1. Focus on Changed Areas</h2>
<p>New code is more likely to contain bugs than stable, battle-tested code. Prioritize testing modules that were recently modified, especially if they touch core business logic.</p>

<h2>2. Test Critical Functions First</h2>
<p>Identify the core user journeys (checkout, login, payment) and test these before edge cases. A bug in a critical path has exponentially more impact than a cosmetic issue on a rarely-visited page.</p>

<h2>3. Evaluate Capability Before Performance</h2>
<p>Functional correctness takes priority over performance optimisation. Fix "the feature doesn't work" before "the feature is slow".</p>

<h2>4. Test Common Scenarios</h2>
<p>80% of users follow 20% of flows. Ensure the most common use cases work flawlessly before exploring rare edge cases.</p>

<h2>5. Address Frequent Threats</h2>
<p>Look at historical defect data. If authentication has had bugs in three consecutive releases, it's a high-risk area deserving extra coverage.</p>

<h2>6. Prioritize High-Impact Issues</h2>
<p>Use a severity/priority matrix: <strong>Critical</strong> (system crash, data loss) → <strong>High</strong> (major feature broken) → <strong>Medium</strong> (feature works but incorrectly) → <strong>Low</strong> (cosmetic).</p>

<h2>7. Test High-Demand Areas</h2>
<p>Features used by the most users generate the most support tickets when broken. Usage analytics can guide where to invest testing effort.</p>

<h2>The Priority Matrix</h2>
<table>
  <thead><tr><th>Severity</th><th>Priority</th><th>Action</th></tr></thead>
  <tbody>
    <tr><td>Critical</td><td>P1</td><td>Fix before release</td></tr>
    <tr><td>High</td><td>P2</td><td>Fix in current sprint</td></tr>
    <tr><td>Medium</td><td>P3</td><td>Fix in next sprint</td></tr>
    <tr><td>Low</td><td>P4</td><td>Fix when capacity allows</td></tr>
  </tbody>
</table>
    `.trim(),
  },
  {
    id: 23,
    slug: "basic-git-commands-for-qa",
    title: "Basic Git Commands Every QA Engineer Should Know",
    excerpt: "A practical cheat-sheet of the essential Git commands for QA professionals — from cloning a repo to raising a pull request.",
    date: "2024-04-17",
    category: "tools",
    readTime: 3,
    content: `
<p>Git is not just for developers. QA engineers use it daily to manage test scripts, raise pull requests, and collaborate on automation frameworks. Here's your essential cheat sheet:</p>

<h2>Repository Setup</h2>
<pre><code>git init                  # Initialize a new local repo
git clone &lt;url&gt;           # Clone a remote repository
git remote -v             # View remote connections</code></pre>

<h2>Daily Workflow</h2>
<pre><code>git status                # See changed files
git add &lt;file&gt;            # Stage a specific file
git add .                 # Stage all changes
git commit -m "message"   # Commit with a message
git pull                  # Fetch + merge from remote
git push                  # Push local commits to remote</code></pre>

<h2>Branching</h2>
<pre><code>git branch                # List branches
git branch &lt;name&gt;         # Create a new branch
git checkout &lt;name&gt;       # Switch to a branch
git checkout -b &lt;name&gt;    # Create and switch in one step
git merge &lt;branch&gt;        # Merge branch into current</code></pre>

<h2>History & Inspection</h2>
<pre><code>git log                   # View commit history
git log --oneline         # Compact one-line view
git diff                  # Show unstaged changes
git diff --staged         # Show staged changes</code></pre>

<h2>Undoing Changes</h2>
<pre><code>git reset HEAD &lt;file&gt;     # Unstage a file
git checkout -- &lt;file&gt;   # Discard local changes
git revert &lt;commit&gt;       # Revert a commit safely</code></pre>

<h2>Collaboration Tips for QA</h2>
<ul>
  <li>Always work on a feature branch — never commit directly to <code>main</code></li>
  <li>Pull before you push to avoid merge conflicts</li>
  <li>Use meaningful commit messages: <code>test: add login regression suite</code></li>
  <li>Review diffs before committing to catch accidental test data exposure</li>
</ul>
    `.trim(),
  },
  {
    id: 8,
    slug: "smoke-testing-vs-sanity-testing",
    title: "Smoke Testing vs Sanity Testing",
    excerpt: "Two terms often confused, with completely different purposes. Here's a clear breakdown of when each applies and why both matter in a QA cycle.",
    date: "2023-09-03",
    category: "testing",
    readTime: 3,
    content: `
<blockquote><p>"Smoke testing is an initial, basic test executed to ensure that the software build is stable enough for further testing."</p></blockquote>

<h2>Smoke Testing</h2>
<p>Smoke testing (also called <em>build verification testing</em>) is performed immediately after a new build is deployed. Its goal is simple: check that the critical paths work and the build isn't catastrophically broken.</p>

<p><strong>Characteristics:</strong></p>
<ul>
  <li>Shallow and wide — covers many features at a surface level</li>
  <li>Fast — typically 15–30 minutes</li>
  <li>Automated — run on every CI build</li>
  <li>Done by the QA team (or CI pipeline) before handing off to wider testing</li>
</ul>

<p><strong>Example:</strong> Can a user log in, browse products, and add to cart? If yes, the build is stable enough to test further.</p>

<h2>Sanity Testing</h2>
<p>Sanity testing is a <em>narrowly focused</em> test performed after a specific bug fix or small change. It verifies that the particular issue is resolved without breaking adjacent functionality.</p>

<p><strong>Characteristics:</strong></p>
<ul>
  <li>Deep and narrow — focuses on a specific area</li>
  <li>Quick — usually manual, spot-checking the fix</li>
  <li>Performed after regression or targeted fixes</li>
  <li>Does not require full test documentation</li>
</ul>

<p><strong>Example:</strong> A bug in the password reset flow was fixed. Sanity testing verifies the fix works and the login flow adjacent to it still works.</p>

<h2>Side-by-Side Comparison</h2>
<table>
  <thead>
    <tr><th>Attribute</th><th>Smoke Testing</th><th>Sanity Testing</th></tr>
  </thead>
  <tbody>
    <tr><td>Purpose</td><td>Build stability check</td><td>Specific fix verification</td></tr>
    <tr><td>Scope</td><td>Wide, shallow</td><td>Narrow, deep</td></tr>
    <tr><td>When</td><td>After every new build</td><td>After a bug fix / small change</td></tr>
    <tr><td>Documentation</td><td>Scripted test suite</td><td>Usually unscripted</td></tr>
    <tr><td>Automation</td><td>Yes (CI/CD)</td><td>Usually manual</td></tr>
  </tbody>
</table>

<p><em>Think of it this way: smoke testing asks "is the car driveable?" — sanity testing asks "did fixing the brakes break the steering?"</em></p>
    `.trim(),
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}

export const CATEGORY_LABELS: Record<BlogPost["category"], string> = {
  interview: "Interview Prep",
  testing: "Testing",
  tools: "Tools",
  agile: "Agile",
};

export const CATEGORY_COLORS: Record<BlogPost["category"], { bg: string; text: string }> = {
  interview: { bg: "#fef3c7", text: "#92400e" },
  testing:   { bg: "#dbeafe", text: "#1e40af" },
  tools:     { bg: "#d1fae5", text: "#065f46" },
  agile:     { bg: "#ede9fe", text: "#5b21b6" },
};
