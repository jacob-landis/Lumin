var Ajax = (function () {
    function Ajax() {
    }
    Ajax.JSONstring = function (string) { return JSON.stringify({ str: string }); };
    Ajax.unlike = function (contentType, contentId) {
        this.call("apilike/unlike/" + contentType.toString + "/" + contentId, "POST");
    };
    Ajax.postLike = function (contentType, contentId) {
        this.call("apilike/like/" + contentType.toString + "/" + contentId, "POST");
    };
    Ajax.getLikes = function (contentType, contentId) {
        this.call("apilike/likes/" + contentType.toString + "/" + contentId, "GET");
    };
    Ajax.deleteComment = function (commentId) {
        this.call("apicomment/deletecomment/" + commentId, "POST");
    };
    Ajax.updateComment = function (commentId, commentText) {
        this.call("apicomment/updatecomment/" + commentId, "POST", null, commentText);
    };
    Ajax.postComment = function (commentForm, onCopyResults) {
        this.call("apicomment", "POST", function (results) { return onCopyResults(new CommentCard(JSON.parse(results))); }, commentForm);
    };
    Ajax.getComments = function (postId, skip, take, onCommentResults) {
        this.call("apicomment/postcomments/" + postId + "/" + skip + "/" + take, "GET", function (commentResults) { return onCommentResults(CommentCard.list(JSON.parse(commentResults))); });
    };
    Ajax.getCommentCount = function (postId, onCommentCountResults) {
        this.call("apicomment/commentcount/" + postId, "GET", onCommentCountResults);
    };
    Ajax.updateBio = function (bioText) {
        this.call("apiprofile/updatebio", "POST", null, this.JSONstring(bioText));
    };
    Ajax.updateProfilePicture = function (imageId, imageClassList, onImageClick, onCopyResults) {
        this.call("apiprofile/updateprofilepicture/" + imageId, "POST", function (imageResults) { return onCopyResults(new ImageCard(JSON.parse(imageResults), imageClassList, onImageClick)); });
    };
    Ajax.getProfile = function (profileId, onProfileResults) {
        this.call("apiprofile/" + profileId, "GET", function (profileResults) { return onProfileResults(new ProfileCard(JSON.parse(profileResults))); });
    };
    Ajax.getFullProfile = function (profileId, onFullProfileResults) {
        this.call("apiprofile/fullprofile/" + profileId, "POST", function (fullProfileResults) {
            onFullProfileResults(JSON.parse(fullProfileResults));
        });
    };
    Ajax.getCurrentProfile = function (onCurrentProfileResults) {
        this.call("apiprofile/currentprofile", "GET", onCurrentProfileResults);
    };
    Ajax.deleteFriend = function (profileId) {
        this.call("apifriend/deletefriend/" + profileId, "POST");
    };
    Ajax.acceptFriendRequest = function (profileId) {
        this.call("apifriend/acceptrequest/" + profileId, "POST");
    };
    Ajax.sendFriendRequest = function (profileId) {
        this.call("apifriend/createrequest/" + profileId, "POST");
    };
    Ajax.getFriends = function (profileId, searchText, onProfileResults) {
        var newId = profileId ? profileId : 0;
        var newSearch = this.JSONstring(searchText ? searchText : "NULL");
        this.call("apifriend/friends/" + newId, "POST", function (profileResults) { return onProfileResults(ProfileCard.list(JSON.parse(profileResults))); }, newSearch);
    };
    Ajax.deleteImage = function (imageId) {
        this.call("apiimage/deleteimage/" + imageId, "POST");
    };
    Ajax.postImage = function (imageAsString, onCopyResults) {
        this.call("apiimage", "POST", function (imageCopy) { return onCopyResults(new ImageCard(JSON.parse(imageCopy))); }, imageAsString);
    };
    Ajax.getProfileImages = function (profileId, skip, take, imageClassList, onImageClick, onImageResults) {
        this.call("apiimage/profileimages/" + profileId + "/" + skip + "/" + take, "GET", function (imageResults) { return onImageResults(ImageCard.list(JSON.parse(imageResults), imageClassList, onImageClick)); });
    };
    Ajax.getProfileImagesCount = function (profileId, onCountResults) {
        this.call("apiimage/profileimagescount/" + profileId, "GET", onCountResults);
    };
    Ajax.getImage = function (imageId, thumb, imageClassList, onImageClick, onImageResults) {
        this.call("apiimage/" + imageId + "/" + (thumb ? 1 : 0), "GET", function (imageResults) { return onImageResults(new ImageCard(JSON.parse(imageResults), imageClassList, onImageClick)); });
    };
    Ajax.deletePost = function (postId) {
        this.call("apipost/deletepost/" + postId, "POST");
    };
    Ajax.updatePost = function (postId, postCaptionText) {
        this.call("apipost/updatepost/" + postId, "POST", null, this.JSONstring(postCaptionText));
    };
    Ajax.submitPost = function (postForm, onCopyResults) {
        this.call("apipost", "POST", function (copyResults) { return onCopyResults(new PostCard(JSON.parse(copyResults))); }, postForm);
    };
    Ajax.getPublicPosts = function (skip, take, onPostResults) {
        this.call("apipost/publicposts/" + skip + "/" + take, "GET", function (postResults) { return onPostResults(PostCard.list(JSON.parse(postResults))); });
    };
    Ajax.getProfilePosts = function (profileId, skip, take, onPostResults) {
        this.call("apipost/profileposts/" + profileId + "/" + skip + "/" + take, "GET", function (postResults) { return onPostResults(PostCard.list(JSON.parse(postResults))); });
    };
    Ajax.call = function (path, method, onResults, data) {
        var _this = this;
        this.finalCall("apiprofile/confirmuser", "GET", function (confirmed) {
            if (confirmed)
                _this.finalCall(path, method, onResults, data);
            else
                location.reload(true);
        });
    };
    Ajax.finalCall = function (path, method, onResults, data) {
        $.ajax({
            url: "/api/" + path,
            contentType: "application/json",
            method: method,
            data: data,
            success: function (results) { if (onResults)
                onResults(results); }
        });
    };
    return Ajax;
}());
//# sourceMappingURL=Ajax.js.map