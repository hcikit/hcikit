import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";

// TODO: this could actually go into the react repo now because we can tree shake everything here.

export function createS3Uploader(
  AWS_REGION: string,
  AWS_COGNITO_IDENTITY_POOL_ID: string,
  AWS_S3_BUCKET: string
) {
  const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: AWS_REGION }),
      identityPoolId: AWS_COGNITO_IDENTITY_POOL_ID,
    }),
  });

  // https://blog.mturk.com/tutorial-how-to-create-hits-that-ask-workers-to-upload-files-using-amazon-cognito-and-amazon-s3-38acb1108633
  return function (filename: string, data: unknown) {
    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: filename,
      Body: JSON.stringify(data),
      ContentType: "json",
      ACL: "bucket-owner-full-control",
    });

    return s3Client.send(command);
  };
}
