# Smart Stadium Crowd Management System

A React-based prototype for visualizing and optimizing crowd flow in stadiums using real-time data and intelligent routing.

## Features

- **Interactive Stadium Map**: Visual representation of stadium layout with overlay components
- **6 Gateway Components**: Exit gates with image upload capability and crowd density indicators
- **12 Corridor Screen Components**: Digital signage displays showing directional arrows and routing information
- **Mock Backend Simulation**: Simulates API response with crowd analysis and routing optimization
- **Real-time Updates**: Color-coded status indicators (green = optimal, red = crowded)
- **Responsive Design**: Built with Tailwind CSS for modern, responsive UI

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS 3** - Styling
- **Lucide React** - Icon library

## Installation

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to: `http://localhost:5173/`

## Usage

1. **Upload Crowd Images**: Click on any Gateway component (blue circles with "G1", "G2", etc.) to upload crowd images
2. **Analyze Flow**: Click the "Analyze & Optimize Flow" button to trigger the simulation
3. **View Results**: After 2 seconds, the system will display:
   - Gateway crowd counts and status (green/red borders)
   - Corridor screen directions (arrows pointing to optimal gateways)
4. **Reset**: Click "Reset" to clear all data and start over

## Customization

### Positioning Components

To match your actual stadium map, edit the positions in `src/App.jsx`:

```javascript
// Gateway positions (adjust top and left percentages)
const gatewayPositions = [
  { id: 1, top: '10%', left: '20%' },
  // ... more gateways
];

// Corridor positions
const corridorPositions = [
  { id: 1, top: '15%', left: '35%' },
  // ... more corridors
];
```

### Adding Your Stadium Map

1. Place your stadium map image (e.g., `5 (2).jpg`) in the `public` folder
2. Rename it to `stadium-map.jpg` or update the path in `src/App.jsx`:

```javascript
<div
  className="absolute inset-0 bg-cover bg-center opacity-30"
  style={{
    backgroundImage: 'url(/your-map-name.jpg)',
  }}
/>
```

## Component Structure

```
src/
├── App.jsx                    # Main application with map and logic
├── components/
│   ├── Gateway.jsx            # Gateway component with image upload
│   └── CorridorScreen.jsx     # Corridor display with directional arrows
├── index.css                  # Tailwind directives
└── main.jsx                   # Entry point
```

## Mock API Response Format

The application expects this JSON structure from the backend:

```json
{
  "gateways": [
    { "id": 1, "count": 45, "status": "optimal" },
    { "id": 2, "count": 120, "status": "crowded" }
  ],
  "corridors": [
    { "id": 1, "target_gateway_id": 3, "direction": "left" },
    { "id": 2, "target_gateway_id": 1, "direction": "right" }
  ]
}
```

## Next Steps

1. **Position Adjustment**: Move components to match actual stadium layout
2. **Backend Integration**: Replace `mockOptimizeFlow()` with real API calls
3. **Real-time Updates**: Implement WebSocket for live data streaming
4. **Camera Integration**: Connect actual crowd camera feeds
5. **Enhanced Analytics**: Add historical data, predictions, and dashboards

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Notes

- The mock simulation adds a 2-second delay to simulate API processing
- Gateway status changes to "crowded" (red) when count > 100
- Direction arrows support: left, right, straight
- All positions use percentage-based positioning for responsiveness
