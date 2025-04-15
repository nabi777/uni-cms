
module.exports = {
  apps: [
    {
      name: 'vue-app',
      script: 'npm',
      args: 'run serve',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};

