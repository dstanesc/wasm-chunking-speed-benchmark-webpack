# Chunking speed benchmark

Webpack (browser) based benchmark for two content defined chunking algorithms: `fastcdc` and `buzhash`. For efficiency the chunking module is written in [rust](https://github.com/dstanesc/wasm-chunking-eval) and compiled in web assembly

The project uses [synthetic metrology data](https://www.npmjs.com/package/@dstanesc/fake-metrology-data) for data generation and [wasm-chunking-webpack-eval](https://www.npmjs.com/package/@dstanesc/wasm-chunking-webpack-eval) for chunking.



## Execute Benchmark

```
npm run clean // optional
npm install
npm run build
npm start
```

A browser page will open and guide the execution.

##  Example Results

![](./img/chunking-speed.png)

