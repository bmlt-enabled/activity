# BMLT Server Activity Report

[![Test](https://github.com/bmlt-enabled/activity/actions/workflows/test.yml/badge.svg)](https://github.com/bmlt-enabled/activity/actions/workflows/test.yml)
[![Release](https://github.com/bmlt-enabled/activity/actions/workflows/release.yml/badge.svg)](https://github.com/bmlt-enabled/activity/actions/workflows/release.yml)
[![codecov](https://codecov.io/gh/bmlt-enabled/activity/branch/main/graph/badge.svg)](https://codecov.io/gh/bmlt-enabled/activity)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/bmlt-enabled/activity/releases)

A modern Svelte 5 application that displays change activity reports from BMLT (Basic Meeting List Toolbox) servers. Track meeting changes, view statistics, and monitor service body activity with an intuitive, responsive interface.

## Features

- 📊 **Comprehensive Statistics** - View total changes, active users, and change type breakdowns
- 🔍 **Advanced Filtering** - Search and filter by meeting name, user, change type, or service body
- 📅 **Configurable Date Ranges** - Review activity from 1 to 365 days
- 🌐 **Multi-Server Support** - Connect to any BMLT root server
- 🎯 **Service Body Selection** - Track specific service bodies or entire regions
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🔄 **Real-time Diff Viewer** - See detailed line-by-line changes for each modification
- 💾 **Persistent Configuration** - Settings saved to browser localStorage
- 🌍 **Localization** - Full support for English and Spanish with automatic browser language detection
- 🌓 **Dark Mode** - Toggle between light and dark themes with persistent preference


## Technology

Built with [Svelte 5](https://svelte.dev/), TypeScript, and [Tailwind CSS](https://tailwindcss.com/). Uses the [bmlt-query-client](https://www.npmjs.com/package/bmlt-query-client) library to fetch data from BMLT servers.

## Installation

```bash
# Clone the repository
git clone https://github.com/bmlt-enabled/activity.git
cd activity

# Install dependencies
npm install

# Build for production
npm run build
```

The built application will be in the `dist/` directory, ready to deploy to any static hosting service.

## Configuration

On first launch, you'll be prompted to configure:

1. **BMLT Server** - Select from a list of available BMLT root servers
2. **Service Bodies** - Choose one or more service bodies to track
3. **Days to Look Back** - Specify how many days of history to fetch (1-365)

Configuration is automatically saved to your browser's localStorage and can be changed at any time using the Configure button.

### Language & Theme Settings

- **Language**: Click the language icon (🌐) in the header to switch between English and Spanish. The app automatically detects your browser's language preference on first visit.
- **Dark Mode**: Click the theme toggle button to switch between light and dark modes. Your preference is saved and persists across sessions.


## How It Works

1. **Configuration** - Select your BMLT server and service bodies on first launch
2. **Data Fetching** - Changes are retrieved from the BMLT API for your specified date range
3. **Statistics** - View aggregated data including total changes, active users, and change types
4. **Filtering** - Search and filter results instantly with client-side processing
5. **Detailed Views** - Click any change to see a detailed diff of what was modified

The app stores your configuration, language preference, and theme in your browser's localStorage for a seamless experience across sessions.


## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Development setup and guidelines
- Architecture and data flow diagrams
- Testing requirements and examples
- Code style and formatting rules
- Pull request process

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

- Bootstrapped with [Svelte 5 + TypeScript + Vite + Tailwind CSS Bootstrap](https://github.com/pjaudiomv/svelte5-vite-ts-tailwind-eslint)
- Built for the [BMLT (Basic Meeting List Toolbox)](https://bmlt.app/) community

## Support

For issues, questions, or suggestions, please [open an issue](https://github.com/bmlt-enabled/activity/issues) on GitHub.
