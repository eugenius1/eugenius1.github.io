# The one place the Hugo and Node versions are set. Local runs, Claude's launch
# config and CI all use this image.
FROM node:24-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl git \
  && rm -rf /var/lib/apt/lists/*

ARG HUGO_VERSION=0.167.0
RUN arch="$(dpkg --print-architecture)" \
  && tarball="hugo_extended_${HUGO_VERSION}_linux-${arch}.tar.gz" \
  && base="https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}" \
  && curl -fsSLO "${base}/${tarball}" \
  && curl -fsSL "${base}/hugo_${HUGO_VERSION}_checksums.txt" | grep " ${tarball}\$" | sha256sum -c - \
  && tar -xzf "${tarball}" -C /usr/local/bin hugo \
  && rm "${tarball}"

WORKDIR /site
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force
