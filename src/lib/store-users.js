import {getAuth} from "firebase/auth";
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query
} from 'firebase/firestore';
import {User} from "../types/User.js";
import {readable} from "svelte/store";

let localUser;
let localUsers;

// detect login and save user into this field
export const user = readable(undefined, (set) => {
  getAuth().onAuthStateChanged(userOnStateChange => {
    localUser = userOnStateChange;
    set(localUser);
  }, (error) => {
    console.error(error);
    if (confirm('Could not load login. Maybe reload to try again?')) {
      location.reload();
    }
  });
});

export const users = readable(undefined, (set) => {
  // in Firebase the users collection is called Friend
  const usersRef = collection(getFirestore(), 'friend');

  onSnapshot(query(usersRef, orderBy("nickname", "asc")), (querySnapshot) => {
    localUsers = new Map(
        querySnapshot.docs
        .map((friend) => User.of(friend.data()))
        .map(f => [f.uid, f])
    );
    set(localUsers);

    // if the user is new, save it
    if (localUsers.size > 0 && localUser && !localUsers.get(localUser.uid)) {
      addDoc(usersRef, {
        uid: localUser.uid,
        nickname: localUser.displayName.split(' ')[0]
      })
      .catch(e => {
        console.error(e);
        window.alert('Crap! Couldn\'t add the new user.. Tell Kim!')
      });
    }
  });
});
