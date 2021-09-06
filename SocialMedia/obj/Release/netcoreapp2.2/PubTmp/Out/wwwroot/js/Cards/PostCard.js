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
    function PostCard(post, revertDependency) {
        var _this = _super.call(this, ViewUtil.tag('div', { classList: 'postCard' })) || this;
        _this.revertDependency = revertDependency;
        _this.allStaged = new StageFlag();
        _this.imageStaged = new StageFlag();
        _this.post = post;
        if (_this.post.image)
            _this.hasImage = true;
        var postSection = ViewUtil.tag('div', { classList: 'postSection' });
        _this.commentsSection = new CommentSectionCard(_this.post, revertDependency, function () { return (_this.postImageWrapper.height + _this.postHeading.clientHeight + _this.captionWrapper.clientHeight); }, function () {
            _this.commentsSection.mainCommentsBox.content.forEach(function (content) {
                var commentCard = content;
                commentCard.imageBoxes.forEach(function (imageBox) { return _this.imageBoxes.push(imageBox); });
            });
        });
        _this.commentsSection.commentBoxesStage.onStagingEnd = function () { return _this.stage.updateStaging(_this.commentsSection.allStaged); };
        _this.stage = new Stage([_this.imageStaged, _this.commentsSection.allStaged]);
        _this.rootElm.append(postSection, _this.commentsSection.rootElm);
        _this.postImageWrapper = new ImageBox(ViewUtil.tag('div', { classList: 'postImageWrapper' }), 'postImage', 'Fullscreen', function (target) { return imageGalleryModal.loadSingle(target.imageCard.image.imageId); }, 2);
        if (_this.hasImage) {
            _this.imageBoxes.push(_this.postImageWrapper);
            _this.postImageWrapper.load(_this.post.image.imageId);
            _this.captionWrapper = ViewUtil.tag('div', { classList: 'captionWrapper' });
        }
        else {
            _this.stage.updateStaging(_this.imageStaged);
            _this.captionWrapper = ViewUtil.tag('div', { classList: 'captionWrapper noImageCaptionWrapper' });
        }
        _this.postHeading = ViewUtil.tag('div', { classList: 'postHeading' });
        postSection.append(_this.postHeading, _this.captionWrapper, _this.postImageWrapper.rootElm);
        _this.editIcon = Icons.edit();
        _this.captionEditor = new Editor(_this.editIcon, _this.post.caption, 'post-caption-editor', _this.hasImage, 1000, revertDependency, function (caption) {
            Ajax.updatePost(_this.post.postId, caption);
            PostCard.postCards.forEach(function (p) {
                if (p.post.postId == _this.post.postId)
                    p.captionEditor.setText(caption);
            });
        });
        _this.captionWrapper.append(_this.captionEditor.rootElm);
        _this.likeCard = new LikeCard(LikesRecord.copy(_this.post.likes), _this.post.dateTime);
        _this.refreshPostDetailsMessage = ViewUtil.tag('div', { classList: 'postDetailsRefreshMessage' });
        var profileCardSlot = ViewUtil.tag('div', { classList: 'profileCardSlot' });
        var likeCardSlot = ViewUtil.tag('div', { classList: 'detailsSlot' });
        var postOptsSlot = ViewUtil.tag('div', { classList: 'postOptsSlot' });
        var profileCard = new ProfileCard(_this.post.profile);
        profileCard.imageBoxes.forEach(function (imageBox) { return _this.imageBoxes.push(imageBox); });
        _this.postHeading.append(profileCardSlot, likeCardSlot, postOptsSlot);
        profileCardSlot.append(profileCard.rootElm);
        likeCardSlot.append(_this.likeCard.rootElm, _this.refreshPostDetailsMessage);
        if (post.profile.relationToUser == 'me') {
            var btnPostOpts = ViewUtil.tag('i', { classList: 'btnPostOpts threeDots fa fa-ellipsis-v' });
            postOptsSlot.append(btnPostOpts);
            btnPostOpts.onclick = function (e) { return contextMenu.load(e, [
                new ContextOption(_this.editIcon, 'Edit post caption', function (e) { return _this.captionEditor.start(); }),
                new ContextOption(Icons.privacy(), 'Change privacy', function (e) {
                    setTimeout(function () {
                        contextMenu.load(e, [
                            new ContextOption(ViewUtil.tag('div', { innerText: 'All' }), null, function () { return Ajax.updatePostPrivacy(_this.post.postId, 0); }),
                            new ContextOption(ViewUtil.tag('div', { innerText: 'Mutual' }), null, function () { return Ajax.updatePostPrivacy(_this.post.postId, 1); }),
                            new ContextOption(ViewUtil.tag('div', { innerText: 'Friends' }), null, function () { return Ajax.updatePostPrivacy(_this.post.postId, 2); }),
                            new ContextOption(ViewUtil.tag('div', { innerText: 'None' }), null, function () { return Ajax.updatePostPrivacy(_this.post.postId, 3); })
                        ]);
                    }, 10);
                }),
                new ContextOption(Icons.deletePost(), 'Delete post', function (e) {
                    return confirmPrompt.load('Are you sure you want to delete this post?', function (confirmation) {
                        if (!confirmation)
                            return;
                        _this.remove();
                    });
                }),
                new ContextOption(Icons.refresh(), 'Refresh post details', function (event) { return _this.refreshPostDetails(); })
            ]); };
        }
        else {
            var btnRefreshPostDetails = ViewUtil.tag('i', { classList: 'btnPostOpts threeDots fa fa-refresh', title: 'Refresh post details' });
            btnRefreshPostDetails.onclick = function (event) { return _this.refreshPostDetails(); };
            postOptsSlot.append(btnRefreshPostDetails);
        }
        if (_this.hasImage) {
            _this.commentsSection.resizeCommentBox();
            _this.postImageWrapper.onLoadEnd = function () {
                _this.stage.updateStaging(_this.imageStaged);
            };
        }
        PostCard.postCards.push(_this);
        return _this;
    }
    PostCard.list = function (posts, revertDependency) {
        if (revertDependency === void 0) { revertDependency = null; }
        var postCards = [];
        if (posts) {
            posts.forEach(function (p) { return postCards.push(new PostCard(p, revertDependency)); });
            return postCards;
        }
    };
    PostCard.prototype.refreshPostDetails = function () {
        var _this = this;
        Ajax.getPost(this.post.postId, this.revertDependency, function (postCard) {
            if (postCard == null) {
                _this.refreshPostDetailsMessage.innerText = 'This post could not be found.';
            }
            else if (postCard.post.caption == _this.post.caption &&
                postCard.post.likes.count == _this.post.likes.count) {
                _this.refreshPostDetailsMessage.innerText = 'These post details have not changed.';
            }
            else {
                _this.refreshPostDetailsMessage.innerText = '';
                _this.likeCard.setLikeCount(postCard.post.likes.count);
                _this.post.likes.count = postCard.post.likes.count;
                _this.captionEditor.setText(postCard.post.caption);
                _this.post.caption = postCard.post.caption;
            }
        });
    };
    PostCard.prototype.remove = function () {
        var _this = this;
        Ajax.deletePost(this.post.postId);
        PostCard.postCards.forEach(function (postCard) {
            if (postCard.post.postId == _this.post.postId) {
                ViewUtil.remove(postCard.rootElm);
                postCard = null;
            }
        });
        Util.filterNulls(PostCard.postCards);
    };
    PostCard.postCards = [];
    return PostCard;
}(Card));
//# sourceMappingURL=PostCard.js.map