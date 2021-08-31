class User {
    private static _id: number;
    private static _profilePictureId: number;
    public static profilePicturePrivacyLevel: number;
    public static bioPrivacyLevel: number;
    public static imagesPrivacyLevel: number;
    public static friendsPrivacyLevel: number;
    public static postsPrivacyLevel: number;

    public static set profileId(profileId: number) { User._id = profileId; }
    public static get profileId(): number { return User._id; }

    public static set profilePictureId(profileId: number) { User._profilePictureId = profileId; }
    public static get profilePictureId(): number { return User._profilePictureId; }
}