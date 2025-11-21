# 🎯 Upwork Proposal Generator

An AI-powered Next.js application that generates compelling Upwork proposals based on job requirements and your professional profile.

## ✨ Features

- **Smart Job Analysis**: Automatically extracts job details from Upwork URLs
- **AI-Powered Proposals**: Uses Groq API to generate tailored proposals
- **Match Scoring**: Calculates compatibility between your skills and job requirements
- **Customizable Output**: Choose tone (professional, friendly, confident) and length
- **Professional Templates**: Multiple proposal styles and formats
- **Copy-to-Clipboard**: Easy proposal copying for immediate use

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A free Groq API key ([Get it here](https://console.groq.com/keys))

### Installation

1. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd upwork-proposal-generator
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Groq API key to `.env.local`:
   ```
   GROQ_API_KEY=your_actual_groq_api_key_here
   ```

3. **Run the Application**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ How It Works

### Step 1: Profile Setup
- Enter your professional details
- Add skills, experience, and portfolio links
- Set your hourly rate and specializations

### Step 2: Job Analysis
- Paste any Upwork job URL
- Automatic extraction of job requirements, budget, and skills
- Smart parsing of client information

### Step 3: Proposal Generation
- AI analyzes job-profile compatibility
- Generates personalized proposals using Groq's LLM
- Provides match score and key selling points
- Offers customization options for tone and length

## 🔧 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Groq API (Llama3-8b-8192)
- **Web Scraping**: Cheerio, Axios
- **Deployment Ready**: Vercel, Netlify compatible

## 📊 Features Deep Dive

### Smart Job Analysis
- Extracts job title, description, budget, duration
- Identifies required skills automatically
- Parses client information and proposal count
- Fallback to demo data if scraping fails

### AI Proposal Generation
- Context-aware proposal writing
- Highlights relevant experience and skills
- Professional formatting ready for copy-paste
- Multiple tone options (professional, friendly, confident, conversational)
- Variable length (short, medium, comprehensive)

### Match Scoring Algorithm
- **Skills Match (40%)**: Alignment between your skills and job requirements
- **Experience Relevance (30%)**: Quality and relevance of your background
- **Portfolio Strength (20%)**: Presence and quality of work samples
- **Rate Competitiveness (10%)**: Hourly rate positioning

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Your Groq API key for AI generation | Yes |

## 📈 Usage Tips

### Getting the Best Results
1. **Complete Profile**: Fill out all profile fields for better AI context
2. **Specific Skills**: Use exact skill names that match job requirements
3. **Quality Portfolio**: Add 2-3 relevant portfolio items with descriptions
4. **Job URL Format**: Use direct Upwork job posting URLs

### Proposal Optimization
- **Review Generated Content**: Always review and customize before submitting
- **Add Personal Touch**: Include specific project questions or insights
- **Adjust Tone**: Match the client's communication style
- **Competitive Pricing**: Research market rates for better positioning

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Environment Setup for Production
```bash
vercel env add GROQ_API_KEY
```

### Alternative Deployment Options
- **Netlify**: Compatible with static export
- **Railway**: Full-stack deployment
- **Heroku**: Container-based deployment

## 🔧 Development

### Project Structure
```
app/
├── components/           # React components
│   ├── ProfileForm.tsx
│   ├── JobAnalyzer.tsx
│   └── ProposalGenerator.tsx
├── api/                 # API routes
│   ├── analyze-job/
│   └── generate-proposal/
├── types/               # TypeScript definitions
└── globals.css          # Global styles
```

### Adding New Features
1. **Custom Templates**: Modify proposal generation prompts
2. **Additional AI Models**: Extend API to support multiple providers
3. **Enhanced Scraping**: Add support for other job platforms
4. **Analytics**: Track proposal success rates

## 📝 API Documentation

### POST /api/analyze-job
Analyzes Upwork job URLs and extracts job information.

**Request Body:**
```json
{
  "jobUrl": "https://www.upwork.com/jobs/..."
}
```

**Response:**
```json
{
  "title": "Job Title",
  "description": "Job description...",
  "budget": "$500-$1000",
  "duration": "1-3 months",
  "skillsRequired": ["React", "Node.js"],
  "clientInfo": {...},
  "postedTime": "2 hours ago",
  "proposalsCount": "5-10 proposals"
}
```

### POST /api/generate-proposal
Generates AI-powered proposals based on user profile and job data.

**Request Body:**
```json
{
  "userProfile": {...},
  "jobData": {...},
  "preferences": {
    "tone": "professional",
    "length": "medium"
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: This README and inline code comments
- **API Issues**: Check Groq API status and documentation

## 🔮 Roadmap

- [ ] Multiple AI provider support (OpenAI, Claude, etc.)
- [ ] LinkedIn job posting support
- [ ] Proposal success tracking
- [ ] Template library expansion
- [ ] Browser extension for quick access
- [ ] Team collaboration features
- [ ] A/B testing for proposals

---

Built with ❤️ using Next.js and Groq AI