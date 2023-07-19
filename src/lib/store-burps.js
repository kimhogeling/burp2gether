import {getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";
import {
  collection,
  doc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc
} from "firebase/firestore";
import {readable} from "svelte/store";
import {Burp} from "../types/Burp.js";
import {authUser} from "$lib/store-users.js";

// Check if the browser supports any of the needed audio formats
export const audioOptions = ["audio/webm", "audio/mp4"];
export const supportedAudioMimeType = audioOptions.find(
    MediaRecorder.isTypeSupported) || null;

const createISOStringWithTimezoneOffset = (date) => new Date(
    date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split(
    'T')[0]
export let todayString = createISOStringWithTimezoneOffset(new Date());
// this is just for midnight
window.setInterval(() => {
  let updatedTodayString = createISOStringWithTimezoneOffset(new Date());
  if (todayString !== updatedTodayString) {
    location.reload();
  }
}, 1000 * 60 * 2);

export const burps = readable(null, (set) => {
  onSnapshot(query(collection(getFirestore(), 'burp'), orderBy("date", "desc"),
      limit(100)), ({docs}) => {
    set(docs.map(b => Burp.of(b.id, b.data())));
  });
});

export const yourWinnerEachDay = readable(null, (set) => {
  burps.subscribe(bs => {
    authUser.subscribe(u => {
      if (bs) {
        set(bs
        .filter(({reactions}) => reactions?.WIN?.includes(u.uid))
        .reduce((m, b) => m.set(b.date, b.id), new Map()));
      }
    });
  })
})

export async function getFileFromStorage(filename) {
  try {
    return {
      url: await getDownloadURL(ref(getStorage(), filename)),
      fileType: `audio/${filename?.split('.')?.[1]}`
    };
  } catch (err) {
    let errorMessage = null;
    // A full list of error codes is available at
    // https://firebase.google.com/docs/storage/web/handle-errors
    switch (err.code) {
      case 'storage/object-not-found':
        errorMessage = 'The audio file for this burp could not be found in storage.';
        break;
      case 'storage/unauthorized':
        errorMessage = 'User doesn\'t have permission to access the object';
        break;
      case 'storage/canceled':
        errorMessage = 'User canceled the upload';
        break;
      case 'storage/unknown':
        errorMessage = 'Unknown error occurred, inspect the server response';
        break;
    }
    throw new Error(errorMessage);
  }
}

export function addReactionToFirebase(reaction, burp, authUser) {
  const updatedReactions = burp.reactions || {}

  if (!updatedReactions[reaction.key]) {
    updatedReactions[reaction.key] = [];
  }

  if (!updatedReactions[reaction.key].includes(authUser.uid)) {
    updatedReactions[reaction.key] = [authUser.uid,
      ...updatedReactions[reaction.key]];
  } else {
    updatedReactions[reaction.key] = updatedReactions[reaction.key].filter(
        uid => uid !== authUser.uid);
  }

  updateDoc(doc(getFirestore(), 'burp', burp.id), {
    reactions: updatedReactions
  });

  return updatedReactions;
}

export async function saveBurp(authUser, newBlob) {
  const supportedFileExtension = supportedAudioMimeType?.split('/')[1];
  const filename = `burp/${todayString}_${authUser.uid}.${supportedFileExtension}`;
  return uploadBytes(ref(getStorage(), filename), newBlob, {
    contentType: supportedAudioMimeType
  })
  .catch(e => {
    console.error('Something went wrong, couldn\'t save!', e);
    if (confirm(
        'Could not add the burp. '
        + 'Maybe a bad internet connection? '
        + 'Otherwise reloading the app might help. '
        + 'Press OK to reload.')) {
      location.reload();
    }
  })
}
