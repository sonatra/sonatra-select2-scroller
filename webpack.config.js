/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Encore = require('@symfony/webpack-encore');

const config = Encore
    .setOutputPath('build/')
    .setPublicPath('/build')
    .disableSingleRuntimeChunk()
    .autoProvidejQuery()
    .enableSourceMaps(!Encore.isProduction())
    .cleanupOutputBeforeBuild()
    .enableLessLoader()
    .addLoader(
        {
            test: /\.js$/,
            loader: 'babel-loader',
            query: {
                presets: ['@babel/preset-env'],
            },
        }
    )
    .addEntry('main', './examples/main.js')
    .addEntry('main-ajax', './examples/main-ajax.js')
    .copyFiles({
        from: './examples',
        to: '[name].[ext]',
        pattern: /.html$/
    })
    .getWebpackConfig()
;

// Config of ajax data
if (config.devServer) {
    config.devServer.inline = true;
    config.devServer.before = function (app) {
        let url = require('url'),
            querystring = require('querystring');

        /**
         * Generate the list.
         *
         * @param {Number} pn  The page number
         * @param {Number} ps  The page size
         * @param {Number} max The max size of the list
         *
         * @returns {Array}
         */
        function getItems(pn, ps, max) {
            let items = [],
                start = (pn - 1) * ps,
                end = 0 === ps ? max : Math.min(start + ps, max),
                i;

            for (i = start + 1; i <= end; i++) {
                items.push({
                    id:   'item_' + i,
                    text: 'Item ' + i
                });
            }

            return items;
        }

        app.get("/ajax.json", function(req, res){
            let params = querystring.parse(url.parse(req.url).query),
                max = 70,
                pn = 'pn' in params ? parseInt(params['pn']) : 1,
                ps = 'ps' in params ? parseInt(params['ps']) : 10,
                items = getItems(pn, ps, max);

            res.json({
                size: max,
                pageNumber: pn,
                pageSize: ps,
                items: items,
                sortColumns: {}
            });
        });
    };
}

module.exports = config;
