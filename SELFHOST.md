# Self Hosting

Your one-stop guide for self hosting Neptune!

## Requirements
- Docker (recommended)
- A reverse proxy if you want to access Neptune from outside
- A machine that is marginally better than a potato

## Setup

Neptune is a Next.JS app using Drizzle ORM. A volume is created to store the database and uploaded images.

> [!NOTE]
> Authentication is email + password only. Passwords are hashed and salted in the database with a secret you generate. Keep this safe!

## Installation

### Environment

The image uses the following env variables:
- `AUTH_SECRET` (REQUIRED): The secret that hashes passwords. Use one of the following commands to get the secret. Just copy the value, not `BETTER_AUTH_SECRET`.
	- `npx auth secret`
	- `pnpm dlx auth secret`
	- `yarn dlx auth secret`
- `AUTH_URL`: The URL of your application, like `https://neptune-demo.drewrat.dev`. Defaults to `http://localhost:3000`.
- `ALLOW_SIGNUPS`: If your application allows signups. Recommended to run with `true`, make your user, then restart with `false`. Defaults to `false`.

### Docker Compose

> [!NOTE]
> Docker Compose is recommended as it makes updating and managing the Neptune container easier.

- Clone the repo
	- `git clone https://github.com/mrdiamonddog/neptune`
- Copy `.env.example` to `.env` and fill out the values, described above
- Run Docker compose
	- `docker compose up -d`

### Standalone

```bash
docker run -d \
	--name neptune \
	-p 3000:3000 \
	-e AUTH_SECRET="[secret]" \
	-e AUTH_URL="[url of application]" \
	-e ALLOW_SIGNUPS="true" \
	ghcr.io/mrdiamonddog/neptune:master
```
Make sure to fill out the env vars in the \[brackets]! (Any optional envs not listed can be added with `-e NAME="value"`)

### Without Docker

> [!WARNING]
> You should really only use this option if you're going to be making changes to the code, as it's a lot harder to manage.

- Clone the repo
	- `git clone https://github.com/mrdiamonddog/neptune`
- Copy `.env.example` to `.env` and fill out the values, described above
- Install dependencies
	- `pnpm i`
- Init the database
	- `pnpm exec drizzle-kit push`
- Build the app
	- `pnpm build`
- Run it
	- `pnpm start`

Now Neptune should be running on port 3000!

## Reverse Proxy

Route your reverse proxy to point at port 3000, and make sure you change the `AUTH_URL` variable to the URL that your reverse proxy is accepting.

## Updates

Updates happen regularly. Keep your eyes on the GitHub for commits on the master branch.

To update:

- Docker compose
	- `docker compose pull && docker compose up -d`
- Standalone
	- Re-run the command in the [Installation](#Installation) section with `--pull always`.
- Without Docker
	- `git fetch && git pull`
	- `pnpm start`

If the update includes a database migration, run this command and follow the prompts.
- `docker exec -it neptune pnpm exec drizzle-kit push --allow-builds`
