class User {
    static set id(id) { User._id = id; }
    static get id() { return User._id; }

    static set profilePictureId(id) { User._profilePictureId = id; }
    static get profilePictureId() { return User._profilePictureId; }
}