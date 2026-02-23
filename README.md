# Gochar Phal - Vedic Transit Calculator 🕉️

A professional Vedic astrology transit calculator with Swiss Ephemeris accuracy, PDF export, and bilingual support (English/Hindi).

## 🌟 Live Demo

**Deployed on Vercel**: [https://vedic-rajkumar.vercel.app](https://vedic-rajkumar.vercel.app)

## ✨ Features

- ✅ **Accurate Transit Calculations** - Verified against Swiss Ephemeris
- ✅ **PDF Export** - Professional landscape reports with coordinates
- ✅ **User Data Management** - Save profiles and birth details
- ✅ **Bilingual Interface** - Complete English/Hindi support
- ✅ **Offline Support** - Works without internet (local storage fallback)
- ✅ **Vedha Analysis** - Classical obstruction checking
- ✅ **Real-time Ephemeris** - Improved VSOP87 calculations
- ✅ **Responsive Design** - Works on all devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar.git

# Navigate to project directory
cd Vedic_Rajkumar

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

Visit http://localhost:8080

### Build for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

## 📦 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **PDF**: jsPDF + jspdf-autotable
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
5. Deploy!

See [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) for detailed instructions.

### Other Platforms

- **Netlify**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Cloudflare Pages**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **GitHub Pages**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 📖 Documentation

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) - Vercel-specific instructions
- [EPHEMERIS_ACCURACY.md](EPHEMERIS_ACCURACY.md) - Accuracy verification
- [PDF_EXPORT_GUIDE.md](PDF_EXPORT_GUIDE.md) - PDF feature documentation
- [USER_DATA_FEATURES.md](USER_DATA_FEATURES.md) - User data management
- [SUMMARY.md](SUMMARY.md) - Complete project overview

## 🎯 Usage

1. **Enter Birth Details**
   - Date, time, and place of birth
   - Or select from saved details

2. **View Transit Results**
   - See planetary positions
   - Check favorable/unfavorable transits
   - Review Vedha obstructions
   - Get overall score (X/9)

3. **Export PDF**
   - Click "Export PDF" button
   - Get professional landscape report
   - Coordinates displayed for verification

4. **Manage Profile**
   - Save user profile
   - Export/import data
   - Auto-save birth details

## 🔬 Accuracy

All planetary positions cross-verified with Swiss Ephemeris:
- **Rashi Level**: 100% accurate ✅
- **Degree Level**: Within 0.5° ✅
- **Nakshatra**: Verified ✅
- **Source**: aaps.space (Swiss Ephemeris)

See [EPHEMERIS_ACCURACY.md](EPHEMERIS_ACCURACY.md) for details.

## 🛡️ Security

- ✅ 0 vulnerabilities in production dependencies
- ✅ Supabase RLS policies enabled
- ✅ Environment variables for sensitive data
- ✅ HTTPS enforced on deployment
- ✅ Input validation and sanitization

## 📊 Project Structure

```
Vedic_Rajkumar/
├── src/
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── services/        # API and business logic
│   ├── data/            # Transit data and calculations
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utility functions
├── supabase/            # Database migrations
├── public/              # Static assets
└── docs/                # Documentation (*.md files)
```

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project follows Vedic astrology principles from classical texts in the public domain.

## 🙏 Acknowledgments

- **Classical Texts**: Phaladeepika, Brihat Parashara Hora Shastra
- **Ephemeris**: Swiss Ephemeris (Astrodienst)
- **Verification**: aaps.space
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar/issues)
- **Documentation**: See docs folder
- **Deployment Help**: See DEPLOYMENT_GUIDE.md

## 🎉 Sample Analysis

See [RAJKUMAR_CORRECTED_REPORT.md](RAJKUMAR_CORRECTED_REPORT.md) for a complete sample transit analysis with coordinates verification.

---

**Built with 🕉️ for accurate Vedic transit analysis**

**Repository**: https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar
**Live Demo**: https://vedic-rajkumar.vercel.app
