// Test Case Generator Web App
class TestCaseGenerator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadSavedConfig();
    }

    initializeElements() {
        this.openaiKeyInput = document.getElementById('openaiKey');
        this.geminiKeyInput = document.getElementById('geminiKey');
        this.primaryServiceSelect = document.getElementById('primaryService');
        this.requirementTextarea = document.getElementById('requirement');
        this.acceptanceCriteriaTextarea = document.getElementById('acceptanceCriteria');
        this.generatePlaywrightCheckbox = document.getElementById('generatePlaywright');
        this.generateBtn = document.getElementById('generateBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.testCasesOutput = document.getElementById('testCasesOutput');
        this.playwrightCard = document.getElementById('playwrightCard');
        this.playwrightOutput = document.getElementById('playwrightOutput');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.toastContainer = document.getElementById('toastContainer');
        this.apiModal = document.getElementById('apiModal');
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generateTestCases());
        document.getElementById('copyPlaywrightBtn').addEventListener('click', () => this.copyPlaywrightCode());
        document.getElementById('downloadPlaywrightBtn').addEventListener('click', () => this.downloadPlaywrightCode());
        document.getElementById('downloadJsonBtn').addEventListener('click', () => this.downloadJson());
        document.getElementById('downloadTsBtn').addEventListener('click', () => this.downloadTypeScript());
        document.getElementById('apiDocsBtn').addEventListener('click', () => this.showApiDocs());
        document.querySelector('.close').addEventListener('click', () => this.hideApiDocs());
        
        // Close modal when clicking outside
        this.apiModal.addEventListener('click', (e) => {
            if (e.target === this.apiModal) {
                this.hideApiDocs();
            }
        });

        // Save config on change
        [this.openaiKeyInput, this.geminiKeyInput, this.primaryServiceSelect].forEach(element => {
            element.addEventListener('change', () => this.saveConfig());
        });
    }

    async generateTestCases() {
        const requirement = this.requirementTextarea.value.trim();
        if (!requirement) {
            this.showToast('Please enter a requirement or user story', 'error');
            return;
        }

        const openaiKey = this.openaiKeyInput.value.trim();
        const geminiKey = this.geminiKeyInput.value.trim();
        
        if (!openaiKey && !geminiKey) {
            this.showToast('Please provide at least one API key (OpenAI or Gemini)', 'error');
            return;
        }

        this.showLoading(true);
        this.updateProgress('Initializing AI services...', 10);
        this.saveConfig();

        try {
            const requestBody = {
                requirement: requirement,
                generatePlaywright: this.generatePlaywrightCheckbox.checked,
                openaiKey: openaiKey || undefined,
                geminiKey: geminiKey || undefined,
                primaryService: this.primaryServiceSelect.value
            };

            // Add acceptance criteria if provided
            if (this.acceptanceCriteriaTextarea.value.trim()) {
                requestBody.acceptanceCriteria = this.acceptanceCriteriaTextarea.value.trim();
            }

            this.updateProgress('Generating test cases and Playwright code in parallel...', 30);

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            this.updateProgress('Processing AI response...', 70);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate test cases');
            }

            this.updateProgress('Finalizing results...', 90);
            this.displayResults(data);
            this.updateProgress('Complete!', 100);
            
            setTimeout(() => {
                this.showToast('Test cases generated successfully!', 'success');
            }, 500);

        } catch (error) {
            console.error('Error generating test cases:', error);
            this.showToast(`Error: ${error.message}`, 'error');
        } finally {
            setTimeout(() => {
                this.showLoading(false);
            }, 1000);
        }
    }

    updateProgress(message, percentage) {
        const progressBar = document.querySelector('.progress-bar');
        const progressText = document.querySelector('.progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = message;
        }
    }

    displayResults(data) {
        this.displayTestCases(data.testCases);
        
        if (data.playwrightCode) {
            this.displayPlaywrightCode(data.playwrightCode);
        }

        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });

        // Store data for downloads
        this.currentTestCases = data.testCases;
        this.currentPlaywrightCode = data.playwrightCode;
    }

    displayTestCases(testCases) {
        this.testCasesOutput.innerHTML = '';
        
        testCases.forEach((testCase, index) => {
            const testCaseElement = document.createElement('div');
            testCaseElement.className = `test-case ${testCase.type.toLowerCase()}`;
            
            testCaseElement.innerHTML = `
                <h3>
                    <span class="type-badge ${testCase.type.toLowerCase().replace(' ', '-')}">${testCase.type}</span>
                    <span class="priority-badge priority-${testCase.priority?.toLowerCase() || 'medium'}">${testCase.priority || 'Medium'}</span>
                    ${testCase.title}
                </h3>
                <div class="steps">
                    <h4>Steps:</h4>
                    <ol>
                        ${testCase.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
                <div class="expected-result">
                    <h4>Expected Result:</h4>
                    <p>${testCase.expected_result}</p>
                </div>
                ${testCase.test_data ? `
                <div class="test-data">
                    <h4>Test Data:</h4>
                    <p>${testCase.test_data}</p>
                </div>
                ` : ''}
            `;
            
            this.testCasesOutput.appendChild(testCaseElement);
        });
    }

    displayPlaywrightCode(code) {
        this.playwrightOutput.textContent = code;
        this.playwrightCard.style.display = 'block';
        
        // Highlight syntax
        if (window.Prism) {
            Prism.highlightElement(this.playwrightOutput);
        }
    }

    async copyPlaywrightCode() {
        try {
            await navigator.clipboard.writeText(this.currentPlaywrightCode);
            this.showToast('Playwright code copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy code:', error);
            this.showToast('Failed to copy code to clipboard', 'error');
        }
    }

    downloadPlaywrightCode() {
        this.downloadFile(this.currentPlaywrightCode, 'test-cases.spec.ts', 'text/typescript');
    }

    downloadJson() {
        const jsonData = JSON.stringify(this.currentTestCases, null, 2);
        this.downloadFile(jsonData, 'test-cases.json', 'application/json');
    }

    downloadTypeScript() {
        this.downloadFile(this.currentPlaywrightCode, 'test-cases.spec.ts', 'text/typescript');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showLoading(show) {
        this.loadingOverlay.style.display = show ? 'flex' : 'none';
        this.generateBtn.disabled = show;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        this.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    showApiDocs() {
        this.apiModal.style.display = 'flex';
    }

    hideApiDocs() {
        this.apiModal.style.display = 'none';
    }

    saveConfig() {
        const config = {
            openaiKey: this.openaiKeyInput.value,
            geminiKey: this.geminiKeyInput.value,
            primaryService: this.primaryServiceSelect.value
        };
        localStorage.setItem('testCaseGeneratorConfig', JSON.stringify(config));
    }

    loadSavedConfig() {
        const saved = localStorage.getItem('testCaseGeneratorConfig');
        if (saved) {
            try {
                const config = JSON.parse(saved);
                this.openaiKeyInput.value = config.openaiKey || '';
                this.geminiKeyInput.value = config.geminiKey || '';
                this.primaryServiceSelect.value = config.primaryService || 'gemini';
            } catch (error) {
                console.error('Failed to load saved config:', error);
            }
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TestCaseGenerator();
});

// Add some example requirements for quick testing
const exampleRequirements = [
    "As a user, I should be able to login with my email and password",
    "As a user, I should be able to reset my password via email",
    "As a user, I should be able to create a new account",
    "As a user, I should be able to view my profile information",
    "As a user, I should be able to update my account settings"
];

// Add example button functionality
document.addEventListener('DOMContentLoaded', () => {
    const requirementTextarea = document.getElementById('requirement');
    
    // Add example requirements as placeholder options
    const exampleContainer = document.createElement('div');
    exampleContainer.className = 'example-requirements';
    exampleContainer.innerHTML = `
        <h4>Quick Examples:</h4>
        <div class="example-buttons">
            ${exampleRequirements.map(req => 
                `<button class="btn btn-secondary example-btn" data-requirement="${req}">${req}</button>`
            ).join('')}
        </div>
    `;
    
    requirementTextarea.parentNode.insertBefore(exampleContainer, requirementTextarea.nextSibling);
    
    // Add click handlers for example buttons
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            requirementTextarea.value = btn.dataset.requirement;
        });
    });
});
