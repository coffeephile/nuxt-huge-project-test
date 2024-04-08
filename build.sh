#!/bin/bash

rm -rf docs/

NUXT_NUM_PAGES=500 \
NODE_OPTIONS="--max-old-space-size=4096" \
npm run generate
