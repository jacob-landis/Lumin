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
        var contentSection = ViewUtil.tag('div', { classList: 'commentContentSection' });
        var btnOpts = ViewUtil.tag('i', { classList: 'commentOpts threeDots fa fa-ellipsis-v' });
        var editIcon = Icons.edit();
        _this.commentEditor = new Editor(editIcon, comment.content, 'comment-editor', 125, function (content) {
            Ajax.updateComment(_this.comment.commentId, content);
            CommentCard.commentCards.forEach(function (c) {
                if (c.comment.commentId == _this.comment.commentId)
                    c.commentEditor.setText(content);
            });
        });
        contentSection.append(_this.commentEditor.rootElm);
        mainSection.append(new ProfileCard(comment.profile).rootElm, contentSection, new LikeCard(LikesRecord.copy(comment.likes), comment.dateTime).rootElm);
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
                }); })
            ]); };
        }
        CommentCard.commentCards.push(_this);
        return _this;
    }
    CommentCard.copy = function (commentCard) {
        return new CommentCard(commentCard.comment);
    };
    CommentCard.list = function (comments) {
        var commentCards = [];
        comments.forEach(function (comment) { return commentCards.push(new CommentCard(comment)); });
        return commentCards;
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
                p.setCommentCount(p.totalCommentCount - 1);
            }
        });
    };
    CommentCard.commentCards = [];
    return CommentCard;
}(Card));
//# sourceMappingURL=CommentCard.js.map