export class Burp {
  constructor(id, uid, date, filename, reactions) {
    this.id = id;
    this.uid = uid;
    this.date = date;
    this.filename = filename;
    // List of uids per reaction key (not Reaction)
    this.reactions = reactions;
  }

  static of(id, other) {
    return new Burp(id, other.uid, other.date, other.filename, other.reactions);
  }
}
