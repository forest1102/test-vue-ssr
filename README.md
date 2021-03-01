## Test Vue SSR with AWS lambda and S3.

1. install packages

   ```
   npm install
   ```

1. set config for server based on [here](https://github.com/vendia/serverless-express/tree/master/examples/basic-starter)

   ```
    npm run server config -- --account-id="<accountId>" --bucket-name="<bucketName>" [--region="<region>" --function-name="<functionName>"]
   ```

1. deploy SSR files to S3

   ```
   npm run web build-deploy
   ```

1. Setup Server

   ```
   npm run server setup
   ```
