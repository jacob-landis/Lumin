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
var CommentSectionCard = (function (_super) {
    __extends(CommentSectionCard, _super);
    function CommentSectionCard(post, getContentHeight) {
        var _this = _super.call(this, ViewUtil.tag('div', { classList: 'commentSection' })) || this;
        _this.feedFilter = 'recent';
        _this.allStaged = new StageFlag();
        _this.myCommentsStaged = new StageFlag();
        _this.likedCommentsStaged = new StageFlag();
        _this.mainCommentsStaged = new StageFlag();
        _this.isFirstCommentsBatch = true;
        _this.post = post;
        _this.getContentHeight = getContentHeight;
        _this.commentInputWrapper = ViewUtil.tag('div', { classList: 'commentInputWrapper' });
        _this.errorSlot = ViewUtil.tag('div', { classList: 'errorSlot' });
        _this.commentBoxDetails = ViewUtil.tag('div', { classList: 'commentBoxDetails' });
        _this.commentCountSlot = ViewUtil.tag('div', { classList: 'commentCountSlot' });
        _this.commentBoxFeedControls = ViewUtil.tag('div', { classList: 'commentBoxFeedControls' });
        _this.btnToggleFeedFilter = Icons.filterByLikes();
        _this.btnToggleFeedFilter.classList.add('btnToggleCommentFeedFilter');
        _this.btnToggleFeedFilter.title = 'Sort by popularity';
        _this.btnRefreshFeed = Icons.refresh();
        _this.btnRefreshFeed.classList.add('btnRefreshCommentFeed');
        _this.btnRefreshFeed.title = 'Refresh comment feed';
        _this.btnMyActivity = Icons.history();
        _this.btnMyActivity.classList.add('btnMyActivity');
        _this.btnMyActivity.title = 'Show my activity';
        _this.myCommentsBox = new CommentsBox(_this.post.postId, 'myComments', function () { return _this.feedFilter; }, function (noChanges) {
            _this.commentBoxesStage.updateStaging(_this.myCommentsStaged);
            if (noChanges)
                _this.myCommentsBox.messageElm.innerText = 'My Comments - No changes have been made';
            else
                _this.myCommentsBox.messageElm.innerText = 'My Comments';
        });
        _this.likedCommentsBox = new CommentsBox(_this.post.postId, 'likedComments', function () { return _this.feedFilter; }, function (noChanges) {
            _this.commentBoxesStage.updateStaging(_this.likedCommentsStaged);
            if (noChanges)
                _this.likedCommentsBox.messageElm.innerText = 'My Liked Comments - No changes have been made';
            else
                _this.likedCommentsBox.messageElm.innerText = 'My Liked Comments';
        });
        _this.mainCommentsBox = new CommentsBox(_this.post.postId, 'mainComments', function () { return _this.feedFilter; }, function () {
            if (_this.mainCommentsBox.length == 0) {
                _this.commentBoxesStage.updateStaging(_this.mainCommentsStaged);
                return;
            }
            if (_this.myCommentsBox.length > 0 || _this.likedCommentsBox.length > 0)
                _this.mainCommentsBox.messageElm.innerText = 'All Comments';
            if (_this.post.profile.profileId == User.profileId)
                _this.mainCommentsBox.content.forEach(function (comment) { return comment.disputeHasSeen(); });
            if (_this.isFirstCommentsBatch) {
                _this.isFirstCommentsBatch = false;
                if (_this.post.image == null)
                    _this.resizeCommentBox();
            }
            _this.commentBoxesStage.updateStaging(_this.mainCommentsStaged);
        });
        _this.commentBoxes = new ContentBox(ViewUtil.tag('div', { classList: 'commentBoxes' }));
        _this.commentBoxes.add([_this.myCommentsBox, _this.likedCommentsBox, _this.mainCommentsBox]);
        var txtComment = ViewUtil.tag('textarea', { classList: 'txtComment' });
        var btnConfirm = Icons.confirm();
        var btnCancel = Icons.cancel();
        var btnComment = ViewUtil.tag('button', { classList: 'btnComment', innerHTML: 'Create Comment' });
        _this.btnToggleViewExpansion = Icons.dropdownArrow();
        _this.btnToggleViewExpansion.classList.add('btnToggleViewExpansion');
        _this.btnToggleViewExpansion.title = 'Expand Comment Section';
        _this.rootElm.append(_this.commentInputWrapper, _this.errorSlot, _this.commentBoxDetails, _this.commentBoxes.rootElm, _this.btnToggleViewExpansion);
        _this.commentBoxDetails.append(_this.commentCountSlot, _this.commentBoxFeedControls);
        _this.commentBoxFeedControls.append(_this.btnMyActivity, _this.btnToggleFeedFilter, _this.btnRefreshFeed);
        _this.commentInputWrapper.append(txtComment, btnConfirm, btnCancel, btnComment);
        _this.mainCommentsBox.request(15);
        _this.requestCommentCount();
        _this.btnToggleFeedFilter.onclick = function (event) { return _this.toggleFeedFilter(); };
        _this.btnRefreshFeed.onclick = function (event) { return _this.refreshCommentFeed(); };
        _this.setBtnMyActivity(true);
        var deactivateInput = function () {
            txtComment.value = '';
            _this.commentInputWrapper.classList.remove('activeInput');
        };
        btnConfirm.onclick = function (e) {
            var tooLong = txtComment.value.length > 125;
            var tooShort = txtComment.value.length == 0;
            var tooLongError = ViewUtil.tag('div', { classList: 'errorMsg', innerText: '- Must be less than 125 characters' });
            var tooShortError = ViewUtil.tag('div', { classList: 'errorMsg', innerText: '- Comment cannot be empty' });
            if (!tooLong && !tooShort) {
                confirmPrompt.load("Are you sure you want to make this comment?", function (answer) {
                    if (answer == true) {
                        Ajax.postComment(JSON.stringify({ Content: txtComment.value, PostId: post.postId }), function (commentResults) {
                            PostCard.postCards.forEach(function (p) {
                                if (p.post.postId == commentResults.postId) {
                                    p.commentsSection.mainCommentsBox.add(new CommentCard(CommentRecord.copy(commentResults)), true);
                                    p.commentsSection.resizeCommentBox();
                                    p.commentsSection.setCommentCount(_this.totalCommentCount + 1);
                                }
                            });
                        });
                        ViewUtil.empty(_this.errorSlot);
                        deactivateInput();
                    }
                });
            }
            else if (tooLong)
                _this.errorSlot.append(tooLongError);
            else if (tooShort)
                _this.errorSlot.append(tooShortError);
        };
        btnCancel.onclick = function (event) {
            if (txtComment.value.length > 10) {
                confirmPrompt.load("Are you sure you want to discard this comment?", function (answer) {
                    if (answer == true)
                        deactivateInput();
                    else
                        txtComment.focus();
                });
            }
            else
                deactivateInput();
        };
        btnComment.onclick = function (event) {
            _this.commentInputWrapper.classList.add('activeInput');
            txtComment.focus();
        };
        _this.btnToggleViewExpansion.onclick = function (event) { return _this.expandCommentSection(); };
        _this.commentBoxesStage = new Stage([_this.mainCommentsStaged]);
        return _this;
    }
    CommentSectionCard.prototype.toggleFeedFilter = function () {
        var _this = this;
        this.commentBoxesStage = new Stage([this.mainCommentsStaged], function () { return _this.displayResults(); });
        ViewUtil.hide(this.commentBoxes.rootElm);
        var feedFilterSecondIcon = this.btnToggleFeedFilter.children[1];
        this.feedFilter = this.feedFilter == 'likes' ? 'recent' : 'likes';
        if (this.feedFilter == 'likes') {
            this.btnToggleFeedFilter.title = 'Sort by recent';
            feedFilterSecondIcon.classList.remove('fa-thumbs-up');
            feedFilterSecondIcon.classList.add('fa-calendar');
        }
        else if (this.feedFilter == 'recent') {
            this.btnToggleFeedFilter.title = 'Sort by popularity';
            feedFilterSecondIcon.classList.remove('fa-calendar');
            feedFilterSecondIcon.classList.add('fa-thumbs-up');
        }
        this.mainCommentsBox.clear();
        this.mainCommentsBox.request(15);
        this.mainCommentsBox.messageElm.innerText = '';
        if (this.myCommentsBox.length > 0) {
            this.commentBoxesStage.stageFlags.push(this.mainCommentsStaged);
            this.myCommentsBox.clear();
            this.myCommentsBox.request(15);
        }
        if (this.likedCommentsBox.length > 0) {
            this.commentBoxesStage.stageFlags.push(this.likedCommentsStaged);
            this.likedCommentsBox.clear();
            this.likedCommentsBox.request(15);
        }
    };
    CommentSectionCard.prototype.showCommentActivity = function () {
        var _this = this;
        this.commentBoxesStage = new Stage([this.myCommentsStaged, this.likedCommentsStaged], function () { return _this.displayResults(); });
        ViewUtil.hide(this.commentBoxes.rootElm);
        this.myCommentsBox.request(15);
        this.likedCommentsBox.request(15);
        this.setBtnMyActivity(false);
    };
    CommentSectionCard.prototype.hideCommentActivity = function () {
        this.myCommentsBox.clear();
        this.likedCommentsBox.clear();
        this.myCommentsBox.messageElm.innerText = '';
        this.likedCommentsBox.messageElm.innerText = '';
        this.setBtnMyActivity(true);
    };
    CommentSectionCard.prototype.refreshCommentFeed = function () {
        var _this = this;
        this.commentBoxesStage = new Stage([this.mainCommentsStaged], function () { return _this.displayResults(); });
        ViewUtil.hide(this.commentBoxes.rootElm);
        this.mainCommentsBox.refreshComments(function (noChanges) {
            var myActivityIsShowing = _this.myCommentsBox.length > 0 || _this.likedCommentsBox.length > 0;
            if (noChanges) {
                if (myActivityIsShowing)
                    _this.mainCommentsBox.messageElm.innerText = 'All Comments - No changes have been made';
                else
                    _this.mainCommentsBox.messageElm.innerText = 'No changes have been made';
            }
            else if (myActivityIsShowing)
                _this.mainCommentsBox.messageElm.innerText = 'All Comments';
            _this.commentBoxesStage.updateStaging(_this.mainCommentsStaged);
        });
        if (this.myCommentsBox.length > 0) {
            this.commentBoxesStage.stageFlags.push(this.myCommentsStaged);
            this.myCommentsBox.refreshComments();
        }
        if (this.likedCommentsBox.length > 0) {
            this.commentBoxesStage.stageFlags.push(this.likedCommentsStaged);
            this.likedCommentsBox.refreshComments();
        }
    };
    CommentSectionCard.prototype.setBtnMyActivity = function (makeBtnShowActivty) {
        var _this = this;
        makeBtnShowActivty ?
            this.btnMyActivity.classList.remove('showingMyCommentActivity')
            : this.btnMyActivity.classList.add('showingMyCommentActivity');
        this.mainCommentsBox.messageElm.innerText = makeBtnShowActivty ? '' : 'All Comments';
        this.btnMyActivity.title = makeBtnShowActivty ? 'Show my activity' : 'Hide my activity';
        this.btnMyActivity.onclick = function (event) { return makeBtnShowActivty ? _this.showCommentActivity() : _this.hideCommentActivity(); };
    };
    CommentSectionCard.prototype.setBtnToggleViewExpansion = function (makeBtnExpandView) {
        var _this = this;
        var icon = this.btnToggleViewExpansion.childNodes[0];
        if (makeBtnExpandView) {
            icon.classList.remove('fa-sort-up');
            icon.classList.add('fa-sort-down');
            this.btnToggleViewExpansion.title = 'Expand Comment Section';
            this.btnToggleViewExpansion.onclick = function (event) { return _this.expandCommentSection(); };
        }
        else {
            icon.classList.remove('fa-sort-down');
            icon.classList.add('fa-sort-up');
            this.btnToggleViewExpansion.title = 'Contract Comment Section';
            this.btnToggleViewExpansion.onclick = function (event) { return _this.contractCommentSection(); };
        }
    };
    CommentSectionCard.prototype.displayResults = function () {
        ViewUtil.show(this.commentBoxes.rootElm, 'block');
    };
    CommentSectionCard.prototype.expandCommentSection = function () {
        this.commentBoxes.height = 720;
        this.commentBoxes.rootElm.style.maxHeight = '720';
        this.rootElm.style.minHeight = "" + (720 + this.inputHeight);
        this.rootElm.style.maxHeight = "" + (720 + this.inputHeight);
        this.setBtnToggleViewExpansion(false);
    };
    CommentSectionCard.prototype.contractCommentSection = function () {
        this.commentBoxes.height = this.targetHeight;
        this.commentBoxes.rootElm.style.maxHeight = "" + this.targetHeight;
        this.rootElm.style.minHeight = "" + this.rootElmMinHeight;
        this.rootElm.style.maxHeight = "" + this.rootElmMinHeight;
        this.setBtnToggleViewExpansion(true);
    };
    CommentSectionCard.prototype.resizeCommentBox = function () {
        this.inputHeight = this.commentInputWrapper.clientHeight + this.commentBoxDetails.clientHeight + this.btnToggleViewExpansion.clientHeight;
        this.targetHeight = this.getContentHeight() - this.inputHeight;
        this.commentBoxes.height = this.targetHeight;
        this.commentBoxes.rootElm.style.maxHeight = "" + this.targetHeight;
        this.rootElm.style.minHeight = "" + this.rootElm.offsetHeight;
        this.rootElm.style.maxHeight = "" + this.rootElm.offsetHeight;
        this.rootElmMinHeight = this.rootElm.clientHeight;
    };
    CommentSectionCard.prototype.setCommentCount = function (newCount) {
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
    CommentSectionCard.prototype.requestCommentCount = function () {
        var _this = this;
        Ajax.getCommentCount(this.post.postId, function (commentCount) {
            _this.commentCountText = ViewUtil.tag('div');
            _this.setCommentCount(+commentCount);
            _this.commentCountSlot.append(_this.commentCountText);
        });
    };
    CommentSectionCard.prototype.alertVisible = function () {
        this.mainCommentsBox.getVisibleContent().forEach(function (commentCard) { return commentCard.alertVisible(); });
    };
    return CommentSectionCard;
}(Card));
//# sourceMappingURL=CommentSectionCard.js.map