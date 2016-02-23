import Koa from 'koa';
import cors from 'koa-cors';
import webpack from 'webpack';
import path from 'path';
import serveMiddlware from 'koa-static';
import router from 'koa-router';
import devMiddleware from 'koa-webpack-dev-middleware';
import hotMiddleware from 'koa-webpack-hot-middleware';
import config from './webpack.config.babel';

let app = new Koa(),
	routerMiddleware = router(),
	compiler = webpack(config);

//In order to use HMR for style, css file is not extracted in dev environment. 
//And to compatible with embeded style, every request for css files need to handled specially to avoid error in console
// routerMiddleware.get("*/bundle.css*", function* (next){
//     this.set({
//         "Content-Type": "text/css"
//     });
//     this.body = "";
// })

app.use(routerMiddleware.routes());
app.use(cors({
	credentials: true
}));
// app.use(serveMiddlware(__dirname + "/dist/"));
app.use(devMiddleware(compiler, {
    publicPath: "/mc/touch/",
    hot: true
    // quiet: true
}));
app.use(hotMiddleware(compiler));

app.listen(9090, function(){
	console.log("listen at port http://localhost:9090");
});