#!/bin/bash

cp patch-files/fix-old/module.mjs node_modules/@nuxt/content/dist/module.mjs
cp patch-files/fix-old/runtime/server/storage.js node_modules/@nuxt/content/dist/runtime/server/storage.js
cp -r patch-files/fix-old/runtime/server/plugins node_modules/@nuxt/content/dist/runtime/server/
