FROM mysql:8.0

ARG UID
ARG GID

RUN test -n "$UID" || (echo "ERROR: UID is not set" && false)
RUN test -n "$GID" || (echo "ERROR: GID is not set" && false)

RUN usermod -u "$UID" mysql && groupmod -g "$GID" mysql
