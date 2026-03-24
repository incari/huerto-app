# Docker Deployment Guide

This guide explains how to deploy the Garden Planner app using Docker with SQLite persistence.

## Quick Start

### 1. Build and Run with Docker Compose

```bash
docker-compose up -d
```

This will:
- Build the Docker image
- Start the container on port 3000
- Create a persistent volume for the SQLite database

### 2. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

### 3. Stop the Application

```bash
docker-compose down
```

To stop and remove the database volume:
```bash
docker-compose down -v
```

## Manual Docker Commands

### Build the Image

```bash
docker build -t garden-planner .
```

### Run the Container

```bash
docker run -d \
  -p 3000:3000 \
  -v garden-data:/app/data \
  --name garden-planner \
  garden-planner
```

### View Logs

```bash
docker logs -f garden-planner
```

### Stop the Container

```bash
docker stop garden-planner
docker rm garden-planner
```

## Database

The SQLite database is stored in `/app/data/garden.db` inside the container and is persisted using a Docker volume named `garden-data`.

### Backup the Database

```bash
docker cp garden-planner:/app/data/garden.db ./backup-garden.db
```

### Restore the Database

```bash
docker cp ./backup-garden.db garden-planner:/app/data/garden.db
docker restart garden-planner
```

## Environment Variables

- `DATABASE_PATH`: Path to the SQLite database file (default: `/app/data/garden.db`)
- `NODE_ENV`: Node environment (set to `production` in Docker)

## Development

For local development without Docker:

```bash
npm install
npm run dev
```

The database will be created at `./data/garden.db` in your project directory.

## API Endpoints

- `GET /api/gardens` - List all gardens
- `POST /api/gardens` - Create a new garden
- `GET /api/gardens/[id]` - Get a specific garden
- `PUT /api/gardens/[id]` - Update a garden
- `DELETE /api/gardens/[id]` - Delete a garden

