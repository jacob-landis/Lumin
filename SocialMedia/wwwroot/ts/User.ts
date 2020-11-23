class User {
    private static _id: number;
    private static _profilePictureId: number;

    static set profileId(profileId) { User._id = profileId; }
    static get profileId() { return User._id; }

    static set profilePictureId(profileId) { User._profilePictureId = profileId; }
    static get profilePictureId() { return User._profilePictureId; }
}