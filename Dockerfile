# The one place the Node and Ruby versions are set. Local runs, Claude's launch
# config and CI all use this file.

# Compiles and tests the TypeScript in _ts/. compose.yaml mounts the repository
# over /site, so the packages are linked from /node_modules, where Node looks after
# /site/node_modules.
FROM node:26-slim AS node
WORKDIR /deps
COPY package.json package-lock.json ./
RUN npm ci --no-fund --no-audit && ln -s /deps/node_modules /node_modules
ENV PATH=/deps/node_modules/.bin:$PATH
WORKDIR /site

# Builds the site. Last, so it's the default.
FROM ruby:3.3-slim

# The package lists are only needed to install, so they're deleted in the same step
# to keep them out of the image. HTML-Proofer loads libcurl even when it doesn't
# fetch other sites.
RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential git libcurl4 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /site
COPY Gemfile Gemfile.lock ./
RUN bundle install
