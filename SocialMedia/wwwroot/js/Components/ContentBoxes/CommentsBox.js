var CommentsBox = (function () {
    function CommentsBox(post, getContentHeight) {
        var _this = this;
        this.feedFilter = 'recent';
        this.allStaged = new StageFlag();
        this.myCommentsStaged = new StageFlag();
        this.likedCommentsStaged = new StageFlag();
        this.mainCommentsStaged = new StageFlag();
        this.post = post;
        this.getContentHeight = getContentHeight;
        this.rootElm = ViewUtil.tag('div', { classList: 'commentSection' });
        this.commentInputWrapper = ViewUtil.tag('div', { classList: 'commentInputWrapper' });
        this.errorSlot = ViewUtil.tag('div', { classList: 'errorSlot' });
        this.commentBoxDetails = ViewUtil.tag('div', { classList: 'commentBoxDetails' });
        this.commentCountSlot = ViewUtil.tag('div', { classList: 'commentCountSlot' });
        this.commentBoxFeedControls = ViewUtil.tag('div', { classList: 'commentBoxFeedControls' });
        this.btnToggleFeedFilter = Icons.filterByLikes();
        this.btnToggleFeedFilter.classList.add('btnToggleCommentFeedFilter');
        this.btnToggleFeedFilter.title = 'Sort by popularity';
        this.btnRefreshFeed = Icons.refresh();
        this.btnRefreshFeed.classList.add('btnRefreshCommentFeed');
        this.btnRefreshFeed.title = 'Refresh comment feed';
        this.btnMyActivity = Icons.history();
        this.btnMyActivity.classList.add('btnMyActivity');
        this.btnMyActivity.title = 'Show my activity';
        this.myCommentsBox = new ContentBox(ViewUtil.tag('div', { classList: 'myCommentsBox' }), null, 400, 30, function (skip, take) {
            Ajax.getComments(_this.post.postId, skip, take, _this.feedFilter, 'myComments', function (commentCards) {
                if (commentCards != null) {
                    _this.myCommentsBox.add(commentCards);
                    _this.myCommentsBox.messageElm.innerText = 'My Comments';
                }
                else {
                    _this.myCommentsBox.messageElm.innerText = '';
                }
                _this.commentBoxesStage.updateStaging(_this.myCommentsStaged);
            });
        });
        this.likedCommentsBox = new ContentBox(ViewUtil.tag('div', { classList: 'likedCommentsBox' }), null, 400, 30, function (skip, take) {
            Ajax.getComments(_this.post.postId, skip, take, _this.feedFilter, 'likedComments', function (commentCards) {
                if (commentCards != null) {
                    _this.likedCommentsBox.add(commentCards);
                    _this.likedCommentsBox.messageElm.innerText = 'My Liked Comments';
                }
                else {
                    _this.likedCommentsBox.messageElm.innerText = '';
                }
                _this.commentBoxesStage.updateStaging(_this.likedCommentsStaged);
            });
        });
        this.mainCommentsBox = new ContentBox(ViewUtil.tag('div', { classList: 'commentBox' }), null, 400, 30, function (skip, take) {
            return Ajax.getComments(_this.post.postId, skip, take, _this.feedFilter, 'mainComments', function (comments) {
                if (comments == null) {
                    _this.commentBoxesStage.updateStaging(_this.mainCommentsStaged);
                    return;
                }
                var isFirstCommentsBatch = _this.mainCommentsBox.content.length == 0;
                if (_this.post.profile.profileId == User.profileId)
                    comments.forEach(function (comment) { return comment.disputeHasSeen(); });
                _this.mainCommentsBox.add(comments);
                if (_this.myCommentsBox.length > 0 || _this.likedCommentsBox.length > 0)
                    _this.mainCommentsBox.messageElm.innerText = 'All Comments';
                if (isFirstCommentsBatch) {
                    if (_this.post.image == null)
                        _this.resizeCommentBox();
                    _this.commentBoxesStage.updateStaging(_this.mainCommentsStaged);
                }
            });
        });
        this.commentBoxes = new ContentBox(ViewUtil.tag('div', { classList: 'commentBoxes' }));
        this.commentBoxes.add([this.myCommentsBox, this.likedCommentsBox, this.mainCommentsBox]);
        var txtComment = ViewUtil.tag('textarea', { classList: 'txtComment' });
        var btnConfirm = Icons.confirm();
        var btnCancel = Icons.cancel();
        var btnComment = ViewUtil.tag('button', { classList: 'btnComment', innerHTML: 'Create Comment' });
        this.rootElm.append(this.commentInputWrapper, this.errorSlot, this.commentBoxDetails, this.commentBoxes.rootElm);
        this.commentBoxDetails.append(this.commentCountSlot, this.commentBoxFeedControls);
        this.commentBoxFeedControls.append(this.btnMyActivity, this.btnToggleFeedFilter, this.btnRefreshFeed);
        this.commentInputWrapper.append(txtComment, btnConfirm, btnCancel, btnComment);
        this.mainCommentsBox.request(15);
        this.requestCommentCount();
        this.btnToggleFeedFilter.onclick = function (event) { return _this.toggleFeedFilter(); };
        this.btnRefreshFeed.onclick = function (event) { return _this.refreshCommentFeed(); };
        this.setBtnMyActivity(true);
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
                                    p.commentsBox.mainCommentsBox.add(new CommentCard(CommentRecord.copy(commentResults)), true);
                                    p.commentsBox.resizeCommentBox();
                                    p.commentsBox.setCommentCount(_this.totalCommentCount + 1);
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
        this.commentBoxesStage = new Stage([this.mainCommentsStaged]);
    }
    CommentsBox.prototype.toggleFeedFilter = function () {
        this.commentBoxesStage = new Stage([this.mainCommentsStaged], this.displayResults);
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
    CommentsBox.prototype.showCommentActivity = function () {
        this.commentBoxesStage = new Stage([this.mainCommentsStaged, this.myCommentsStaged, this.likedCommentsStaged], this.displayResults);
        this.myCommentsBox.request(15);
        this.likedCommentsBox.request(15);
        this.setBtnMyActivity(false);
    };
    CommentsBox.prototype.hideCommentActivity = function () {
        this.commentBoxesStage = new Stage([this.mainCommentsStaged], this.displayResults);
        this.myCommentsBox.clear();
        this.likedCommentsBox.clear();
        this.myCommentsBox.messageElm.innerText = '';
        this.likedCommentsBox.messageElm.innerText = '';
        this.setBtnMyActivity(true);
    };
    CommentsBox.prototype.refreshCommentFeed = function () {
        var _this = this;
        this.commentBoxesStage = new Stage([this.mainCommentsStaged], this.displayResults);
        var commentIds = [];
        var likeCounts = [];
        var contents = [];
        this.mainCommentsBox.content.forEach(function (content) {
            commentIds.push(content.comment.commentId);
            likeCounts.push(content.comment.likes.count);
            contents.push(content.comment.content);
        });
        Ajax.refreshComments(this.post.postId, commentIds, likeCounts, contents, this.mainCommentsBox.take, this.feedFilter, 'mainComments', function (commentCards) {
            if (commentCards == null) {
                if (_this.myCommentsBox.length > 0 || _this.likedCommentsBox.length > 0)
                    _this.mainCommentsBox.messageElm.innerText = 'All Comments - No changes have been made';
                else
                    _this.mainCommentsBox.messageElm.innerText = 'No changes have been made';
            }
            else if (commentCards != null) {
                if (_this.myCommentsBox.length > 0 || _this.likedCommentsBox.length > 0)
                    _this.mainCommentsBox.messageElm.innerText = 'All Comments';
                _this.mainCommentsBox.clear();
                _this.mainCommentsBox.add(commentCards);
            }
        });
        if (this.myCommentsBox.length > 0) {
            this.commentBoxesStage.stageFlags.push(this.myCommentsStaged);
            var myCommentIds_1 = [];
            var myLikeCounts_1 = [];
            var myContents_1 = [];
            this.myCommentsBox.content.forEach(function (content) {
                myCommentIds_1.push(content.comment.commentId);
                myLikeCounts_1.push(content.comment.likes.count);
                myContents_1.push(content.comment.content);
            });
            Ajax.refreshComments(this.post.postId, myCommentIds_1, myLikeCounts_1, myContents_1, this.myCommentsBox.take, this.feedFilter, 'myComments', function (commentCards) {
                if (commentCards == null) {
                    _this.myCommentsBox.messageElm.innerText = 'My Comments - No changes have been made';
                }
                else {
                    _this.myCommentsBox.messageElm.innerText = 'My Comments';
                    _this.myCommentsBox.clear();
                    _this.myCommentsBox.add(commentCards);
                }
            });
        }
        if (this.likedCommentsBox.length > 0) {
            this.commentBoxesStage.stageFlags.push(this.likedCommentsStaged);
            var likedCommentIds_1 = [];
            var likedLikeCounts_1 = [];
            var likedContents_1 = [];
            this.likedCommentsBox.content.forEach(function (content) {
                likedCommentIds_1.push(content.comment.commentId);
                likedLikeCounts_1.push(content.comment.likes.count);
                likedContents_1.push(content.comment.content);
            });
            Ajax.refreshComments(this.post.postId, likedCommentIds_1, likedLikeCounts_1, likedContents_1, this.likedCommentsBox.take, this.feedFilter, 'likedComments', function (commentCards) {
                if (commentCards == null) {
                    _this.likedCommentsBox.messageElm.innerText = 'My Liked Comments - No changes have been made';
                }
                else {
                    _this.likedCommentsBox.messageElm.innerText = 'My Liked Comments';
                    _this.likedCommentsBox.clear();
                    _this.likedCommentsBox.add(commentCards);
                }
            });
        }
    };
    CommentsBox.prototype.setBtnMyActivity = function (makeBtnShowActivty) {
        var _this = this;
        makeBtnShowActivty ?
            this.btnMyActivity.classList.remove('showingMyCommentActivity')
            : this.btnMyActivity.classList.add('showingMyCommentActivity');
        this.mainCommentsBox.messageElm.innerText = makeBtnShowActivty ? '' : 'All Comments';
        this.btnMyActivity.title = makeBtnShowActivty ? 'Show my activity' : 'Hide my activity';
        this.btnMyActivity.onclick = function (event) { return makeBtnShowActivty ? _this.showCommentActivity() : _this.hideCommentActivity(); };
    };
    CommentsBox.prototype.displayResults = function () {
    };
    CommentsBox.prototype.resizeCommentBox = function () {
        var inputHeight = this.commentInputWrapper.clientHeight;
        var targetHeight = this.getContentHeight() - inputHeight;
        this.commentBoxes.height = targetHeight;
    };
    CommentsBox.prototype.setCommentCount = function (newCount) {
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
    CommentsBox.prototype.requestCommentCount = function () {
        var _this = this;
        Ajax.getCommentCount(this.post.postId, function (commentCount) {
            _this.commentCountText = ViewUtil.tag('div');
            _this.setCommentCount(+commentCount);
            _this.commentCountSlot.append(_this.commentCountText);
        });
    };
    CommentsBox.prototype.alertVisible = function () {
        this.mainCommentsBox.getVisibleContent().forEach(function (commentCard) { return commentCard.alertVisible(); });
    };
    return CommentsBox;
}());
//# sourceMappingURL=CommentsBox.js.map