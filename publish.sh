#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

version="$1"

foo="$(mktemp)"

sedscript=$(printf '/version/s/"[^"]*",/"%s",/' "$version")

sed "$sedscript" package.json > "$foo";

cat "$foo"
grep version "$foo"

result=y
read -p "Correct [Y/n]? " -r result

if [[ "${result/Y/y}" != 'y' ]]; then
  exit 1;
fi

mv "$foo" package.json

git add package.json

git commit -v

result=y
read -p "git tag and git push? [Y/n]? " -r result

if [[ "${result/Y/y}" != 'y' ]]; then
  exit 1;
fi

#npm run buildPub

git tag "v${version}"
git push git@github.com:cjdev/routedux.git
git push --tags git@github.com:cjdev/routedux.git


