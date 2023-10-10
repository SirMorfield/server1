#!/bin/bash
cd "${0%/*}"   # move to current directory, so execution is always relative to this file
/home/joppe/.bun/bin/bun offsite.ts INJECT_SERVER
