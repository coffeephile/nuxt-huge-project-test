# Nuxt 3 Huge Project Test

This repository is for reproducing an issue with Nuxt 3 + Nuxt Content, where a huge number of pages (2,000+) results in very long SSG build times.


## Setup

Make sure to install the dependencies:

```bash
# npm
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
```

## Static Build

Create a full static build:

```bash
# run provided build script
./build.sh
```

### Adjust Number of Pages

In `build.sh` change `NUXT_NUM_PAGES` to adjust the number of dynamically generated pages:

```
NUXT_NUM_PAGES=2500
```

Note: Dynamically created pages are written to disk to the folder `docs/`.\
The build script deletes this folder before each build, to ensure that previously generated pages don't remain.


## Observed Build Times

Machine used for testing:\
Intel MacBook Pro 16-inch, 2019\
2.6 GHz 6-Core Intel Core i7

Build times:

Number of Pages | Build Time | Details
--- | --- | ---
500 | 1 minute | ℹ Prerendered 2507 routes in 33.528 seconds<br>./build.sh  59.84s user 12.67s system 133% cpu 54.279 total
1,000 | 2.7 minutes | ℹ Prerendered 5007 routes in 130.491 seconds<br>./build.sh  159.59s user 24.06s system 117% cpu 2:35.82 total
1,500 | 5.5 minutes | ℹ Prerendered 7507 routes in 308.595 seconds<br>./build.sh  332.51s user 30.90s system 109% cpu 5:32.63 total
2,000 | 10.7 minutes | ℹ Prerendered 10007 routes in 597.693 seconds<br>./build.sh  640.98s user 45.73s system 109% cpu 10:24.89 total
2,500 | 17.3 minutes | ℹ Prerendered 12507 routes in 979.082 seconds<br>./build.sh  1039.01s user 62.08s system 108% cpu 16:50.75 total

With every 500 pages added, the build time gets significantly slower, posing a challenge for projects with 2,000+ pages.
