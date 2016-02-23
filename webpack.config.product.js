import webpack from 'webpack';
import path from 'path';
import fs from 'fs';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import {argv} from 'yargs';

let hashStr = argv.nohash ? '' : '-[hash:5]';
let conhashStr = argv.nohash ? '' : '-[contenthash:5]';

function getPages(){
    let pages = ["common"];
    let directories = fs.readdirSync("./src/app");
    for(let dir of directories){
        if(!dir.startsWith('.')){
            pages.push(dir);
        }
    }
    return pages;
}

function getEntries(pages){
    let entries = {};
    for(let page of pages){
        let key = page === "common" ? page : `app/${page}`;
        let value = `./${key}/app.js`;
        entries[key] = value;
    }
    return entries;
}

function fileMappingPlugin(){
    this.plugin("done", function(stats){
        let output = {};
        let assetsByChunkName =  stats.toJson().assetsByChunkName;

        for (let chunkName in assetsByChunkName) {
            let chunkValue = assetsByChunkName[chunkName],
                mainPath = "/mc/touch/";

            // Webpack outputs an array for each chunkName when using sourcemaps and some plugins
            if (chunkValue instanceof Array) {
                for (let i = 0; i < chunkValue.length ; i++) {
                    let asset = chunkValue[i];
                    let originalPath = asset.replace(/-[0-9a-z]+\./i, '.');
                    output[mainPath + originalPath] = mainPath + asset;
                }
            } else {
                let originalPath = chunkValue.replace(/-[0-9a-z]+\./i, '.');
                output[mainPath + originalPath] = mainPath + chunkValue;
            }
        }
        fs.writeFile(
            path.join(__dirname, "webpack-assets.json"),
            JSON.stringify(output)
        );
    })
}

let config = {
    context: path.join(__dirname, '/src'),
    entry: getEntries(getPages()),
    output: {
        publicPath: '/mc/touch/',
        path: path.join(__dirname, "dist/mc/touch/"),
        filename: "[name]/bundle" + hashStr + ".js",
    },
    module: {
        loaders: [{
            test: /\.css$/,
            loader: ExtractTextPlugin.extract("css!autoprefixer")
        }, {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract("css!autoprefixer!sass")
        }, {
            test: /\.(png|jpg|gif)$/,
            loader: "url?name=[path][name]" + hashStr + ".[ext]&limit=2048"
        }, {
            test: /\.(ttf|eot|svg|woff)(\?[a-z0-9]+)?$/,
            loader: "file?name=[path][name]" + hashStr + ".[ext]"
        }, {
            test: /\.js$/,
            loader: "babel",
            exclude: /node_modules/
        }, {
            test: /\.html$/,
            loader: "html?minimize=false!html-minify"   //Minize function of html-loader has bugs, it doesn't work with ko template.
        }]
    },
    'html-minify-loader': {
         comments: true     // KEEP comments
    },
    resolve: {
        root: ["src/lib"],
        modulesDirectories: ["node_modules", "src/components"]
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new ExtractTextPlugin("[name]/css/bundle" + conhashStr + ".css"),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        fileMappingPlugin
    ]
};

export default config;