#!/bin/sh
docker run --rm -v "$(pwd)/files:/backups" \
  -u "$(id -u):$(id -g)" \
  -e POSTGRES_HOST=postgres \
  -e POSTGRES_DB=${POSTGRES_DB:-gittrends.app} \
  -e POSTGRES_USER=${POSTGRES_USER:-root} \
  -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-root} \
  prodrigestivill/postgres-backup-local /backup.sh
