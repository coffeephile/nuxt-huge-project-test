# Nuxt 3 Huge Project Test

Patch page navigation performance for Nuxt 3 + Nuxt Content projects with several thousand markdown pages.


## Setup

```
# 1. Make scripts executable

chmod +x \
install.sh \
run-5k-pages.sh \
run-10k-pages.sh \
patch-content-localhost.sh \
patch-content-localhost-undo.sh

# 2. Install packages

./install.sh
```


## Run with default Nuxt Content

```
# for slower machines
./run-5k-pages.sh

# OR (for faster machines)
./run-10k-pages.sh
```

Open http://localhost:3000 and navigate through markdown pages (slow...)


## Run with performance patch

```
# apply patch
./patch-content-localhost.sh

# for slower machines
./run-5k-pages.sh

# OR (for faster machines)
./run-10k-pages.sh
```

Open http://localhost:3000 and navigate through markdown pages (fast!)


## Revert patch

```
./patch-content-localhost-undo.sh
```
