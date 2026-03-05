# SNA Draw Request Reorganizer

A web application to reorganize SNA Draw Request Excel files by lot name with automatic totals.

## Features

✅ **Drag-and-drop file upload**  
✅ **Excel file reorganization** - Groups by SN Loan # (Lot Name)  
✅ **Automatic totals** - Calculates sum for each lot  
✅ **Download processed file**  
✅ **Upload history** - Track all previous uploads  
✅ **Error handling** - User-friendly error messages  
✅ **Team access** - Designed for team collaboration  
✅ **Navy & Teal design** - Professional branding  

## Quick Start

### Installation

```bash
cd sna-draw-request-app
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## How It Works

1. **Upload** - Drag and drop your Excel file or click to select
2. **Process** - Click Submit to reorganize the file
3. **Download** - Get your reorganized file immediately
4. **History** - View all previous uploads on the History page

## File Format

The app expects Excel files with:
- Column G: "SN Loan # - Lot Name"
- Column H: "Amount" (for totals)
- Standard header row

## Deployment

Deploy to Vercel with one click:

```bash
vercel deploy
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Environment Setup

The app stores upload history in `data/history.json` (created automatically).

## Architecture

- **Frontend**: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Processing**: Python script executed on VPS
- **Storage**: JSON file storage for history
- **Files**: Stored in `public/uploads` and `public/results`

## Project Structure

```
sna-draw-request-app/
├── app/
│   ├── page.tsx              # Upload page
│   ├── history/page.tsx      # History page
│   ├── api/
│   │   ├── upload/route.ts   # Upload endpoint
│   │   └── history/          # History endpoints
│   ├── globals.css           # Global styles
│   └── layout.tsx            # Root layout
├── public/
│   ├── uploads/              # Uploaded files
│   └── results/              # Processed files
├── data/
│   └── history.json          # Upload history
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## Configuration

### Tailwind Colors

- Navy: `#0F3A7D`
- Teal: `#06B6D4`

Customize in `tailwind.config.ts`

## Troubleshooting

### File Not Processing
- Ensure file has correct format (Column G for Lot Name, Column H for Amount)
- Check that columns are named correctly
- Verify Excel file is not corrupted

### History Not Loading
- Check that `data/history.json` was created
- Ensure proper file permissions

### Download Not Working
- Verify file was created in `public/results/`
- Check that download link is correct

## Support

For issues or questions, contact your team administrator.

---

**Built with ❤️ for SNA**  
Navy & Teal Design | Excel Organization | Team Collaboration
