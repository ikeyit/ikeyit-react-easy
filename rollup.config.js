import pkg from './package.json';

export default {
    input: 'src/index.js',
    plugins: [
    ],
    external: ['react'],
    output: [
        {
            file: pkg.main,
            format: 'cjs',
        },
//        {
//            file: pkg.module,
//            format: 'es'
//        },
    ],
};
