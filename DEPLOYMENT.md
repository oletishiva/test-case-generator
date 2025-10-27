# Deployment Guide

This guide covers deploying the AI Test Case Generator to various free hosting platforms.

## 🚀 Quick Deploy Options

### 1. Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/test-case-generator)

**Steps:**
1. Fork this repository
2. Connect your GitHub account to Vercel
3. Import the repository
4. Vercel will automatically detect the `vercel.json` configuration
5. Deploy!

**Environment Variables (Optional):**
- `NODE_ENV=production`

### 2. Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/test-case-generator)

**Steps:**
1. Fork this repository
2. Connect your GitHub account to Netlify
3. Import the repository
4. Netlify will use the `netlify.toml` configuration
5. Deploy!

### 3. Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

**Steps:**
1. Fork this repository
2. Connect your GitHub account to Railway
3. Create a new project from GitHub
4. Railway will use the `railway.json` configuration
5. Deploy!

### 4. Render

**Steps:**
1. Fork this repository
2. Connect your GitHub account to Render
3. Create a new Web Service
4. Set build command: `npm run build`
5. Set start command: `npm run api`
6. Deploy!

## 🔧 Manual Deployment

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development
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

### Production Build
```bash
# Build for production
npm run build

# Start production server
NODE_ENV=production npm run api
```

## 🌐 Environment Configuration

### Required Environment Variables
- None! The app uses client-provided API keys

### Optional Environment Variables
- `NODE_ENV=production` - Sets production mode
- `PORT=3000` - Server port (default: 3000)

## 📱 Features

### Web Interface
- ✅ Modern, responsive design
- ✅ Real-time test case generation
- ✅ API key management (client-side)
- ✅ Download generated files
- ✅ Copy to clipboard functionality
- ✅ Example requirements
- ✅ API documentation

### API Endpoints
- `GET /` - Web interface
- `POST /api/generate` - Generate test cases
- `GET /api/health` - Health check
- `GET /api/files` - List generated files

### Supported AI Services
- ✅ OpenAI (GPT-4, GPT-4o-mini, etc.)
- ✅ Google Gemini (gemini-1.0-pro, etc.)
- ✅ Automatic fallback between services

## 🔒 Security Considerations

### API Key Handling
- API keys are sent from client to server
- Keys are not stored on the server
- Keys are only used for the specific request
- No logging of API keys

### CORS Configuration
- Configured for cross-origin requests
- Allows all origins (can be restricted for production)

## 📊 Usage Limits

### Free Tier Limits
- **Vercel**: 100GB bandwidth/month, 1000 serverless function invocations
- **Netlify**: 100GB bandwidth/month, 300 build minutes
- **Railway**: $5 credit/month
- **Render**: 750 hours/month

### AI Service Limits
- **OpenAI**: Based on your API plan
- **Gemini**: Based on your API quota

## 🛠️ Customization

### Styling
- Edit `public/css/style.css` for custom styling
- Modify `public/index.html` for layout changes

### Functionality
- Edit `public/js/app.js` for frontend logic
- Modify `src/routes/aiRoutes.ts` for API changes

### AI Models
- Update model configurations in the route handlers
- Add new AI services by extending the hybrid service

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   - Ensure Node.js 18+ is installed
   - Check that all dependencies are installed
   - Verify TypeScript compilation

2. **API Key Errors**
   - Verify API keys are valid
   - Check API key permissions
   - Ensure sufficient quota/credits

3. **CORS Issues**
   - Check CORS configuration
   - Verify request headers
   - Test with different browsers

4. **Deployment Issues**
   - Check platform-specific logs
   - Verify environment variables
   - Test locally first

### Getting Help
- Check the GitHub Issues page
- Review platform-specific documentation
- Test with minimal examples first

## 📈 Performance Optimization

### Frontend
- Minify CSS and JavaScript
- Optimize images
- Use CDN for static assets

### Backend
- Implement caching for repeated requests
- Add rate limiting
- Monitor API usage

### Database (Optional)
- Add database for storing generated test cases
- Implement user accounts
- Add test case history

## 🔄 Updates and Maintenance

### Regular Updates
- Keep dependencies updated
- Monitor AI service changes
- Update model configurations

### Monitoring
- Set up error tracking (Sentry, etc.)
- Monitor API usage
- Track user engagement

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Create a GitHub issue
- Check the documentation
- Review existing issues

---

**Happy Testing! 🎯**
