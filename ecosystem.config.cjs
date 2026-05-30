module.exports = {
  apps: [
    {
      name: 'trie-visualization',
      script: './server.js',
      cwd: '/Users/cc11001100/github/fuck-algorithm/leetcode-208-implement-trie-prefix-tree',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      max_size: '50M',
      env: {
        NODE_ENV: 'production'
      },
      log_file: '/tmp/pm2-trie.log',
      out_file: '/tmp/pm2-trie-out.log',
      error_file: '/tmp/pm2-trie-error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
