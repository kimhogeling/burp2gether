const {Storage} = require('@google-cloud/storage');
const {Firestore} = require('@google-cloud/firestore');
const firestore = new Firestore();

exports.addDocumentForMP3 = (event, context) => {
  const filename = event.name;

  // only create docs for mp3 files
  if (filename.split('.')[1] !== 'mp3') {
    return false;
  }

  const date = filename.split('/')[1].split('_')[0];
  const uid = filename.split('/')[1].split('_')[1].split('.')[0];

  const documentData = {
    filename: filename,
    date: date,
    uid: uid
  };

  return firestore.collection('burp').add(documentData)
  .then((newDoc) => {
    console.info(`Document with id ${newDoc.id} created for file ${filename} in bucket ${event.bucket}`);
    return true;
  })
  .catch(err => {
    console.error(err);
    return false;
  });
};
