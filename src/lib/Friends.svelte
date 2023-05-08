<script>
  import {addDoc, collection, getFirestore, onSnapshot, orderBy, query} from 'firebase/firestore';
  import {Friend} from "../types/Friend.js";

  export let friends;
  export let user;

  const friendsRef = collection(getFirestore(), 'friend');

  onSnapshot(query(friendsRef, orderBy("nickname", "asc")), (querySnapshot) => {
    friends = new Map();

    querySnapshot.docs
    .map((b) => Friend.of(b.data()))
    .forEach(f => {
      friends.set(f.uid, f);
    })
  });

  async function addUserToFriendDocs() {
    await addDoc(friendsRef, {
      uid: user.uid,
      nickname: user.displayName.split(' ')[0]
    })
    .catch(e => {
      console.error(e);
      window.alert('Crap! Couldn\'t create a nickname.. Tell Kim!')
    });
  }

  $: {
    if (user && friends && !friends.get(user.uid)) {
      addUserToFriendDocs();
    }
  }

</script>
