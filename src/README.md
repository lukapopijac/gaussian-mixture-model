Build package for npm
---------------------
```bash
deno run -A build_npm.js <version>
cd npm
npm publish
```


Build GH Pages
--------------
```
cd demo
cp ../src/index.js .
npm install
npm run build
cd ..
rm -rf docs
mkdir docs
cp demo/dist/* -r docs
```
