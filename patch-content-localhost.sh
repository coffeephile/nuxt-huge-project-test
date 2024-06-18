#!/bin/bash

cp patch-files/fix/module.mjs node_modules/@nuxt/content/dist/module.mjs
cp patch-files/fix/runtime/server/storage.js node_modules/@nuxt/content/dist/runtime/server/storage.js
cp -r patch-files/fix/runtime/server/plugins node_modules/@nuxt/content/dist/runtime/server/
