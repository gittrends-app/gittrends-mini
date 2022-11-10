FROM postgres:14-alpine

RUN mkdir -p /docker-entrypoint-initdb.d

COPY initdb-adminpack.sh /docker-entrypoint-initdb.d/10_adminpack.sh
COPY postgresql.conf /etc/postgresql/postgresql.conf