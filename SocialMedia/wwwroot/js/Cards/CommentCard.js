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
var CommentCard = (function (_super) {
    __extends(CommentCard, _super);
    function CommentCard(comment) {
        var _this = _super.call(this, ViewUtil.tag('div', { classList: 'comment' })) || this;
        _this.comment = comment;
        var mainSection = ViewUtil.tag('div', { classList: 'commentMainSection' });
        var optsSection = ViewUtil.tag('div', { classList: 'commentOptsSection' });
        _this.refreshMessageSection = ViewUtil.tag('div', { classList: 'commentRefreshMessageSection' });
        var contentSection = ViewUtil.tag('div', { classList: 'commentContentSection' });
        var btnOpts = ViewUtil.tag('i', { classList: 'commentOpts threeDots fa fa-ellipsis-v' });
        var btnRefresh = ViewUtil.tag('i', { classList: 'commentOpts threeDots fa fa-refresh' });
        var editIcon = Icons.edit();
        _this.commentEditor = new Editor(editIcon, comment.content, 'comment-editor', false, 125, function (content) {
            Ajax.updateComment(_this.comment.commentId, content);
            CommentCard.commentCards.forEach(function (c) {
                if (c.comment.commentId == _this.comment.commentId)
                    c.commentEditor.setText(content);
            });
        });
        _this.likeCard = new LikeCard(LikesRecord.copy(comment.likes), comment.dateTime);
        contentSection.append(_this.commentEditor.rootElm);
        mainSection.append(new ProfileCard(comment.profile).rootElm, contentSection, _this.likeCard.rootElm, _this.refreshMessageSection);
        _this.rootElm.append(mainSection, optsSection);
        if (comment.profile.relationToUser == 'me') {
            optsSection.append(btnOpts);
            btnOpts.onclick = function (e) { return contextMenu.load(e, [
                new ContextOption(editIcon, function (e) { return _this.commentEditor.start(); }),
                new ContextOption(Icons.deleteComment(), function (e) { return confirmPrompt.load('Are you sure you want to delete this comment?', function (answer) {
                    if (answer == false)
                        return;
                    else
                        _this.remove();
                }); }),
                new ContextOption(Icons.refresh(), function (event) { return _this.refresh(); })
            ]); };
        }
        else {
            optsSection.append(btnRefresh);
            btnRefresh.onclick = function (event) { return _this.refresh(); };
            btnRefresh.classList.add('btnRefreshCommentCard');
        }
        CommentCard.commentCards.push(_this);
        return _this;
    }
    CommentCard.copy = function (commentCard) {
        return new CommentCard(commentCard.comment);
    };
    CommentCard.list = function (comments) {
        if (comments == null)
            return null;
        var commentCards = [];
        comments.forEach(function (comment) { return commentCards.push(new CommentCard(comment)); });
        return commentCards;
    };
    CommentCard.prototype.refresh = function () {
        var _this = this;
        Ajax.getComment(this.comment.commentId, function (commentCard) {
            if (commentCard == null) {
                _this.refreshMessageSection.innerText = 'This comment could not be found.';
            }
            else if (commentCard.comment.content == _this.comment.content &&
                commentCard.comment.likes.count == _this.comment.likes.count) {
                _this.refreshMessageSection.innerText = 'This comment has not changed.';
            }
            else {
                _this.refreshMessageSection.innerText = '';
                _this.likeCard.setLikeCount(commentCard.comment.likes.count);
                _this.comment.likes.count = commentCard.comment.likes.count;
                _this.commentEditor.setText(_this.comment.content);
                _this.comment.content = commentCard.comment.content;
            }
        });
    };
    CommentCard.prototype.disputeHasSeen = function () {
        if (!this.comment.hasSeen)
            this.rootElm.classList.add("unseenComment");
    };
    CommentCard.prototype.alertVisible = function () {
        var _this = this;
        Ajax.updateCommentHasSeen(this.comment.commentId);
        CommentCard.commentCards.forEach(function (commentCard) {
            if (commentCard.comment.commentId == _this.comment.commentId) {
                setTimeout(function () {
                    commentCard.rootElm.classList.remove("unseenComment");
                }, 1000);
                commentCard.comment.hasSeen = false;
            }
        });
    };
    CommentCard.prototype.remove = function () {
        var _this = this;
        Ajax.deleteComment(this.comment.commentId);
        CommentCard.commentCards.forEach(function (commentCard) {
            if (commentCard.comment.commentId == _this.comment.commentId) {
                ViewUtil.remove(commentCard.rootElm);
                commentCard = null;
            }
        });
        Util.filterNulls(CommentCard.commentCards);
        PostCard.postCards.forEach(function (p) {
            if (p.post.postId == _this.comment.postId) {
                p.commentsBox.setCommentCount(p.commentsBox.totalCommentCount - 1);
            }
        });
    };
    CommentCard.commentCards = [];
    return CommentCard;
}(Card));
//# sourceMappingURL=CommentCard.js.map