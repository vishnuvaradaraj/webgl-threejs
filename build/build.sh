#!/bin/sh

python build.py --include common  --output ../webroot/js/parabaycinema.js
python build.py --include common  --minify --output ../webroot/js/parabaycinema.min.js
python genincludes.py --include common --output includes.html
