# DriveS3Sync
Syncs Google Drive with Amazon S3. Uses Node/JavaScript.

I use this as a cheap double-backup solution for personal files. Google Drive stores the primary copies, used day to day through the Google Drive app. This process runs as an AWS lambda, finds files that aren't yet in S3 and syncs them over. S3 automatically transitions the files into the Glacier storage class for very cheap long term storage.
