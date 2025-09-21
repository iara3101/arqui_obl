# syntax=docker/dockerfile:1
FROM node:20.18-bullseye

ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=${PNPM_HOME}:$PATH

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

WORKDIR /usr/src/app

COPY package.json tsconfig.json tsconfig.build.json nest-cli.json ./
COPY prisma ./prisma
COPY scripts ./scripts

RUN pnpm install --frozen-lockfile=false

COPY . .

EXPOSE 3000

CMD ["pnpm", "run", "dev"]
