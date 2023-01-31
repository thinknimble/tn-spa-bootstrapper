#!/usr/bin/env bash
# RM everything related to gql
find src -name '*.gql.tsx' -delete
rm src/utils/mutations.ts src/utils/queries.ts src/utils/get-cookie.js src/services/apollo-client.js
# Rename all the files that have the .rest extension
mv src/app.rest.tsx src/app.tsx
mv src/main.rest.tsx src/main.tsx
mv src/utils/routes.rest.tsx src/utils/routes.tsx
mv src/utils/auth.rest.tsx src/utils/auth.tsx
mv src/pages/log-in.rest.tsx src/pages/log-in.tsx
mv src/pages/sign-up.rest.tsx src/pages/sign-up.tsx
# perform the required replacements in imports so that we don't have to ask user to fix them
sed -i '' -e 's/.rest//' src/main.tsx
sed -i '' -e 's/.rest//' src/app.tsx
sed -i '' -e 's/.rest//g' src/utils/routes.tsx
sed -i '' -e 's/.rest//' src/app.test.tsx
sed -i '' -e 's/.rest//' src/pages/log-in.tsx
sed -i '' -e 's/.rest//' src/pages/sign-up.tsx

