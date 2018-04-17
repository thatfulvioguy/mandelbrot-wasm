#!/usr/bin/env bash
set -ex

rm -rf dist/*

webpack --mode production
cp src/index.html dist/

# TODO do we need to use nightly or not? use a rust-toolchain file if so
cargo build -p mandelbrot-wasm --release --target wasm32-unknown-unknown
cp ../target/wasm32-unknown-unknown/release/mandelbrot_wasm.wasm dist/
wasm-gc dist/*.wasm
