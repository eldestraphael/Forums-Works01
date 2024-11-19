const zoomHeaders = [
  {
    key: "Cross-Origin-Embedder-Policy",
    value: "credentialless"
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin"
  }
]

const oAuthHeaders = [
  {
    key: "Cross-Origin-Embedder-Policy",
    value: ""
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: ""
  }
]

module.exports = {
  reactStrictMode: false,
  webpack: (config) => {
    config.resolve.alias.canvas = false;
  
    return config;
  },
  async headers() {
    return [
      // {
      //   source: '/forums/:path*',
      //   headers: zoomHeaders,
      // },
      {
        source: '/:path*',
        headers: oAuthHeaders,
      },
      {
        source: '/forums/:path*',
        headers: zoomHeaders,
      }
    ]
  }
}