class User {
    private static _id: number;
    private static _profilePictureId: number;
    public static profilePicturePrivacyLevel: number;
    public static bioPrivacyLevel: number;
    public static imagesPrivacyLevel: number;
    public static friendsPrivacyLevel: number;
    public static postsPrivacyLevel: number;

    static set profileId(profileId: number) { User._id = profileId; }
    static get profileId(): number { return User._id; }

    static set profilePictureId(profileId: number) { User._profilePictureId = profileId; }
    static get profilePictureId(): number { return User._profilePictureId; }
}