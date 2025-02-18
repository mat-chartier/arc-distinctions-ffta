#!/bin/bash
while (! psql -U postgres -h localhost $1 -c "$2" > /dev/null 2>&1); do sleep 0.5s; echo -n .; done