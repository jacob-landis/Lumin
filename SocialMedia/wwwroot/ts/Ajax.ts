class Ajax {

    static JSONstring(string) { return JSON.stringify({ str: string }); }

    //LIKE
    static unlike(contentType: string, contentId: number) {
        this.call(`apilike/unlike/${contentType}/${contentId}`, "POST");
    }

    static postLike(contentType: string, contentId: number) {
        this.call(`apilike/like/${contentType}/${contentId}`, "POST");
    }

    static getLikes(contentType: string, contentId: number) {
        this.call(`apilike/likes/${contentType}/${contentId}`, "GET");
    } // NOT IN USE


    //COMMENT
    static deleteComment(commentId: number) {
        this.call(`apicomment/deletecomment/${commentId}`, "POST");
    }

    static updateComment(commentId: number, commentText: string) {
        this.call(`apicomment/updatecomment/${commentId}`, "POST", null, commentText);
    }

    static postComment(commentForm: string, onCopyResults: (commentCard: CommentCard) => void) {
        this.call(
            "apicomment", 
            "POST",
            results => onCopyResults(new CommentCard(results)),
            commentForm
        );
    }

    static getComments(postId: number, skip: number, take: number, onCommentResults: (commentCards: CommentCard[]) => void) {
        this.call(
            `apicomment/postcomments/${postId}/${skip}/${take}`,
            "GET",
            commentResults => onCommentResults(CommentCard.list(commentResults))
        );
    }

    static getCommentCount(postId: number, onCommentCountResults: (commentCount) => void) {
        this.call(`apicomment/commentcount/${postId}`, "GET", onCommentCountResults);
    }

    //PROFILE
    static updateBio(bioText: string) {
        this.call("apiprofile/updatebio", "POST", null, this.JSONstring(bioText));
    }

    static updateProfilePicture(
        imageId: number,
        imageClassList: string,
        onImageClick: (targetImageCard: ImageCard) => void,
        onCopyResults: (fullsizeImageCard: ImageCard) => void
    ) {
        this.call(
            `apiprofile/updateprofilepicture/${imageId}`,
            "POST",
            imageResults => onCopyResults(new ImageCard(imageResults, imageClassList, onImageClick))
        );
    }

    static getProfile(profileId: number, onProfileResults: (profileCard: ProfileCard) => void) {
        this.call(
            `apiprofile/${profileId}`,
            "GET",
            profileResults => onProfileResults(new ProfileCard(profileResults))
        );
    }

    static getFullProfile(profileId: number, onFullProfileResults: (fullProfile) => void) {
        this.call(
            `apiprofile/fullprofile/${profileId}`,
            "POST",
            fullProfileResults => {
                fullProfileResults.profilePicture = new ImageCard(fullProfileResults.profilePicture);
                onFullProfileResults(fullProfileResults);
            }
        );
    }

    static getCurrentProfile(onCurrentProfileResults: (currentProfile) => void) {
        this.call("apiprofile/currentprofile", "GET", onCurrentProfileResults);
    }


    //FRIEND
    static deleteFriend(profileId: number) {
        this.call(`apifriend/deletefriend/${profileId}`, "POST");
    } // remove

    static acceptFriendRequest(profileId: number) {
        this.call(`apifriend/acceptrequest/${profileId}`, "POST");
    } // accept

    static sendFriendRequest(profileId: number) {
        this.call(`apifriend/createrequest/${profileId}`, "POST");
    } // request
    
    static getFriends(profileId: number, searchText: string, onProfileResults: (profileCards: ProfileCard[]) => void) {

        let newId = profileId ? profileId : 0;
        let newSearch = this.JSONstring(searchText ? searchText : "NULL");
        
        this.call(
            `apifriend/friends/${newId}`,
            "POST", 
            profileResults => onProfileResults(ProfileCard.list(profileResults)),
            newSearch
        );
    }


    //IMAGE
    static deleteImage(imageId: number) {
        this.call(`apiimage/deleteimage/${imageId}`, "POST");
    }

    static postImage(imageAsString: string, onCopyResults: (returnImageCard: ImageCard) => void) {
        this.call(
            "apiimage", 
            "POST", 
            imageCopy => onCopyResults(new ImageCard(imageCopy)),
            imageAsString
        );
    }

    static getProfileImages(
        profileId: number,
        skip: number,
        take: number,
        imageClassList: string,
        onImageClick: (targetImageCard: ImageCard) => void,
        onImageResults: (imageCards: ImageCard[]) => void
    ) {
        this.call(
            `apiimage/profileimages/${profileId}/${skip}/${take}`, 
            "GET",
            imageResults => onImageResults(ImageCard.list(imageResults, imageClassList, onImageClick))
        );
    }

    static getProfileImagesCount(profileId: number, onCountResults: (imageCount) => void) {
        this.call(`apiimage/profileimagescount/${profileId}`, "GET", onCountResults);
    }

    static getImage(
        profileId: number,
        thumb: boolean,
        imageClassList: string,
        onImageClick: (targetImageCard: ImageCard) => void,
        onImageResults: (imageCard: ImageCard) => void
    ) {
        this.call(
            `apiimage/${profileId}/${thumb ? 1 : 0}`, 
            "GET",
            imageResults => onImageResults(new ImageCard(imageResults, imageClassList, onImageClick))
        );
    }


    //POST
    static deletePost(postId: number) {
        this.call(`apipost/deletepost/${postId}`, "POST");
    }

    static updatePost(postId: number, postCaptionText: string) {
        this.call(`apipost/updatepost/${postId}`, "POST", null, this.JSONstring(postCaptionText));
    }

    static submitPost(postForm: string, onCopyResults: (postCard: PostCard) => void) {
        this.call(
            "apipost",
            "POST",
            copyResults => onCopyResults(new PostCard(copyResults)),
            postForm
        );
    }

    static getPublicPosts(skip: number, take: number, onPostResults: (postCards: PostCard[]) => void) {
        this.call(
            `apipost/publicposts/${skip}/${take}`,
            "GET",
            postResults => onPostResults(PostCard.list(postResults))
        );
    }

    static getProfilePosts(profileId: number, skip: number, take: number, onPostResults: (postCards: PostCard[]) => void) {
        this.call(
            `apipost/profileposts/${profileId}/${skip}/${take}`, 
            "GET",
            postResults => onPostResults(PostCard.list(postResults))
        );
    }


    //CALL
    private static call(path: string, method: string, onResults?: (results: string) => void, data?: string) {

        // check server for current user (redirect if session is expired)
        this.finalCall("apiprofile/confirmuser", "GET", confirmed => {
            if (confirmed) this.finalCall(path, method, onResults, data);
            else location.reload(true);
        });
    }

    private static finalCall(path: string, method: string, onResults?: (results: string) => void, data?: string) {
        $.ajax({
            url: "/api/" + path,
            contentType: "application/json",
            method: method,
            data: data,
            success: results => { if (onResults) onResults(results); }
        });
    }
}