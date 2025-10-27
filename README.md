# 🤖 AI Test Case Generator

A powerful tool that automatically generates QA test cases and Playwright test scripts from plain English requirements using AI (OpenAI GPT and Google Gemini).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)

## ✨ Features

- 🧠 **Hybrid AI Support**: Uses both OpenAI GPT and Google Gemini with automatic fallback
- 🎭 **Playwright Integration**: Generates ready-to-run Playwright TypeScript tests
- 🌐 **Web Interface**: Modern, responsive UI for easy use
- 📱 **CLI Support**: Command-line interface for developers
- 🔄 **API Endpoints**: RESTful API for integration
- 📊 **Structured Output**: JSON test cases with positive/negative scenarios
- 🚀 **Multiple Deployment Options**: Vercel, Netlify, Railway ready

## 🚀 Quick Start

### Option 1: Use the Web Interface (Recommended)

1. **Visit the live demo**: [https://your-app.vercel.app](https://your-app.vercel.app)
2. **Enter your API keys** (OpenAI and/or Gemini)
3. **Type your requirement** and click "Generate Test Cases"
4. **Copy or download** the generated test cases and Playwright code

### Option 2: Deploy Your Own Instance

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/test-case-generator.git
   cd test-case-generator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**: http://localhost:3000

## 🔑 API Keys Setup

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)

### Google Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key (starts with `AIza`)

### Environment Variables
Create a `.env` file in the project root:

```env
# At least one API key is required
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Configure primary service
AI_PRIMARY_SERVICE=gemini

# Optional: Model configurations
OPENAI_MODEL=gpt-4o-mini
GEMINI_MODEL=gemini-2.5-flash
```

## 📖 Usage Examples

### Web Interface
1. Open the web interface
2. Enter your API keys
3. Type a requirement like: "As a user, I should be able to login with my email and password"
4. Add acceptance criteria (optional)
5. Click "Generate Test Cases"

### CLI Usage
```bash
# Generate test cases
npm run start "As a user, I should be able to login with my email and password"

# Start API server
npm run api

# Generate without Playwright code
npm run start "User login requirement" --no-playwright
```

### API Usage
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "requirement": "User should be able to reset password",
    "generatePlaywright": true,
    "openaiKey": "your-openai-key",
    "geminiKey": "your-gemini-key"
  }'
```

## 📁 Generated Output

### Test Cases (JSON)
```json
[
  {
    "title": "Verify password reset with valid email",
    "type": "Positive",
    "steps": [
      "Navigate to login page",
      "Click on 'Forgot password?'",
      "Enter registered email",
      "Check inbox for reset link"
    ],
    "expected_result": "User should receive password reset email"
  }
]
```

### Playwright Test Code
```typescript
import { test, expect } from '@playwright/test';

test('Verify password reset with valid email', async ({ page }) => {
  await page.goto('https://app.example.com');
  await page.getByText('Forgot password?').click();
  await page.getByPlaceholder('Email').fill('test@example.com');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('Reset link sent')).toBeVisible();
});
```

## 🛠️ Development

### Project Structure
```
src/
├── main.ts                 # Entry point
├── services/              # AI service integrations
│   ├── openaiService.ts
│   ├── geminiService.ts
│   └── hybridAIService.ts
├── generators/            # Test case generators
│   ├── testCaseGenerator.ts
│   └── playwrightGenerator.ts
├── routes/               # API routes
│   └── aiRoutes.ts
├── utils/                # Utility functions
│   └── fileUtils.ts
└── types/                # TypeScript definitions
    └── index.ts
```

### Available Scripts
```bash
npm run build          # Build TypeScript
npm run start          # CLI mode
npm run api            # Start API server
npm run dev            # Development mode
npm run serve          # Production serve
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set up serverless functions for API routes

### Railway
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT models
- Google for Gemini models
- Playwright team for the amazing testing framework
- The open-source community

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/test-case-generator/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/test-case-generator/discussions)
- 📧 **Email**: your-email@example.com

---

**Made with ❤️ for the QA community**