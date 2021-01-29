class User {
    private static _id: number;
    private static _profilePictureId: number;

    static set profileId(profileId: number) { User._id = profileId; }
    static get profileId(): number { return User._id; }

    static set profilePictureId(profileId: number) { User._profilePictureId = profileId; }
    static get profilePictureId(): number { return User._profilePictureId; }
}