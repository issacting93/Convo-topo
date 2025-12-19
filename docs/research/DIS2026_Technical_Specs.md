# Technical Specifications and Requirements
## Conversational Topography: DIS 2026 Interactivity Submission

## System Overview

Conversational Topography is a web-based interactive visualization that runs entirely in a modern web browser. The system visualizes human-LLM conversations as navigable 3D terrain using Three.js for rendering and React for the user interface.

## Technical Architecture

### Frontend Stack
- **Framework**: React 18.3.1 with TypeScript
- **3D Rendering**: Three.js 0.171.0
- **Build Tool**: Vite 6.0.1
- **Deployment**: Static site (can be served from any web server or CDN)

### Data Pipeline
- **Classification**: Pre-processed using Claude API (Anthropic)
- **Data Format**: JSON files containing conversation transcripts and classification metadata
- **Storage**: Local file system or static hosting (no database required)

### Browser Requirements
- **Recommended**: Chrome/Edge (Chromium-based) latest version
- **Minimum**: Any browser with WebGL 2.0 support
- **Fallback**: 2D mode available for browsers without WebGL

## Venue Requirements

### Physical Setup
- **Space**: 1 table (minimum 1.2m × 0.6m)
- **Power**: 1 standard power outlet (110V/220V compatible)
- **Network**: Optional (system can run fully offline with sample data)

### Hardware Requirements
- **Primary Device**: 1 laptop/desktop computer
  - **CPU**: Modern multi-core processor (Intel i5/AMD Ryzen 5 or equivalent)
  - **GPU**: Discrete GPU recommended (NVIDIA GTX 1050 / AMD RX 560 or better)
  - **RAM**: Minimum 8GB, 16GB recommended
  - **Display**: Built-in screen sufficient, external monitor (1920×1080 or higher) recommended for better visibility
  - **Input**: Mouse or trackpad required for 3D navigation
  - **Storage**: 500MB free space for application and sample data

### Software Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **Browser**: Chrome/Edge latest version (installed and tested)
- **No additional software installation required** (runs entirely in browser)

### Setup Time
- **Initial Setup**: 15 minutes (load application, verify sample data)
- **Between Participants**: 2-3 minutes (reset to default state, clear any user data)

## Network and Privacy

### Offline Operation
- System can run completely offline with pre-loaded sample conversations
- No internet connection required for core functionality
- Sample data included in application bundle

### Online Features (Optional)
- "Bring your own conversation" mode requires internet connection for LLM classification
- API calls use Anthropic Claude API (explicit user consent required)
- No data stored on remote servers by default

### Data Handling
- **Local Storage**: Browser localStorage used for user preferences only
- **No Persistent Data**: Conversation data not stored unless explicitly exported by user
- **Export**: User-initiated only, exports to local file system
- **Privacy Mode**: All user data can be cleared with single button click

## Risk Assessment and Mitigation

### Privacy Risks

**Risk**: Users may paste sensitive personal conversations  
**Mitigation**: 
- Clear warnings about data handling
- Explicit consent required for "bring your own conversation" mode
- No automatic data storage
- Easy data clearing mechanism
- Printed privacy guidelines at installation

**Risk**: Interpretive over-trust in visualization  
**Mitigation**:
- Prominent disclaimers that system is "analytic artifact, not diagnostic tool"
- Confidence scores and alternative readings displayed
- Uncertainty visualization (rougher terrain for low confidence)
- Printed guidance explaining interpretive nature

### Technical Risks

**Risk**: Browser compatibility issues  
**Mitigation**:
- Tested on multiple browsers before conference
- 2D fallback mode for unsupported browsers
- Clear browser requirements communicated

**Risk**: Performance issues on lower-end hardware  
**Mitigation**:
- Performance optimizations (LOD, throttled animations)
- Settings to reduce visual complexity
- Discrete GPU recommended but not required

**Risk**: Network connectivity issues  
**Mitigation**:
- Fully functional offline mode
- All sample data bundled with application
- No network dependency for core experience

### Physical Risks

**Risk**: Eye strain from extended 3D viewing  
**Mitigation**:
- 2D mode available
- Adjustable animation speed
- Regular breaks recommended

**Risk**: Motion sensitivity  
**Mitigation**:
- Animations can be disabled
- Static camera mode available
- Clear instructions for reducing motion

## Accessibility Features

### Visual Accessibility
- High-contrast color palettes available
- Contour-only mode (no 3D terrain, just lines)
- Adjustable text sizes
- Color-blind friendly palette options

### Motor Accessibility
- Full keyboard navigation
- Mouse/trackpad alternatives (touchpad gestures)
- Large click targets
- No time-sensitive interactions

### Cognitive Accessibility
- Clear labeling and instructions
- No hidden interactions
- Progressive disclosure (advanced features optional)
- Help text available throughout

### Screen Reader Support
- Full transcript panel with semantic HTML
- ARIA labels on all interactive elements
- Keyboard navigation with screen reader announcements
- Terrain visualization is supplementary, not required for understanding

## Installation and Setup

### Pre-Conference Setup
1. Download application bundle (single HTML file + assets, ~5MB)
2. Extract to local directory
3. Open `index.html` in Chrome browser
4. Verify sample conversations load correctly
5. Test all interaction modes

### On-Site Setup (15 minutes)
1. Connect laptop to power
2. Open application in browser
3. Verify display visibility (adjust brightness if needed)
4. Test mouse/trackpad navigation
5. Load sample conversations
6. Place printed privacy/usage guidelines near installation

### Reset Between Participants (2-3 minutes)
1. Click "Back to Grid" button
2. Clear any user-imported data (if applicable)
3. Reset to default view (depth metric mode)
4. Ready for next participant

## Troubleshooting

### Common Issues

**Issue**: Terrain not rendering  
**Solution**: Check WebGL support in browser, try 2D mode, verify GPU drivers updated

**Issue**: Slow performance  
**Solution**: Reduce contour count, disable post-processing effects, close other applications

**Issue**: Sample data not loading  
**Solution**: Verify files are in correct directory, check browser console for errors

**Issue**: Mouse navigation not working  
**Solution**: Check mouse is connected, try trackpad, verify browser focus

## Contact and Support

**During Conference**: At least one author will be present at all times during Interactivity session

**Technical Contact**: [Your email]

**Emergency Backup**: Application can be run from USB drive or cloud storage if primary device fails

## Diagrams

### System Architecture
```
┌─────────────────┐
│  User Browser   │
│  (Chrome/Edge)  │
└────────┬────────┘
         │
         ├───► React UI Components
         │
         ├───► Three.js 3D Renderer
         │
         └───► Local JSON Data
                (Sample Conversations)
```

### Data Flow
```
Conversation Transcript
    ↓
LLM Classification (Pre-processed)
    ↓
JSON Metadata (Roles, Metrics, Confidence)
    ↓
Terrain Generation (Fractal Noise + Metrics)
    ↓
3D Visualization (Three.js)
    ↓
User Interaction (Lens Switching, Navigation)
```

## Sample Data

The installation includes 20 pre-classified sample conversations covering:
- Various interaction patterns (collaborative, question-answer, advisory, casual-chat)
- Various terrain characteristics (different shapes, elevations, path patterns)
- Range of emotional tones and engagement styles
- Diverse role distributions (human and AI roles)

All sample conversations are:
- Non-identifying
- Publicly available or synthetic
- Clearly labeled as examples
- Representative of common interaction patterns

## Future Enhancements (Not Required for DIS)

- Real-time conversation import and classification
- Multi-conversation comparison mode
- Export visualization as images/video
- Collaborative exploration (multiple users)
- Mobile/tablet support

