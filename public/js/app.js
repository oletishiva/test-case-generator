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
        
        // Enhanced features elements
        this.jiraStoryIdInput = document.getElementById('jiraStoryId');
        this.fetchJiraStoryBtn = document.getElementById('fetchJiraStory');
        this.jiraStoryPreview = document.getElementById('jiraStoryPreview');
        this.jiraStoryContent = document.getElementById('jiraStoryContent');
        this.criteriaSourceRadios = document.querySelectorAll('input[name="criteriaSource"]');
        
        // Test Pyramid elements
        this.unitTestsSlider = document.getElementById('unitTests');
        this.integrationTestsSlider = document.getElementById('integrationTests');
        this.e2eTestsSlider = document.getElementById('e2eTests');
        this.unitPercent = document.getElementById('unitPercent');
        this.integrationPercent = document.getElementById('integrationPercent');
        this.e2ePercent = document.getElementById('e2ePercent');
        
        // Prioritization elements
        this.criticalSecurityCheckbox = document.getElementById('criticalSecurity');
        this.highCoreCheckbox = document.getElementById('highCore');
        this.mediumEdgeCheckbox = document.getElementById('mediumEdge');
        this.lowUICheckbox = document.getElementById('lowUI');
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generateTestCases());
        document.getElementById('copyPlaywrightBtn').addEventListener('click', () => this.copyPlaywrightCode());
        document.getElementById('downloadPlaywrightBtn').addEventListener('click', () => this.downloadPlaywrightCode());
        document.getElementById('downloadJsonBtn').addEventListener('click', () => this.downloadJson());
        document.getElementById('downloadTsBtn').addEventListener('click', () => this.downloadTypeScript());
        document.getElementById('apiDocsBtn').addEventListener('click', () => this.showApiDocs());
        document.querySelector('.close').addEventListener('click', () => this.hideApiDocs());
        
        // Enhanced features event bindings
        this.fetchJiraStoryBtn.addEventListener('click', () => this.fetchJiraStory());
        this.jiraStoryIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.fetchJiraStory();
        });
        
        // Criteria source change
        this.criteriaSourceRadios.forEach(radio => {
            radio.addEventListener('change', () => this.handleCriteriaSourceChange());
        });
        
        // Test Pyramid sliders
        this.unitTestsSlider.addEventListener('input', () => this.updatePyramidPercentages());
        this.integrationTestsSlider.addEventListener('input', () => this.updatePyramidPercentages());
        this.e2eTestsSlider.addEventListener('input', () => this.updatePyramidPercentages());
        
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
        
        // API keys are now optional - server will use environment variables if not provided
        // if (!openaiKey && !geminiKey) {
        //     this.showToast('Please provide at least one API key (OpenAI or Gemini)', 'error');
        //     return;
        // }

        this.showLoading(true);
        this.updateProgress('Initializing enhanced test generation...', 10);
        this.saveConfig();

        try {
            // Get test pyramid configuration
            const testPyramid = {
                unit: parseInt(this.unitTestsSlider.value),
                integration: parseInt(this.integrationTestsSlider.value),
                e2e: parseInt(this.e2eTestsSlider.value)
            };

            // Get prioritization rules
            const prioritizationRules = {
                critical: this.criticalSecurityCheckbox.checked,
                high: this.highCoreCheckbox.checked,
                medium: this.mediumEdgeCheckbox.checked,
                low: this.lowUICheckbox.checked
            };

            // Get acceptance criteria source
            const criteriaSource = document.querySelector('input[name="criteriaSource"]:checked').value;
            let acceptanceCriteria = '';
            
            if (criteriaSource === 'jira' && this.jiraStoryContent.textContent) {
                // Extract acceptance criteria from JIRA story
                const criteriaElement = this.jiraStoryContent.querySelector('.acceptance-criteria');
                acceptanceCriteria = criteriaElement ? criteriaElement.textContent.trim() : '';
            } else {
                acceptanceCriteria = this.acceptanceCriteriaTextarea.value.trim();
            }

            const requestBody = {
                requirement: requirement,
                generatePlaywright: this.generatePlaywrightCheckbox.checked,
                openaiKey: openaiKey || undefined,
                geminiKey: geminiKey || undefined,
                primaryService: this.primaryServiceSelect.value,
                acceptanceCriteria: acceptanceCriteria,
                testPyramid: testPyramid,
                prioritizationRules: prioritizationRules,
                jiraStoryId: this.jiraStoryIdInput.value.trim() || undefined
            };

            this.updateProgress('Generating enhanced test cases...', 30);

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
            this.displayEnhancedResults(data);
            this.updateProgress('Complete!', 100);
            
            setTimeout(() => {
                this.showToast('Enhanced test cases generated successfully!', 'success');
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
        
        // Create a tabular format
        const tableHTML = `
            <div class="test-cases-table-container">
                <h3>Generated Test Cases (${testCases.length} total)</h3>
                <div class="table-responsive">
                    <table class="test-cases-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Test Case</th>
                                <th>Type</th>
                                <th>Priority</th>
                                <th>Test Level</th>
                                <th>Steps</th>
                                <th>Expected Result</th>
                                <th>Test Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${testCases.map((testCase, index) => `
                                <tr class="test-case-row ${testCase.type.toLowerCase()}">
                                    <td class="test-number">${index + 1}</td>
                                    <td class="test-title">${testCase.title}</td>
                                    <td class="test-type">
                                        <span class="type-badge ${testCase.type.toLowerCase()}">${testCase.type}</span>
                                    </td>
                                    <td class="test-priority">
                                        <span class="priority-badge priority-${testCase.priority?.toLowerCase() || 'medium'}">${testCase.priority || 'Medium'}</span>
                                    </td>
                                    <td class="test-level">
                                        <span class="level-badge level-${testCase.testType?.toLowerCase() || 'e2e'}">${testCase.testType || 'E2E'}</span>
                                    </td>
                                    <td class="test-steps">
                                        <ol class="steps-list">
                                            ${testCase.steps.map(step => `<li>${step}</li>`).join('')}
                                        </ol>
                                    </td>
                                    <td class="test-expected">${testCase.expected_result}</td>
                                    <td class="test-data">${testCase.test_data || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        this.testCasesOutput.innerHTML = tableHTML;
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
            // Don't save API keys for security - let users enter their own each time
            primaryService: this.primaryServiceSelect.value
        };
        localStorage.setItem('testCaseGeneratorConfig', JSON.stringify(config));
    }

    loadSavedConfig() {
        const saved = localStorage.getItem('testCaseGeneratorConfig');
        if (saved) {
            try {
                const config = JSON.parse(saved);
                // Don't load API keys for security - let users enter their own
                this.openaiKeyInput.value = '';
                this.geminiKeyInput.value = '';
                this.primaryServiceSelect.value = config.primaryService || 'gemini';
            } catch (error) {
                console.error('Failed to load saved config:', error);
            }
        }
    }

    // Enhanced features methods
    async fetchJiraStory() {
        const storyId = this.jiraStoryIdInput.value.trim();
        if (!storyId) {
            this.showToast('Please enter a JIRA Story ID', 'error');
            return;
        }

        this.showLoading(true);
        this.updateProgress('Fetching JIRA story...', 20);

        try {
            const response = await fetch('/api/jira/fetch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ storyId })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch JIRA story');
            }

            this.displayJiraStory(data.story);
            this.updateProgress('JIRA story fetched successfully!', 100);
            
            // Auto-populate acceptance criteria if available
            if (data.story.acceptanceCriteria) {
                this.acceptanceCriteriaTextarea.value = data.story.acceptanceCriteria;
                document.querySelector('input[name="criteriaSource"][value="jira"]').checked = true;
            }

        } catch (error) {
            console.error('Error fetching JIRA story:', error);
            this.showToast(`Error: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    displayJiraStory(story) {
        this.jiraStoryContent.innerHTML = `
            <div class="jira-story-details">
                <h5>${story.title}</h5>
                <p><strong>Status:</strong> ${story.status}</p>
                <p><strong>Priority:</strong> ${story.priority}</p>
                <p><strong>Description:</strong></p>
                <div class="story-description">${story.description}</div>
                ${story.acceptanceCriteria ? `
                    <p><strong>Acceptance Criteria:</strong></p>
                    <div class="acceptance-criteria">${story.acceptanceCriteria}</div>
                ` : ''}
            </div>
        `;
        this.jiraStoryPreview.style.display = 'block';
    }

    handleCriteriaSourceChange() {
        const selectedSource = document.querySelector('input[name="criteriaSource"]:checked').value;
        
        if (selectedSource === 'jira') {
            this.acceptanceCriteriaTextarea.placeholder = 'Acceptance criteria will be fetched from JIRA story...';
            this.acceptanceCriteriaTextarea.disabled = true;
        } else {
            this.acceptanceCriteriaTextarea.placeholder = 'Enter acceptance criteria manually...';
            this.acceptanceCriteriaTextarea.disabled = false;
        }
    }

    updatePyramidPercentages() {
        const unit = parseInt(this.unitTestsSlider.value);
        const integration = parseInt(this.integrationTestsSlider.value);
        const e2e = parseInt(this.e2eTestsSlider.value);
        
        // Ensure total doesn't exceed 100%
        const total = unit + integration + e2e;
        if (total > 100) {
            // Adjust the last changed slider
            const excess = total - 100;
            if (this.unitTestsSlider === document.activeElement) {
                this.unitTestsSlider.value = Math.max(0, unit - excess);
            } else if (this.integrationTestsSlider === document.activeElement) {
                this.integrationTestsSlider.value = Math.max(0, integration - excess);
            } else if (this.e2eTestsSlider === document.activeElement) {
                this.e2eTestsSlider.value = Math.max(0, e2e - excess);
            }
        }
        
        this.unitPercent.textContent = this.unitTestsSlider.value;
        this.integrationPercent.textContent = this.integrationTestsSlider.value;
        this.e2ePercent.textContent = this.e2eTestsSlider.value;
    }

    displayEnhancedResults(data) {
        // Display test pyramid
        if (data.testPyramid) {
            this.displayTestPyramid(data.testPyramid);
        }

        // Display prioritized test cases
        if (data.prioritizedTestCases) {
            this.displayPrioritizedTestCases(data.prioritizedTestCases);
        } else {
            this.displayTestCases(data.testCases);
        }

        // Display traceability matrix
        if (data.traceabilityMatrix) {
            this.displayTraceabilityMatrix(data.traceabilityMatrix);
        }
        
        if (data.playwrightCode) {
            this.displayPlaywrightCode(data.playwrightCode);
        }

        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });

        // Store data for downloads
        this.currentTestCases = data.testCases;
        this.currentPlaywrightCode = data.playwrightCode;
    }

    displayTestPyramid(testPyramid) {
        const pyramidOutput = document.createElement('div');
        pyramidOutput.className = 'test-pyramid-output';
        pyramidOutput.innerHTML = `
            <h3>Generated Test Pyramid</h3>
            <div class="pyramid-chart">
                <div class="pyramid-level e2e">E2E Tests (${testPyramid.e2e}%)</div>
                <div class="pyramid-level integration">Integration Tests (${testPyramid.integration}%)</div>
                <div class="pyramid-level unit">Unit Tests (${testPyramid.unit}%)</div>
            </div>
        `;
        
        // Insert before test cases
        const testCasesOutput = document.getElementById('testCasesOutput');
        testCasesOutput.parentNode.insertBefore(pyramidOutput, testCasesOutput);
    }

    displayPrioritizedTestCases(prioritizedTestCases) {
        this.testCasesOutput.innerHTML = '';
        
        // Use the same tabular format as displayTestCases
        const tableHTML = `
            <div class="test-cases-table-container">
                <h3>Generated Test Cases (${prioritizedTestCases.length} total)</h3>
                <div class="table-responsive">
                    <table class="test-cases-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Test Case</th>
                                <th>Type</th>
                                <th>Priority</th>
                                <th>Test Level</th>
                                <th>Steps</th>
                                <th>Expected Result</th>
                                <th>Test Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${prioritizedTestCases.map((testCase, index) => `
                                <tr class="test-case-row ${testCase.type.toLowerCase()}">
                                    <td class="test-number">${index + 1}</td>
                                    <td class="test-title">${testCase.title}</td>
                                    <td class="test-type">
                                        <span class="type-badge ${testCase.type.toLowerCase()}">${testCase.type}</span>
                                    </td>
                                    <td class="test-priority">
                                        <span class="priority-badge priority-${testCase.priority?.toLowerCase() || 'medium'}">${testCase.priority || 'Medium'}</span>
                                    </td>
                                    <td class="test-level">
                                        <span class="level-badge level-${testCase.testType?.toLowerCase() || 'e2e'}">${testCase.testType || 'E2E'}</span>
                                    </td>
                                    <td class="test-steps">
                                        <ol class="steps-list">
                                            ${testCase.steps.map(step => `<li>${step}</li>`).join('')}
                                        </ol>
                                    </td>
                                    <td class="test-expected">${testCase.expected_result}</td>
                                    <td class="test-data">${testCase.test_data || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        this.testCasesOutput.innerHTML = tableHTML;
    }

    displayTraceabilityMatrix(traceabilityMatrix) {
        const matrixOutput = document.createElement('div');
        matrixOutput.className = 'traceability-matrix';
        
        let tableHTML = `
            <h3>Requirements Traceability Matrix</h3>
            <table>
                <thead>
                    <tr>
                        <th>Requirement</th>
                        <th>Test Cases</th>
                        <th>Coverage</th>
                    </tr>
                </thead>
                <tbody>
        `;

        traceabilityMatrix.forEach(item => {
            const coverageClass = item.coverage === 'Full' ? 'covered' : 
                                 item.coverage === 'Partial' ? 'partial' : 'not-covered';
            
            tableHTML += `
                <tr>
                    <td>${item.requirement}</td>
                    <td>${item.testCases.join(', ')}</td>
                    <td>
                        <span class="coverage-indicator ${coverageClass}"></span>
                        ${item.coverage}
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        matrixOutput.innerHTML = tableHTML;
        
        // Insert after test cases
        this.testCasesOutput.parentNode.insertBefore(matrixOutput, this.testCasesOutput.nextSibling);
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
