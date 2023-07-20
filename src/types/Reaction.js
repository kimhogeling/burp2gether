export class Reaction {
    constructor(key, smiley, description, hide = false) {
        this.key = key;
        this.smiley = smiley;
        this.description = description;
        this.hide = hide;
    }
}
