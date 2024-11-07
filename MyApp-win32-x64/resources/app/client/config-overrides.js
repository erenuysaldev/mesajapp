const { override } = require('customize-cra');

module.exports = override(
    (config) => {
        // Eğer Webpack 5 kullanıyorsanız, fallback ayarını ekleyin
        config.resolve.fallback = {
            buffer: require.resolve('buffer/'),
        };

        return config;
    }
);