var User = (function () {
    function User() {
    }
    Object.defineProperty(User, "profileId", {
        get: function () { return User._id; },
        set: function (profileId) { User._id = profileId; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User, "profilePictureId", {
        get: function () { return User._profilePictureId; },
        set: function (profileId) { User._profilePictureId = profileId; },
        enumerable: true,
        configurable: true
    });
    return User;
}());
//# sourceMappingURL=User.js.map