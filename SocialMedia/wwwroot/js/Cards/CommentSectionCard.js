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
    function CommentSectionCard(post, getContentHeight, onCommentLoadEnd) {
        var _this = _super.call(this, ViewUtil.tag('div', { classList: 'commentSection' })) || this;
        _this.commentCountText = null;
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
        _this.lblCommentCharacterCount = ViewUtil.tag('div', { classList: 'lblCommentCharacterCount' });
        _this.commentBoxDetails = ViewUtil.tag('div', { classList: 'commentBoxDetails' });
        _this.commentCountSlot = ViewUtil.tag('div', { classList: 'commentCountSlot' });
        _this.commentBoxFeedControls = ViewUtil.tag('div', { classList: 'commentBoxFeedControls' });
        var btnSearchCommentsIcon = Icons.search();
        _this.btnSearchComments = new ToggleButton('btnSearchComments', btnSearchCommentsIcon, btnSearchCommentsIcon.childNodes[0], [
            new ToggleState('fa-search', 'Search comments', function () { return _this.showCommentSearchBar(); }),
            new ToggleState('fa-times', 'Close search', function () { return _this.hideCommentSearchBar(); })
        ]);
        var btnToggleFeedFilterIcon = Icons.filterByLikes();
        _this.btnToggleFeedFilter = new ToggleButton('btnToggleCommentFeedFilter', btnToggleFeedFilterIcon, btnToggleFeedFilterIcon.childNodes[1], [
            new ToggleState('fa-thumbs-up', 'Sort by popularity', function () { return _this.toggleFeedFilter(); }),
            new ToggleState('fa-calendar', 'Sort by recent')
        ]);
        _this.btnRefreshFeed = Icons.refresh();
        _this.btnRefreshFeed.classList.add('btnRefreshCommentFeed');
        _this.btnRefreshFeed.title = 'Refresh comment feed';
        _this.btnMyActivity = new ToggleButton('btnMyActivity', Icons.history(), null, [
            new ToggleState('', 'Show my activity', function () { return _this.showCommentActivity(); }),
            new ToggleState('showingMyCommentActivity', 'Hide my activity', function () { return _this.hideCommentActivity(); })
        ]);
        _this.txtSearchComments = ViewUtil.tag('input', { type: 'text', classList: 'txtSearchComments myTextBtnPair' });
        _this.btnConfirmCommentSearch = Icons.search();
        _this.btnConfirmCommentSearch.classList.add('btnConfirmCommentSearch', 'myBtnTextPair');
        _this.btnConfirmCommentSearch.title = 'Search';
        _this.commentBoxes = new ContentBox(ViewUtil.tag('div', { classList: 'commentBoxes' }));
        _this.myCommentsBox = new CommentsBox(_this.commentBoxes.scrollElm, _this.post.postId, 'myComments', function () { return _this.feedFilter; }, function (noChanges) {
            if (noChanges)
                _this.myCommentsBox.messageElm.innerText = 'My Comments - No changes have been made';
            else
                _this.myCommentsBox.messageElm.innerText = 'My Comments';
            _this.commentBoxesStage.updateStaging(_this.myCommentsStaged);
        });
        _this.likedCommentsBox = new CommentsBox(_this.commentBoxes.scrollElm, _this.post.postId, 'likedComments', function () { return _this.feedFilter; }, function (noChanges) {
            if (noChanges)
                _this.likedCommentsBox.messageElm.innerText = 'My Liked Comments - No changes have been made';
            else
                _this.likedCommentsBox.messageElm.innerText = 'My Liked Comments';
            _this.commentBoxesStage.updateStaging(_this.likedCommentsStaged);
        });
        _this.mainCommentsBox = new CommentsBox(_this.commentBoxes.scrollElm, _this.post.postId, 'mainComments', function () { return _this.feedFilter; }, function () {
            if (_this.mainCommentsBox.length == 0) {
                _this.mainCommentsBox.clear();
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
            if (onCommentLoadEnd != null)
                onCommentLoadEnd();
            _this.commentBoxesStage.updateStaging(_this.mainCommentsStaged);
        });
        _this.commentBoxes.add([_this.myCommentsBox, _this.likedCommentsBox, _this.mainCommentsBox]);
        var txtComment = ViewUtil.tag('textarea', { classList: 'txtComment' });
        var btnConfirm = Icons.confirm();
        var btnCancel = Icons.cancel();
        var btnComment = ViewUtil.tag('button', { classList: 'btnComment', innerHTML: 'Create Comment' });
        var btnToggleExpanIcon = Icons.dropdownArrow();
        _this.btnToggleViewExpansion = new ToggleButton('btnToggleViewExpansion', btnToggleExpanIcon, btnToggleExpanIcon.childNodes[0], [
            new ToggleState('fa-sort-down', 'Expand comments', function () { return _this.expandCommentSection(); }),
            new ToggleState('fa-sort-up', 'Contract comments', function () { return _this.contractCommentSection(); })
        ]);
        _this.rootElm.append(_this.commentInputWrapper, _this.errorSlot, _this.commentBoxDetails, _this.txtSearchComments, _this.btnConfirmCommentSearch, _this.commentBoxes.rootElm, _this.btnToggleViewExpansion.rootElm);
        _this.commentBoxDetails.append(_this.commentCountSlot, _this.commentBoxFeedControls);
        _this.commentBoxFeedControls.append(_this.btnMyActivity.rootElm, _this.btnToggleFeedFilter.rootElm, _this.btnRefreshFeed, _this.btnSearchComments.rootElm);
        _this.commentInputWrapper.append(txtComment, _this.lblCommentCharacterCount, btnConfirm, btnCancel, btnComment);
        _this.mainCommentsBox.request(15);
        _this.requestCommentCount();
        _this.btnConfirmCommentSearch.onclick = function (e) { return _this.searchComments(); };
        _this.txtSearchComments.onkeyup = function (e) { if (e.keyCode == 13)
            _this.btnConfirmCommentSearch.click(); };
        _this.btnRefreshFeed.onclick = function (event) { return _this.refreshCommentFeed(); };
        var deactivateInput = function () {
            txtComment.value = '';
            _this.commentInputWrapper.classList.remove('activeInput');
        };
        _this.lblCommentCharacterCount.innerText = txtComment.value.length + "/125";
        txtComment.onkeyup = function (event) {
            _this.lblCommentCharacterCount.innerText = txtComment.value.length + "/125";
            if (txtComment.value.length > 125 || txtComment.value.length == 0)
                _this.lblCommentCharacterCount.classList.add('errorMsg');
            else if (_this.lblCommentCharacterCount.classList.contains('errorMsg'))
                _this.lblCommentCharacterCount.classList.remove('errorMsg');
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
        _this.commentBoxesStage = new Stage([_this.mainCommentsStaged]);
        return _this;
    }
    CommentSectionCard.prototype.toggleFeedFilter = function () {
        var _this = this;
        this.commentBoxesStage = new Stage([this.mainCommentsStaged], function () { return _this.displayResults(); });
        ViewUtil.hide(this.commentBoxes.rootElm);
        this.feedFilter = this.feedFilter == 'likes' ? 'recent' : 'likes';
        this.mainCommentsBox.clear();
        this.mainCommentsBox.request(15);
        this.mainCommentsBox.messageElm.innerText = '';
        if (this.myCommentsBox.length > 0) {
            this.commentBoxesStage.flags.push(this.mainCommentsStaged);
            this.myCommentsBox.clear();
            this.myCommentsBox.request(15);
        }
        if (this.likedCommentsBox.length > 0) {
            this.commentBoxesStage.flags.push(this.likedCommentsStaged);
            this.likedCommentsBox.clear();
            this.likedCommentsBox.request(15);
        }
    };
    CommentSectionCard.prototype.showCommentActivity = function (onActivityStaged) {
        var _this = this;
        this.commentBoxesStage = new Stage([this.myCommentsStaged, this.likedCommentsStaged], function () {
            _this.displayResults();
            if (onActivityStaged != null)
                onActivityStaged();
        });
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
        this.mainCommentsBox.messageElm.innerText = '';
        this.setBtnMyActivity(true);
    };
    CommentSectionCard.prototype.refreshCommentFeed = function () {
        var _this = this;
        this.commentBoxesStage = new Stage([this.mainCommentsStaged], function () { return _this.displayResults(); });
        ViewUtil.hide(this.commentBoxes.rootElm);
        this.mainCommentsBox.refreshComments(function (refreshSummary) {
            _this.setCommentCount(refreshSummary.newLength);
            var myActivityIsShowing = _this.myCommentsBox.length > 0 || _this.likedCommentsBox.length > 0;
            if (!refreshSummary.hasChanged) {
                if (myActivityIsShowing)
                    _this.mainCommentsBox.messageElm.innerText = 'All Comments - No changes have been made';
                else
                    _this.mainCommentsBox.messageElm.innerText = 'No changes have been made';
            }
            else if (myActivityIsShowing)
                _this.mainCommentsBox.messageElm.innerText = 'All Comments';
            else
                _this.mainCommentsBox.messageElm.innerText = '';
            _this.commentBoxesStage.updateStaging(_this.mainCommentsStaged);
        });
        if (this.myCommentsBox.length > 0) {
            this.commentBoxesStage.flags.push(this.myCommentsStaged);
            this.myCommentsBox.refreshComments();
        }
        if (this.likedCommentsBox.length > 0) {
            this.commentBoxesStage.flags.push(this.likedCommentsStaged);
            this.likedCommentsBox.refreshComments();
        }
    };
    CommentSectionCard.prototype.setBtnMyActivity = function (makeBtnShowActivity) {
        this.mainCommentsBox.messageElm.innerText = makeBtnShowActivity ? '' : 'All Comments';
    };
    CommentSectionCard.prototype.displayResults = function () {
        ViewUtil.show(this.commentBoxes.rootElm, 'block');
    };
    CommentSectionCard.prototype.searchComments = function () {
        var _this = this;
        Ajax.searchComments(this.post.postId, 0, 30, this.txtSearchComments.value, function (commentCards) {
            _this.mainCommentsBox.clear();
            if (commentCards != null) {
                _this.hideCommentActivity();
                _this.mainCommentsBox.add(commentCards);
                _this.mainCommentsBox.messageElm.innerText = 'Search results';
            }
            else
                _this.mainCommentsBox.messageElm.innerText = 'Search results - No comments found';
        });
    };
    CommentSectionCard.prototype.showCommentSearchBar = function () {
        ViewUtil.show(this.txtSearchComments);
        ViewUtil.show(this.btnConfirmCommentSearch);
        this.txtSearchComments.focus();
    };
    CommentSectionCard.prototype.hideCommentSearchBar = function () {
        ViewUtil.hide(this.txtSearchComments);
        ViewUtil.hide(this.btnConfirmCommentSearch);
        this.txtSearchComments.value = '';
        this.mainCommentsBox.clear();
        this.mainCommentsBox.request(15);
        this.mainCommentsBox.messageElm.innerText = '';
    };
    CommentSectionCard.prototype.expandCommentSection = function () {
        this.setHeight(720, (720 + this.inputHeight));
    };
    CommentSectionCard.prototype.contractCommentSection = function () {
        this.setHeight(this.targetHeight, this.rootElmMinHeight);
    };
    CommentSectionCard.prototype.resizeCommentBox = function () {
        this.inputHeight = this.commentInputWrapper.clientHeight + this.commentBoxDetails.clientHeight + this.btnToggleViewExpansion.rootElm.clientHeight;
        this.targetHeight = this.getContentHeight() - this.inputHeight;
        this.setHeight(this.targetHeight, this.rootElm.offsetHeight);
        this.rootElmMinHeight = this.rootElm.clientHeight;
    };
    CommentSectionCard.prototype.setHeight = function (commentBoxesHeight, sectionHeight) {
        this.commentBoxes.height = commentBoxesHeight;
        this.commentBoxes.rootElm.style.maxHeight = "" + commentBoxesHeight;
        this.rootElm.style.minHeight = "" + sectionHeight;
        this.rootElm.style.maxHeight = "" + sectionHeight;
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
            if (_this.commentCountText == null) {
                _this.commentCountText = ViewUtil.tag('div');
                _this.commentCountSlot.append(_this.commentCountText);
            }
            _this.setCommentCount(+commentCount);
        });
    };
    CommentSectionCard.prototype.alertVisible = function () {
        this.mainCommentsBox.getVisibleContent().forEach(function (commentCard) { return commentCard.alertVisible(); });
    };
    return CommentSectionCard;
}(Card));
//# sourceMappingURL=CommentSectionCard.js.map