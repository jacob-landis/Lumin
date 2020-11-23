var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var PostsBox = (function (_super) {
    __extends(PostsBox, _super);
    function PostsBox(profileId, rootElm) {
        var _this = this;
        rootElm.classList.add('post-box');
        _this = _super.call(this, rootElm, 5, function (skip, take) {
            if (profileId)
                Ajax.getProfilePosts(_this.profileId, skip, take, function (postCards) {
                    return _this.add(postCards);
                });
            else
                Ajax.getPublicPosts(skip, take, function (postCards) {
                    return _this.add(postCards);
                });
        }) || this;
        _this.profileId = profileId ? profileId : User.profileId;
        return _this;
    }
    PostsBox.prototype.addPost = function (postCard) { this.add(postCard, true); };
    PostsBox.prototype.start = function () { this.request(15); };
    PostsBox.postBoxes = [];
    return PostsBox;
}(ContentBox));
//# sourceMappingURL=PostsBox.js.map