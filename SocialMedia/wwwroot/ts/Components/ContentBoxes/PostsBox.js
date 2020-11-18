var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/*
    This class is a sudo-extension of ContentBox.
    It manages the logic of a content box that specifically stores posts.
    
    Constructor establishes a request feed for lazy loading but does not initiate it.
    Start() must be called to initiate it.
*/
var PostsBox = /** @class */ (function (_super) {
    __extends(PostsBox, _super);
    /*
        PARAMETERS:
        profileId can be null.
        existingTag must be an HTML element.
    */
    function PostsBox(profileId, rootElm) {
        // Prep callback for ContentBox construction.
        //let contentBoxRequestFunc =
        //    // When content box is ready for more content,
        //    (skip: number, take: number) =>
        //        // if a ProfileID was included,
        //        profileId ?
        //            // send a profilePosts request to the server with the set skip and take values along with the ProfileID of this post box,
        //            Repo.profilePosts(this.profileId, skip, take,
        //                // and when the posts return as post cards,
        //                (posts) =>
        //                    // add them to the content box of this post box.
        //                    this.add(posts))
        //            :
        //            // or else send a publicPosts request to the server with the set skip and take values of this post box,
        //            Repo.publicPosts(skip, take,
        //                // and when the posts return as post cards,
        //                (posts) =>
        //                    // add them to the content box of this post box.
        //                    this.add(posts));
        var _this = this;
        // Add class attribute to rootElm before sending to base class.
        rootElm.classList.add('post-box');
        // Call base class constructor.
        _this = _super.call(this, rootElm, 5, 
        // When content box is ready for more content,
        function (skip, take) {
            // if a ProfileID was included,
            if (profileId)
                // send a profilePosts request to the server with the set skip and take values along with the ProfileID of this post box,
                Repo.profilePosts(_this.profileId, skip, take, 
                // and when the posts return as post cards,
                function (posts) {
                    // add them to the content box of this post box.
                    return _this.add(posts);
                });
            else
                // or else send a publicPosts request to the server with the set skip and take values of this post box,
                Repo.publicPosts(skip, take, 
                // and when the posts return as post cards,
                function (posts) {
                    // add them to the content box of this post box.
                    return _this.add(posts);
                });
        }) || this;
        // XXX if no ProfileID can be used and just default public posts can be requested, why is it made mandatory that this be a valid ProfileID?
        // is this for when postBoxes are scanned to add or remove a post card?
        _this.profileId = profileId ? profileId : User.id;
        return _this;
    }
    /*
        Shortcut for adding posts to this post box's content box.
    */
    PostsBox.prototype.addPost = function (postCard) { this.add(postCard, true); };
    /*
        Send first request to host.
    */
    PostsBox.prototype.start = function () { this.request(15); };
    // A global collection of PostBox instances.
    PostsBox.postBoxes = [];
    return PostsBox;
}(ContentBox));
//# sourceMappingURL=PostsBox.js.map