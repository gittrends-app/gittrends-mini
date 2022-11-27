#!/bin/sh
docker compose exec postgres pg_dump -U ${POSTGRES_USER:-root} ${POSTGRES_DB:-gittrends.app} --no-owner | gzip -9  > $(pwd)/files/backup-$(date +%d-%m-%y).sql.gz