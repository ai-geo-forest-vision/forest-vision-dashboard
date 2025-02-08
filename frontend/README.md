# Forest Vision Dashboard

An interactive visualization dashboard for forest and green space monitoring using deck.gl and React.

## Features

- Interactive 3D map visualization
- Forest area visualization with health indicators
- Hexagonal aggregation for density analysis
- Satellite imagery base layer

## Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)
- Mapbox API token

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Create a `.env` file in the frontend directory with your Mapbox token:
   ```
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Development

The project is built with:
- Vite
- React + TypeScript
- deck.gl for visualization
- Material-UI for UI components
- Mapbox GL for base maps

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Map/
│   │       └── Map.tsx
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── index.html
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```


```bash

uvicorn app:app --host 0.0.0.0 --port 5003 --reload

npm run dev

```