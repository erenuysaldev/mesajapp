const { override } = require('customize-cra');
const webpack = require('webpack');

module.exports = override(
    (config) => {
        // Eğer Webpack 5 kullanıyorsanız, fallback ayarını ekleyin
        config.resolve.fallback = {
            buffer: require.resolve('buffer/'),
            // Diğer polifiller burada eklenebilir
        };

        // Eğer başka bir ayar gerekiyorsa, burada ekleyebilirsiniz
        return config;
    }
);