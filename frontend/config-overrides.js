const webpack = require('webpack')

module.exports = function override(config) {
  // Add fallbacks for MUI module resolution
  config.resolve = {
    ...config.resolve,
    fallback: {
      ...config.resolve.fallback,
      crypto: false,
      stream: false,
      buffer: false,
    },
  }

  // Add alias for MUI
  config.resolve.alias = {
    ...config.resolve.alias,
    '@mui/material': '@mui/material',
    '@mui/lab': '@mui/lab',
    '@emotion/react': '@emotion/react',
    '@emotion/styled': '@emotion/styled',
  }

  return config
}
