import { S3, MTurk, config } from 'aws-sdk'

config.update({
  region: 'us-east-1',
  endpoint: process.env.REACT_APP_ENDPOINT,
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
  }
})

export var mturk = new MTurk()

config.update({
  region: 'us-east-2',
  endpoint: null,
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
  }
})

export var s3 = new S3({
  // apiVersion: "2006-03-01",
  endpoint: undefined
})
