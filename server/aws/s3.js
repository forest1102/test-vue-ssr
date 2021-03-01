const aws = require('aws-sdk')

class S3 {
  constructor(bucketName) {
    this.s3 = new aws.S3()
    this.bucketName = bucketName
  }
  getObject(key) {
    return this.s3.getObject({ Bucket: this.bucketName, Key: key }).promise()
  }
}

module.exports = S3
