# Adonis serverless API application

This is the boilerplate for creating an serverless API server in AdonisJs and Now.sh, it comes pre-configured with.

1. Bodyparser
2. Authentication
3. CORS
4. Lucid ORM
5. Migrations and seeds

## Setup

Use the adonis command to install the blueprint

```bash
adonis new yardstick --blueprint=MatheusMK3/serverless-adonis
```

or manually clone the repo and then run `npm install` followed by `adonis deployment:prepare` to configure your Now.sh project and alias.

For more details regarding usage, please refer to the following guide: https://blog.matheus.io/serverless-adonis-in-zeit-now/


### Migrations

Run the following command to run startup migrations.

```js
adonis migration:run
```
