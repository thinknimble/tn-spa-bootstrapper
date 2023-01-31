#!/usr/bin/env bash
# RM everything related to gql
find src -name '*.rest.tsx' -delete
rm   src/services/auth.ts src/services/axios-instance.ts
# Rename all the files that have the .rest extension
mv src/main.gql.tsx src/main.tsx
mv src/app.gql.tsx src/app.tsx
mv src/utils/routes.gql.tsx src/utils/routes.tsx
mv src/utils/auth.gql.tsx src/utils/auth.tsx
mv src/pages/log-in.gql.tsx src/pages/log-in.tsx
mv src/pages/sign-up.gql.tsx src/pages/sign-up.tsx
# perform the required replacements in imports so that we don't have to ask user to fix them
sed -i '' -e 's/.gql//' src/main.tsx
sed -i '' -e 's/.gql//' src/app.tsx
sed -i '' -e 's/.gql//g' src/utils/routes.tsx
sed -i '' -e 's/.gql//' src/app.test.tsx
sed -i '' -e 's/.gql//' src/pages/log-in.tsx
sed -i '' -e 's/.gql//' src/pages/sign-up.tsx