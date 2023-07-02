<script>
  import {addDoc, collection, getFirestore, onSnapshot, orderBy, query} from 'firebase/firestore';
  import {User} from "../types/User.js";

  export let users;
  export let user;

  // in Firebase the collection is called Friend
  const usersRef = collection(getFirestore(), 'friend');

  onSnapshot(query(usersRef, orderBy("nickname", "asc")), (querySnapshot) => {
    users = new Map();

    querySnapshot.docs
    .map((friend) => User.of(friend.data()))
    .forEach(f => {
      users.set(f.uid, f);
    })
  });

  async function addUserDoc() {
    await addDoc(usersRef, {
      uid: user.uid,
      nickname: user.displayName.split(' ')[0]
    })
    .catch(e => {
      console.error(e);
      window.alert('Crap! Couldn\'t create a nickname.. Tell Kim!')
    });
  }

  $: {
    if (user && users && !users.get(user.uid)) {
      addUserDoc();
    }
  }

</script>
