#!/bin/bash
psql -U postgres arcdistinctions -c "create ROLE arcdistinctions WITH PASSWORD 'arcdistinctions' LOGIN SUPERUSER;"
echo "$POSTGRES_HOST:*:*:arcdinstinctions:postgres" > ~/.pgpass && chmod 600 ~/.pgpass
psql -U postgres arcdistinctions -c "create SCHEMA arcdistinctions"
