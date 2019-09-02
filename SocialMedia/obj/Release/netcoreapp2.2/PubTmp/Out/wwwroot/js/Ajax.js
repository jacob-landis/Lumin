class Ajax {


    //LIKE
    static unlike(type, id, func) { Ajax.call(`apilike/unlike/${type}/${id}`, "POST", func); }

    static postLike(type, id, func) { Ajax.call(`apilike/like/${type}/${id}`, "POST", func); }

    static getLikes(type, id, func) { Ajax.call(`apilike/likes/${type}/${id}`, "GET", func); } // NOT IN USE


    //COMMENT
    static deleteComment(id) { Ajax.call(`apicomment/deletecomment/${id}`, "POST"); }

    static updateComment(id, data) { Ajax.call(`apicomment/updatecomment/${id}`, "POST", false, data); }

    static postComment(func, data) { Ajax.call("apicomment", "POST", func, data); }

    static getComments(id, commentCount, amount, func) { Ajax.call(`apicomment/postcomments/${id}/${commentCount}/${amount}`, "GET", func); }

    static getCommentCount(id, func) { Ajax.call(`apicomment/commentcount/${id}`, "GET", func); }

    //PROFILE
    static updateBio(data) { Ajax.call("apiprofile/updatebio", "POST", false, data); }

    static updateProfilePicture(id, func) { Ajax.call(`apiprofile/updateprofilepicture/${id}`, "POST", func); }

    static getProfile(id, func) { Ajax.call(`apiprofile/${id}`, "GET", func); }

    static getFullProfile(id, func) { Ajax.call(`apiprofile/fullprofile/${id}`, "POST", func); }

    static getCurrentProfile(func) { Ajax.call("apiprofile/currentprofile", "GET", func); }


    //FRIEND
    static deleteFriend(id, func) { Ajax.call(`apifriend/deletefriend/${id}`, "POST", func); } // remove

    static acceptFriendRequest(id, func) { Ajax.call(`apifriend/acceptrequest/${id}`, "POST", func); } // accept

    static sendFriendRequest(id, func) { Ajax.call(`apifriend/createrequest/${id}`, "POST", func); } // request
    
    static getFriends(id, data, func) { Ajax.call(`apifriend/friends/${id}`, "POST", func, data); }


    //IMAGE
    static deleteImage(id) { Ajax.call(`apiimage/deleteimage/${id}`, "POST"); }

    static postImage(data, func) { Ajax.call("apiimage", "POST", func, data); }

    static getProfileImages(id, imageCount, amount, func) { Ajax.call(`apiimage/profileimages/${id}/${imageCount}/${amount}`, "GET", func); }

    static getProfileImagesCount(id, func) { Ajax.call(`apiimage/profileimagescount/${id}`, "GET", func); }

    static getImage(id, thumb, func) { Ajax.call(`apiimage/${id}/${thumb ? 1:0}`, "GET", func); }


    //POST
    static deletePost(id) { Ajax.call(`apipost/deletepost/${id}`, "POST"); }

    static updatePost(id, data) { Ajax.call(`apipost/updatepost/${id}`, "POST", false, data); }

    static submitPost(data, func) { Ajax.call("apipost", "POST", func, data); }

    static getPublicPosts(postCount, amount, func) { Ajax.call(`apipost/publicposts/${postCount}/${amount}`, "GET", func); }

    static getProfilePosts(id, postCount, amount, func) { Ajax.call(`apipost/profileposts/${id}/${postCount}/${amount}`, "GET", func); }


    //CALL
    static call(path, method, func, data) {

        // check server for current user (redirect if session is expired)
        Ajax.finalCall("apiprofile/confirmuser", "GET", confirmed => {
            if (confirmed) Ajax.finalCall(path, method, func, data);
            else location.reload(true);
        });
    }

    static finalCall(path, method, func, data) {
        $.ajax({
            url: "/api/" + path,
            contentType: "application/json",
            method: method,
            data: data,
            success: returnData => { if (func) func(returnData); }
        });
    }
}