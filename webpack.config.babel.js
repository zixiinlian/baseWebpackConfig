import devConfig from './webpack.config.dev';
import productConfig from './webpack.config.product';
import {argv} from 'yargs';
let config = argv.dev ? devConfig: productConfig;
export default config;