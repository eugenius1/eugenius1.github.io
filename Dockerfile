# The one place the Ruby version is set. Local runs, Claude's launch config and
# CI all use this image.
FROM ruby:3.3-slim

# The package lists are only needed to install, so they're deleted in the same step
# to keep them out of the image
RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential git \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /site
COPY Gemfile Gemfile.lock ./
RUN bundle install
