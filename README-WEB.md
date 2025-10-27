# 🌐 AI Test Case Generator - Web Application

A modern web application that generates comprehensive test cases and Playwright scripts from natural language requirements using AI.

## ✨ Features

### 🎯 **Core Functionality**
- **AI-Powered Generation**: Uses OpenAI GPT and Google Gemini
- **Hybrid AI Support**: Automatic fallback between AI services
- **Real-time Generation**: Instant test case creation
- **Playwright Integration**: Generates ready-to-run test scripts

### 🎨 **Modern Web Interface**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Beautiful gradient design
- **Real-time Feedback**: Loading states and progress indicators
- **Copy & Download**: Easy file management
- **Example Templates**: Quick-start requirements

### 🔧 **Developer Features**
- **API Documentation**: Built-in API explorer
- **Client-side API Keys**: No server-side key storage
- **Multiple AI Services**: OpenAI + Gemini support
- **Acceptance Criteria**: Enhanced requirement input

## 🚀 Quick Start

### Option 1: Use the Live Demo
Visit the deployed application and start generating test cases immediately!

### Option 2: Deploy Your Own Instance

#### **Vercel (Recommended)**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/test-case-generator)

1. Click the deploy button above
2. Connect your GitHub account
3. Deploy instantly!

#### **Netlify**
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/test-case-generator)

1. Click the deploy button above
2. Connect your GitHub account
3. Deploy instantly!

#### **Railway**
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

1. Click the deploy button above
2. Connect your GitHub account
3. Deploy instantly!

## 🎯 How to Use

### 1. **Get API Keys**
- **OpenAI**: Get your key from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Gemini**: Get your key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 2. **Enter Your Requirements**
```
As a user, I should be able to login with my email and password
```

### 3. **Add Acceptance Criteria (Optional)**
```
Given a user with valid credentials
When they enter their email and password
Then they should be logged in successfully
```

### 4. **Generate Test Cases**
- Click "Generate Test Cases"
- Wait for AI processing
- View generated test cases
- Download or copy the code

## 📋 Generated Output

### **Test Cases (JSON)**
```json
[
  {
    "title": "Successful Login with Valid Credentials",
    "type": "Positive",
    "steps": [
      "Navigate to the login page",
      "Enter a registered email address",
      "Enter the correct password",
      "Click the 'Login' button"
    ],
    "expected_result": "User is successfully logged in and redirected to the dashboard"
  }
]
```

### **Playwright Test Code**
```typescript
import { test, expect } from '@playwright/test';

test('Successful Login with Valid Credentials', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL('/dashboard');
});
```

## 🔧 API Usage

### **Generate Test Cases**
```bash
curl -X POST https://your-app.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "requirement": "As a user, I should be able to login",
    "openaiKey": "sk-...",
    "geminiKey": "AI...",
    "generatePlaywright": true
  }'
```

### **Response Format**
```json
{
  "success": true,
  "testCases": [...],
  "playwrightCode": "...",
  "metadata": {
    "testCaseCount": 3,
    "generatedAt": "2025-10-27T12:00:00Z"
  }
}
```

## 🛠️ Local Development

### **Prerequisites**
- Node.js 18+
- npm or yarn

### **Setup**
```bash
# Clone the repository
git clone https://github.com/yourusername/test-case-generator.git
cd test-case-generator

# Install dependencies
npm install

# Build the project
npm run build

# Start the development server
npm run api
```

### **Access the Application**
- Open http://localhost:3000 in your browser
- Start generating test cases!

## 🎨 Customization

### **Styling**
- Edit `public/css/style.css` for custom themes
- Modify `public/index.html` for layout changes
- Update `public/js/app.js` for functionality

### **AI Models**
- Change models in the API route handlers
- Add new AI services by extending the hybrid service
- Customize prompts for different use cases

### **Features**
- Add new test case types
- Implement user accounts
- Add test case history
- Create custom templates

## 🔒 Security

### **API Key Handling**
- ✅ Keys are sent from client to server
- ✅ Keys are not stored on the server
- ✅ Keys are only used for the specific request
- ✅ No logging of sensitive information

### **CORS Configuration**
- Configured for cross-origin requests
- Can be restricted for production use

## 📊 Performance

### **Optimizations**
- Client-side API key management
- Efficient AI service fallback
- Minimal server-side processing
- Responsive design for all devices

### **Scaling**
- Stateless architecture
- Serverless deployment ready
- Auto-scaling on demand
- Global CDN distribution

## 🐛 Troubleshooting

### **Common Issues**

1. **API Key Errors**
   - Verify your API keys are valid
   - Check your API quota/credits
   - Ensure proper key format

2. **Generation Failures**
   - Try with a different AI service
   - Check your internet connection
   - Verify the requirement is clear

3. **Deployment Issues**
   - Check platform-specific logs
   - Verify environment variables
   - Test locally first

### **Getting Help**
- Check the GitHub Issues page
- Review the deployment guide
- Test with minimal examples

## 📈 Roadmap

### **Planned Features**
- [ ] User authentication
- [ ] Test case history
- [ ] Custom templates
- [ ] Team collaboration
- [ ] Integration with CI/CD
- [ ] More AI providers
- [ ] Advanced test case types

### **Contributing**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support and questions:
- Create a GitHub issue
- Check the documentation
- Review existing issues

---

**Happy Testing! 🎯**

*Generate comprehensive test cases in seconds with the power of AI!*
