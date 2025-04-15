module.exports = {
  apps: [
    {
      name: "vue-app",
      script: "npm",
      args: "run serve",
      env: {
        NODE_ENV: "production",
        VUE_APP_API_BASE_URL: "http://47.129.159.48:3000",
      },
      node_args: "--max-old-space-size=4096", // Increase memory to 4GB
    },
  ],
};

