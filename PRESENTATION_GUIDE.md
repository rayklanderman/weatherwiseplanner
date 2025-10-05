# NASA Space Apps Presentation Submission Guide

## 📋 Requirements Reminder
- ✅ Maximum 7 slides (including title)
- ✅ Public link (no password/permission required)
- ✅ Hosted on: YouTube, Google Drive, GitHub, OneDrive, or Dropbox
- ❌ Cannot require registration to view

---

## 🎨 Quick Start with Gamma AI

### Option 1: Use gamma_ai_prompt.txt (Fastest)
1. Go to [gamma.app](https://gamma.app)
2. Click "Create" → "Paste in text"
3. Copy entire content from `gamma_ai_prompt.txt`
4. Paste and click "Generate"
5. Review and customize
6. Export as PDF

### Option 2: Use presentation_prompt.json (Detailed)
1. Go to [gamma.app](https://gamma.app)
2. Click "Create" → "Paste in text"
3. Copy the "prompt" field from `presentation_prompt.json`
4. Paste and generate
5. Customize with images/screenshots
6. Export as PDF

---

## 🖼️ Images You'll Need

### Must-Have Screenshots:
1. **WeatherWise Interface** - Full app view with:
   - Map with location pin
   - Date selector
   - Weather condition toggles
   - Results panel

2. **AI Chat Example** - Show conversation with:
   - User question
   - AI response with percentages
   - Recommendations

3. **Data Visualization** - Chart showing:
   - Historical probabilities
   - Multiple years of data

### Where to Get Them:
```powershell
# Start your local server
yarn dev

# Open browser: http://localhost:5173
# Take screenshots of:
# - Full interface (Slide 3)
# - AI chat panel (Slide 5)
# - Results with charts (Slide 6)
```

### NASA Images (Free to Use):
- Earth from space: [NASA Image Gallery](https://images.nasa.gov)
- Satellite imagery: [NASA Earthdata](https://earthdata.nasa.gov/learn/backgrounds)
- MERRA-2 visuals: [NASA MERRA-2 Gallery](https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/)

---

## 📊 Creating the Presentation

### Using Gamma AI (Recommended - AI Generated):
```
1. Visit: https://gamma.app
2. Sign up/login (free tier works)
3. Create new presentation
4. Paste prompt from gamma_ai_prompt.txt
5. Let AI generate slides
6. Customize:
   - Replace placeholder images with screenshots
   - Add QR code (use qr-code-generator.com)
   - Adjust colors to exact NASA palette
7. Export as PDF
```

### Using PowerPoint/Google Slides (Manual):
```
1. Start with blank 16:9 presentation
2. Apply NASA color theme:
   - Background: #0B3D91 (NASA blue)
   - Text: #FFFFFF (white)
   - Accents: #FC3D21 (NASA red)
3. Follow PRESENTATION_OUTLINE.md structure
4. Add screenshots and images
5. Keep text minimal (3 bullets max per slide)
6. Save as PDF
```

### Using Canva (Design-Focused):
```
1. Visit: https://canva.com
2. Search template: "Tech Presentation 16:9"
3. Customize with NASA colors
4. Follow 7-slide structure
5. Add screenshots and visuals
6. Download as PDF
```

---

## 🔗 Creating QR Code for Slide 7

### Steps:
1. Go to [qr-code-generator.com](https://www.qr-code-generator.com)
2. Enter URL: `https://weatherwise.earth`
3. Customize:
   - Color: NASA blue (#0B3D91)
   - Style: Rounded
   - Size: 500x500px
4. Download PNG
5. Add to Slide 7

---

## 📤 Hosting & Sharing

### Option 1: Google Drive (Easiest)
```
1. Upload presentation.pdf to Google Drive
2. Right-click file → Share
3. Change to "Anyone with the link"
4. Ensure "Viewer" access (no editing)
5. Copy link
6. Test in incognito window (should open without login)
```

**Example link format:**
```
https://drive.google.com/file/d/[FILE_ID]/view?usp=sharing
```

### Option 2: GitHub (Developer-Friendly)
```powershell
# Create docs folder
mkdir docs

# Move presentation there
Move-Item presentation.pdf docs/

# Commit and push
git add docs/presentation.pdf
git commit -m "Add NASA Space Apps presentation"
git push origin main
```

**Link will be:**
```
https://github.com/rayklanderman/weatherwiseplanner/blob/main/docs/presentation.pdf
```

### Option 3: Dropbox
```
1. Upload to Dropbox
2. Click Share
3. Create link
4. Change settings to "Anyone with the link"
5. Copy link
```

### Option 4: OneDrive
```
1. Upload to OneDrive
2. Right-click → Share
3. "Anyone with the link can view"
4. Copy link
5. Test without login
```

---

## ✅ Pre-Submission Checklist

### Content:
- [ ] Exactly 7 slides (no more, no less)
- [ ] Slide 1: Title with NASA branding
- [ ] Slide 2: Problem statement
- [ ] Slide 3: Solution overview
- [ ] Slide 4: NASA data integration
- [ ] Slide 5: AI capabilities
- [ ] Slide 6: Features & impact
- [ ] Slide 7: Call-to-action with QR code

### Design:
- [ ] NASA color palette used (#0B3D91, #FC3D21, #FFFFFF)
- [ ] All text minimum 24pt font size
- [ ] High-quality images (no pixelation)
- [ ] Consistent layout across slides
- [ ] QR code links to weatherwise.earth
- [ ] NASA logo/attribution included

### Technical:
- [ ] Saved as PDF
- [ ] File size < 10MB
- [ ] Uploaded to public platform
- [ ] Link does NOT require:
  - Password
  - Permission request
  - Login/registration
  - Download (direct view preferred)
- [ ] Link tested in incognito/private window
- [ ] Link copied to clipboard for submission

### Legal:
- [ ] NASA images properly attributed
- [ ] No copyrighted content without permission
- [ ] Team name included
- [ ] Open source license mentioned (if applicable)

---

## 🚀 Submission Process

### On NASA Space Apps Platform:
1. Log into your Space Apps account
2. Go to your project page
3. Find "Demo" section
4. Select "Slide Presentation"
5. Paste your public link
6. Verify link works
7. Save/Submit

### Verification:
```
✅ Link opens without login
✅ PDF displays in browser
✅ All 7 slides visible
✅ Images load properly
✅ Text is readable
```

---

## 💡 Pro Tips

### For Maximum Impact:
1. **Lead with the problem** - Make judges relate immediately
2. **Show, don't tell** - Use actual screenshots, not mockups
3. **Emphasize NASA data** - This is the core differentiator
4. **Keep it simple** - Judges review hundreds of projects
5. **End strong** - Clear call-to-action and future vision

### Common Mistakes to Avoid:
- ❌ Too much text (max 3 bullets per slide)
- ❌ Tiny fonts (minimum 24pt)
- ❌ Low-quality screenshots
- ❌ Missing NASA attribution
- ❌ Broken links or QR codes
- ❌ Files requiring download to view

---

## 📝 Quick Links Reference

### Tools:
- Gamma AI: https://gamma.app
- Canva: https://canva.com
- QR Generator: https://qr-code-generator.com
- NASA Images: https://images.nasa.gov

### NASA Resources:
- MERRA-2 Info: https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/
- Earth Observations: https://earthdata.nasa.gov
- Style Guide: https://www.nasa.gov/audience/formedia/styleguide.html

### Your Project:
- Live Demo: https://weatherwise.earth (after deployment)
- GitHub: https://github.com/rayklanderman/weatherwiseplanner
- Local: http://localhost:5173

---

## 🎯 Example Public Link Formats

**Google Drive:**
```
https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j/view?usp=sharing
```

**GitHub:**
```
https://github.com/rayklanderman/weatherwiseplanner/blob/main/docs/presentation.pdf
```

**Dropbox:**
```
https://www.dropbox.com/s/abc123xyz/presentation.pdf?dl=0
```

**OneDrive:**
```
https://1drv.ms/b/s!ABC123xyz
```

---

## ⏱️ Time Estimate

- Generate with Gamma AI: 10-15 minutes
- Add screenshots: 5 minutes
- Customize design: 10 minutes
- Create QR code: 2 minutes
- Export to PDF: 1 minute
- Upload & share: 3 minutes
- **Total: ~30-35 minutes**

---

## 🆘 Troubleshooting

**"Link requires permission"**
- Solution: Change sharing to "Anyone with the link"

**"File too large to upload"**
- Solution: Compress images or export at lower quality

**"QR code doesn't work"**
- Solution: Test by scanning with phone, regenerate if needed

**"Gamma AI not generating properly"**
- Solution: Break prompt into smaller sections, generate slide by slide

**"Can't take screenshots"**
- Solution: Use browser dev tools (F12) → Device toolbar → Screenshot

---

## 📞 Support

If you need help:
1. Check PRESENTATION_OUTLINE.md for detailed content
2. Use gamma_ai_prompt.txt for quick generation
3. Follow this guide step-by-step
4. Test your link before submitting

**Remember:** The demo is a crucial part of your submission. Take time to make it professional and compelling!

Good luck! 🚀
