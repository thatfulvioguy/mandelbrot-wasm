#!/usr/bin/env bash
set -ex

rm -rf dist/*

#npx parcel build index.html --public-url ./
npx webpack
cp src/index.html dist/

cargo build -p mandelbrot-wasm --release --target wasm32-unknown-unknown
cp ../target/wasm32-unknown-unknown/release/mandelbrot_wasm.wasm dist/
wasm-gc dist/*.wasm
