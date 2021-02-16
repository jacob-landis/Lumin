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
var PostCard = (function (_super) {
    __extends(PostCard, _super);
    function PostCard(post) {
        var _this = _super.call(this, ViewUtil.tag('div', { classList: 'postCard' })) || this;
        _this.post = post;
        if (_this.post.image)
            _this.hasImage = true;
        var postSection = ViewUtil.tag('div', { classList: 'postSection' });
        var commentSection = ViewUtil.tag('div', { classList: 'commentSection' });
        _this.rootElm.append(postSection, commentSection);
        _this.commentInputWrapper = ViewUtil.tag('div', { classList: 'commentInputWrapper' });
        _this.errorSlot = ViewUtil.tag('div', { classList: 'errorSlot' });
        _this.commentCountSlot = ViewUtil.tag('div', { classList: 'commentCountSlot' });
        _this.commentsBox = new ContentBox(ViewUtil.tag('div', { classList: 'commentBox' }), null, 400, 30, function (skip, take) {
            return Ajax.getComments(_this.post.postId, skip, take, function (comments) {
                var isFirstCommentsBatch = _this.commentsBox.content.length == 0;
                if (_this.post.profile.profileId == User.profileId)
                    comments.forEach(function (comment) { return comment.disputeHasSeen(); });
                _this.commentsBox.add(comments);
                if (isFirstCommentsBatch && !_this.hasImage)
                    _this.resizeCommentBox();
            });
        });
        var txtComment = ViewUtil.tag('textarea', { classList: 'txtComment' });
        var btnComment = ViewUtil.tag('button', { classList: 'btnComment', innerHTML: 'Comment' });
        commentSection.append(_this.commentInputWrapper, _this.errorSlot, _this.commentCountSlot, _this.commentsBox.rootElm);
        _this.commentInputWrapper.append(txtComment, btnComment);
        _this.postImageWrapper = new ImageBox(ViewUtil.tag('div', { classList: 'postImageWrapper' }), 'postImage', function (target) { return fullSizeImageModal.loadSingle(target.image.imageId); });
        if (_this.hasImage) {
            _this.postImageWrapper.load(_this.post.image.imageId);
            _this.captionWrapper = ViewUtil.tag('div', { classList: 'captionWrapper' });
        }
        else
            _this.captionWrapper = ViewUtil.tag('div', { classList: 'captionWrapper noImageCaptionWrapper' });
        _this.postHeading = ViewUtil.tag('div', { classList: 'postHeading' });
        postSection.append(_this.postHeading, _this.captionWrapper, _this.postImageWrapper.rootElm);
        _this.editIcon = Icons.edit();
        _this.captionEditor = new Editor(_this.editIcon, _this.post.caption, 'post-caption-editor', 1000, function (caption) {
            Ajax.updatePost(_this.post.postId, caption);
            PostCard.postCards.forEach(function (p) {
                if (p.post.postId == _this.post.postId)
                    p.captionEditor.setText(caption);
            });
        });
        _this.captionWrapper.append(_this.captionEditor.rootElm);
        var profileCardSlot = ViewUtil.tag('div', { classList: 'profileCardSlot' });
        var likeCardSlot = ViewUtil.tag('div', { classList: 'detailsSlot' });
        var postOptsSlot = ViewUtil.tag('div', { classList: 'postOptsSlot' });
        _this.postHeading.append(profileCardSlot, likeCardSlot, postOptsSlot);
        profileCardSlot.append(new ProfileCard(_this.post.profile).rootElm);
        likeCardSlot.append(new LikeCard(LikesRecord.copy(_this.post.likes), _this.post.dateTime).rootElm);
        _this.commentsBox.request(15);
        _this.requestCommentCount();
        if (post.profile.relationToUser == 'me') {
            var btnPostOpts = ViewUtil.tag('i', { classList: 'btnPostOpts threeDots fa fa-ellipsis-v' });
            postOptsSlot.append(btnPostOpts);
            btnPostOpts.onclick = function (e) { return contextMenu.load(e, [
                new ContextOption(_this.editIcon, function (e) { return _this.captionEditor.start(); }),
                new ContextOption(Icons.deletePost(), function (e) {
                    return confirmPrompt.load('Are you sure you want to delete this post?', function (confirmation) {
                        if (!confirmation)
                            return;
                        _this.remove();
                    });
                })
            ]); };
        }
        btnComment.onclick = function (e) {
            var error = ViewUtil.tag('div', { classList: 'errorMsg', innerText: '- Must be less than 125 characters' });
            if (txtComment.value.length <= 125) {
                Ajax.postComment(JSON.stringify({ Content: txtComment.value, PostId: post.postId }), function (commentResults) {
                    PostCard.postCards.forEach(function (p) {
                        if (p.post.postId == commentResults.postId) {
                            p.commentsBox.add(new CommentCard(CommentRecord.copy(commentResults)), true);
                            p.resizeCommentBox();
                            p.setCommentCount(_this.totalCommentCount + 1);
                        }
                    });
                });
                ViewUtil.empty(_this.errorSlot);
                txtComment.value = "";
            }
            else
                _this.errorSlot.append(error);
        };
        if (_this.hasImage) {
            _this.observer = new MutationObserver(function () { return _this.resizeCommentBox(); });
            _this.observer.observe(_this.rootElm, { attributes: true });
            _this.postImageWrapper.onLoadEnd = function () { return _this.mutate(); };
        }
        window.addEventListener('scroll', function (e) {
            var offset = _this.rootElm.offsetTop - window.pageYOffset;
            if ((offset > -3000 && offset < -2500) || (offset < 3000 && offset > 2500)) {
                if (_this.hasImage)
                    _this.postImageWrapper.unload();
            }
            else if (offset > -2000 && offset < 2000) {
                if (_this.hasImage)
                    _this.postImageWrapper.reload();
            }
        });
        PostCard.postCards.push(_this);
        return _this;
    }
    PostCard.list = function (posts) {
        var postCards = [];
        if (posts) {
            posts.forEach(function (p) { return postCards.push(new PostCard(p)); });
            return postCards;
        }
    };
    PostCard.prototype.resizeCommentBox = function () {
        var inputHeight = this.commentInputWrapper.clientHeight;
        var contentHeight = this.postImageWrapper.height + this.postHeading.clientHeight + this.captionWrapper.clientHeight;
        var targetHeight = contentHeight - inputHeight;
        this.commentsBox.height = targetHeight;
        if (this.observer != undefined)
            this.observer.disconnect();
    };
    PostCard.prototype.setCommentCount = function (newCount) {
        this.totalCommentCount = newCount;
        switch (newCount) {
            case 0:
                this.commentCountText.innerText = 'No Comments';
                break;
            case 1:
                this.commentCountText.innerText = '1 Comment';
                break;
            default: this.commentCountText.innerText = newCount + " Comments";
        }
    };
    PostCard.prototype.requestCommentCount = function () {
        var _this = this;
        Ajax.getCommentCount(this.post.postId, function (commentCount) {
            _this.commentCountText = ViewUtil.tag('div');
            _this.setCommentCount(+commentCount);
            _this.commentCountSlot.append(_this.commentCountText);
        });
    };
    PostCard.prototype.alertVisible = function () {
        this.commentsBox.getVisibleContent().forEach(function (commentCard) { return commentCard.alertVisible(); });
    };
    PostCard.prototype.remove = function () {
        var _this = this;
        this.setCommentCount(this.totalCommentCount - 1);
        Ajax.deletePost(this.post.postId);
        PostCard.postCards.forEach(function (postCard) {
            if (postCard.post.postId == _this.post.postId) {
                ViewUtil.remove(postCard.rootElm);
                postCard = null;
            }
        });
        Util.filterNulls(PostCard.postCards);
    };
    PostCard.prototype.mutate = function () { this.rootElm.id = 'loadedPost'; };
    PostCard.postCards = [];
    return PostCard;
}(Card));
//# sourceMappingURL=PostCard.js.map