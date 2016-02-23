import webpack from 'webpack';
import path from 'path';
import fs from 'fs';

function getPages(){
    let pages = ["common"];
    let directories = fs.readdirSync("./src/app");
    for(let dir of directories){
        if(!dir.startsWith('.')){
            pages.push(dir);
        }
    }
    //let pages = ["couponBatchIntro"];
    return pages;
}

function getEntries(pages){
    let entries = {};
    for(let page of pages){
        let key = page === "common" ? page : `app/${page}`;
        let value = `./${key}/app.js`;
        entries[key] = [value, "webpack-hot-middleware/client?path=http://localhost:9090/__webpack_hmr&reload=true;"];
    }
    return entries;
}

let config = {
    devtool: 'source-map',
    context: path.join(__dirname, '/src'),
    entry: getEntries(getPages()),
    output: {
        path: path.join(__dirname, "dist/mc/touch/"),
        filename: "[name]/bundle.js",
        publicPath: "http://localhost:9090/mc/touch/"
    },
    module: {
        loaders: [{
            test: /\.css$/,
            loader: "style!css!autoprefixer"
        }, {
            test: /\.scss$/,
            // loader: "style!css!autoprefixer!sass"
            loader: "style!css?sourceMap!autoprefixer!sass?sourceMap"
        }, {
            test: /\.(png|jpg|gif)$/,
            loader: "url?name=[path][name].[ext]&limit=2048"
        }, {
            test: /\.(ttf|eot|svg|woff)(\?[a-z0-9]+)?$/,
            loader: "file?name=[path][name].[ext]"
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
        new webpack.HotModuleReplacementPlugin()
    ]
};

export default config;