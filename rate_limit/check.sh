#!/bin/bash

while true
do
  node rate_limit_monitor.js | prettyjson
  sleep 1
done
