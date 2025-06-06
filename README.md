# Walking Directions App

A modern, responsive web application for planning walking routes using OpenStreetMap and OpenRouteService. Built with Next.js, React, and Leaflet.js.

## Features

- 🗺️ Interactive OpenStreetMap with Leaflet.js
- 📍 Add Points of Interest (POIs) by clicking on the map or searching
- 🚶 Calculate walking routes between multiple points
- ⏱️ Display distance and estimated walking time
- 🔄 Drag and drop to reorder POIs
- 🗑️ Remove individual POIs or clear all at once
- 📱 Fully responsive design
- ⚡ Real-time route calculation

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Get OpenRouteService API Key

1. Go to [OpenRouteService](https://openrouteservice.org/dev/#/signup) and create a free account
2. After signing up, go to your dashboard
3. Create a new API key for your application

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and add your OpenRouteService API key:
   ```
   NEXT_PUBLIC_OPENROUTESERVICE_API_KEY=your_actual_api_key_here
   ```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

### Adding Points of Interest

1. **Search Method**: Type a location name in the search box and click the search button
2. **Map Click Method**: Simply click anywhere on the map to add a point

### Managing Your Route

- **Reorder Points**: Drag and drop points in the sidebar to change the route order
- **Remove Points**: Click the X button next to any point to remove it
- **Clear All**: Use the "Clear All" button to start over

### Route Information

When you have 2 or more points, the app automatically:
- Calculates the optimal walking route
- Displays the route on the map as a blue line
- Shows total distance and estimated walking time

## Technical Details

### Architecture

- **Frontend**: Next.js 13 with React 18
- **Mapping**: Leaflet.js with react-leaflet
- **Styling**: Tailwind CSS with shadcn/ui components
- **Geocoding**: Nominatim (OpenStreetMap's free geocoding service)
- **Routing**: OpenRouteService API

### Key Components

- `MapContainer`: Main map display with markers and route visualization
- `POIInput`: Search interface for adding locations
- `POIList`: Sidebar showing all points with drag-and-drop reordering
- `RouteInfo`: Displays route statistics (distance and time)

### API Usage

- **Geocoding**: Uses Nominatim for converting place names to coordinates (free, no API key required)
- **Routing**: Uses OpenRouteService for calculating walking routes (requires free API key)

## Deployment

The app is configured for static export and can be deployed to any static hosting service:

```bash
npm run build
```

This creates a `out` directory with all static files ready for deployment.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_OPENROUTESERVICE_API_KEY` | Your OpenRouteService API key | Yes |

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+

## License

MIT License - feel free to use this code for your own projects!