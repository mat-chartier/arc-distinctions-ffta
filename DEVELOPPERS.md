# Getting Started for Backend

## Download NPM packages
```bash
cd backend
npm ci
```

## Starting a DB using Docker

```bash
cd backend
npm run db:run
```

## Starting a DB using docker - with persistent data folder
```bash
docker rm -fv postgresql-arc-distinctions
docker run --shm-size=256M  -e TZ=Europe/Amsterdam -d --name postgresql-arc-distinctions --network=host -e POSTGRES_DB=arcdistinctions -e POSTGRES_PASSWORD=postgres -e LC_ALL=en_US.UTF-8 -e LC_CTYPE=en_US.UTF-8 -e PGDATA=/var/lib/postgresql/data/pgdata -v ~/dev/data/dockerdbs/arcdistinctions:/var/lib/postgresql/data:Z -p 5432:5432 postgres:16.2
```

## Creating or upgrading the schema
```bash
cd backend
npm run db:upgrade
```

## Starting server
```bash
cd backend
npm run db:upgrade
```

