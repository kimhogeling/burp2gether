import {getAuth} from "firebase/auth";
import {addDoc, collection, getFirestore, onSnapshot, orderBy, query, updateDoc, where} from "firebase/firestore";
import {User} from "../types/User.js";
import {readable} from "svelte/store";

let localAuthUser;
let localUsers;
let localUserDoc;

// detect login and save user into this field
export const authUser = readable(undefined, set => {
    getAuth().onAuthStateChanged(
        userOnStateChange => {
            localAuthUser = userOnStateChange;
            set(localAuthUser);
        },
        error => {
            console.error(error);
            if (confirm("Could not load login. Maybe reload to try again?")) {
                location.reload();
            }
        }
    );
});

export const users = readable(null, set => {
    // in Firebase the users collection is called Friend
    const usersRef = collection(getFirestore(), "friend");

    onSnapshot(query(usersRef, orderBy("nickname", "asc")), ({docs}) => {
        localUsers = new Map(docs.map(friend => User.of(friend.data())).map(u => [u.uid, u]));
        set(localUsers);

        // if the user is new, save it
        if (localUsers.size > 0 && localAuthUser && !localUsers.get(localAuthUser.uid)) {
            addDoc(usersRef, {
                uid: localAuthUser.uid,
                nickname: localAuthUser.displayName.split(" ")[0]
            }).catch(e => {
                console.error(e);
                window.alert("Crap! Couldn't add the new user.. Tell Kim!");
            });
        }
    });
});

export const userDoc = readable(null, set => {
    onSnapshot(query(collection(getFirestore(), "friend"), where("uid", "==", localAuthUser.uid)), ({docs}) => {
        localUserDoc = docs[0];
        set(localUserDoc);
    });
});

export function updateFavourites(add, burpUser) {
    const updatedFavourites = new Set(localUserDoc.data().favourites || []);
    if (add) {
        updatedFavourites.add(burpUser.uid);
    } else {
        updatedFavourites.delete(burpUser.uid);
    }

    return updateDoc(localUserDoc.ref, {favourites: [...updatedFavourites]}).catch(() => {
        alert(
            `Could not ${add ? "add" : "remove"} user ${burpUser.nickname}:${burpUser.uid} ${
                add ? "to" : "from"
            } favourites of user ${localUserDoc.data().nickname}:${
                localUserDoc.data().uid
            }. Please tell Kim about this!`
        );
    });
}
