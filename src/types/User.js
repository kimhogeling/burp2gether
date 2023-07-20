export class User {
    constructor(uid, nickname, favourites) {
        this.uid = uid;
        this.nickname = nickname;
        // List of user ids that this user follows
        this.favourites = favourites || [];
    }

    static of(user) {
        return new User(user.uid, user.nickname, user.favourites);
    }
}
