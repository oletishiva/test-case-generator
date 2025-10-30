(() => {
  const inputTypeRadios = document.querySelectorAll('input[name="inputType"]');
  const htmlInputGroup = document.getElementById('htmlInputGroup');
  const screenshotInputGroup = document.getElementById('screenshotInputGroup');
  const urlInputGroup = document.getElementById('urlInputGroup');

  const generateBtn = document.getElementById('generateLocators');
  const clearBtn = document.getElementById('clearInputs');

  const pageSourceEl = document.getElementById('pageSource');
  const screenshotFileEl = document.getElementById('screenshotFile');
  const pageUrlEl = document.getElementById('pageUrl');
  const frameworkEl = document.getElementById('framework');
  const locatorStrategyEl = document.getElementById('locatorStrategy');
  const groupIntoPOMEl = document.getElementById('groupIntoPOM');
  const geminiKeyEl = document.getElementById('geminiKey');
  const openaiKeyEl = document.getElementById('openaiKey');

  const summaryEl = document.getElementById('locatorsSummary');
  const tableWrapperEl = document.getElementById('locatorsTableWrapper');
  const tableBodyEl = document.getElementById('locatorsTableBody');
  const pomBlockEl = document.getElementById('pomCodeBlock');
  const pomCodeEl = document.getElementById('pomCode');
  const copyCodeBtn = document.getElementById('copyCode');
  const downloadCodeBtn = document.getElementById('downloadCode');

  function setVisible(group, show) {
    group.style.display = show ? '' : 'none';
  }

  function onInputTypeChange() {
    const val = document.querySelector('input[name="inputType"]:checked').value;
    setVisible(htmlInputGroup, val === 'html');
    setVisible(screenshotInputGroup, val === 'screenshot');
    setVisible(urlInputGroup, val === 'url');
  }

  inputTypeRadios.forEach(r => r.addEventListener('change', onInputTypeChange));
  onInputTypeChange();

  function setLoading(isLoading, message) {
    generateBtn.disabled = isLoading;
    summaryEl.classList.remove('status-ok', 'status-error');
    summaryEl.textContent = message || (isLoading ? 'Analyzing input...' : '');
  }

  function getSavedConfig() {
    try {
      const saved = localStorage.getItem('testCaseGeneratorConfig');
      if (!saved) return {};
      return JSON.parse(saved) || {};
    } catch { return {}; }
  }

  async function requestAnalyze() {
    try {
      const val = document.querySelector('input[name="inputType"]:checked').value;
      let content = '';
      if (val === 'html') content = pageSourceEl.value.trim();
      else if (val === 'url') content = pageUrlEl.value.trim();
      else if (val === 'screenshot') content = '[screenshot uploaded - describe elements if needed]';
      else content = '';

      if (!content) {
        throw new Error('Please provide HTML source, URL, or screenshot (description)');
      }

      const cfg = getSavedConfig();

      const body = {
        inputType: val,
        content,
        preferredStrategy: locatorStrategyEl.value.replace('getBy','').toLowerCase() // rough mapping
          .replace('role','role').replace('text','text')
          .replace('label','label').replace('placeholder','placeholder')
          .replace('alttext','alt').replace('title','title').replace('testid','testid'),
        framework: frameworkEl.value,
        groupIntoPOM: groupIntoPOMEl.checked,
        // pass keys if entered here, else fallback to saved config (optional)
        openaiKey: (openaiKeyEl && openaiKeyEl.value.trim()) || cfg.openaiKey || undefined,
        geminiKey: (geminiKeyEl && geminiKeyEl.value.trim()) || cfg.geminiKey || undefined
      };

      const resp = await fetch('/api/locators/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const raw = await resp.text();
      let data;
      try { data = JSON.parse(raw); }
      catch { data = { success: false, error: `Invalid server response${raw ? `: ${raw.slice(0, 280)}` : ''}` }; }
      if (!data.success) throw new Error(data.error || 'Failed to generate locators');
      return { rows: [], code: data.code };
    } catch (e) {
      console.warn('Locator API failed, falling back to mock:', e);
      throw e;
    }
  }

  function mockAnalyze() {
    // Mock result to validate UI flow
    const rows = [
      { element: 'Email', role: 'textbox', locator: "page.getByLabel('Email')", confidence: 0.98 },
      { element: 'Password', role: 'textbox', locator: "page.getByLabel('Password')", confidence: 0.97 },
      { element: 'Login', role: 'button', locator: "page.getByRole('button', { name: 'Login' })", confidence: 0.96 },
    ];
    const code = `export class LoginPage {\n  constructor(private page: Page) {}\n\n  email = this.page.getByLabel('Email');\n  password = this.page.getByLabel('Password');\n  loginButton = this.page.getByRole('button', { name: 'Login' });\n\n  async login(email: string, password: string) {\n    await this.email.fill(email);\n    await this.password.fill(password);\n    await this.loginButton.click();\n  }\n}`;
    return { rows, code };
  }

  function renderTable(rows) {
    tableBodyEl.innerHTML = rows
      .map((r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${r.element}</td>
          <td>${r.role}</td>
          <td><code>${r.locator}</code></td>
          <td>${Math.round(r.confidence * 100)}%</td>
        </tr>
      `)
      .join('');
  }

  function download(filename, content) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  generateBtn.addEventListener('click', async () => {
    setLoading(true, 'Analyzing input...');
    tableWrapperEl.style.display = 'none';
    pomBlockEl.style.display = 'none';

    try {
      const { rows, code } = await requestAnalyze();
      renderTable(rows);
      tableWrapperEl.style.display = rows.length ? '' : 'none';
      summaryEl.classList.add('status-ok');
      summaryEl.textContent = `${rows.length} elements identified • Strategy: ${locatorStrategyEl.value.toUpperCase()} • Framework: ${frameworkEl.value}`;
      if (groupIntoPOMEl.checked && code) {
        pomCodeEl.textContent = code;
        pomBlockEl.style.display = '';
      }
    } catch (err) {
      summaryEl.classList.add('status-error');
      summaryEl.textContent = `Error: ${err instanceof Error ? err.message : 'Failed to generate locators'}`;
    } finally {
      generateBtn.disabled = false;
    }
  });

  clearBtn.addEventListener('click', () => {
    pageSourceEl.value = '';
    screenshotFileEl.value = '';
    pageUrlEl.value = '';
    tableBodyEl.innerHTML = '';
    tableWrapperEl.style.display = 'none';
    pomCodeEl.textContent = '';
    pomBlockEl.style.display = 'none';
    summaryEl.textContent = '';
  });

  copyCodeBtn.addEventListener('click', async () => {
    if (!pomCodeEl.textContent) return;
    await navigator.clipboard.writeText(pomCodeEl.textContent);
    copyCodeBtn.textContent = 'Copied!';
    setTimeout(() => (copyCodeBtn.textContent = 'Copy'), 1200);
  });

  downloadCodeBtn.addEventListener('click', () => {
    if (!pomCodeEl.textContent) return;
    download('PageObject.ts', pomCodeEl.textContent);
  });
})();


