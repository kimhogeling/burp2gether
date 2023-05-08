export class Friend {
  constructor(uid, nickname) {
    this.uid = uid;
    this.nickname = nickname;
  }

  static of(friend) {
    return new Friend(friend.uid, friend.nickname);
  }
}
