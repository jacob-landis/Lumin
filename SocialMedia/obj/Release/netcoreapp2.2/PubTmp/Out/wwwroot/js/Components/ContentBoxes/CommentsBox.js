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
var CommentsBox = (function (_super) {
    __extends(CommentsBox, _super);
    function CommentsBox(scrollElm, postId, feedType, getFeedFilter, revertDependency, onCommentsLoadEnd) {
        var _this = _super.call(this, ViewUtil.tag('div', { classList: 'commentsBox' }), scrollElm, 400, 30, function (skip, take) {
            Ajax.getComments(_this.postId, skip, take, _this.getFeedFilter(), _this.feedType, revertDependency, function (commentCards) {
                _this.add(commentCards);
                if (_this.onCommentsLoadEnd != null)
                    _this.onCommentsLoadEnd(commentCards == null);
            });
        }) || this;
        _this.postId = postId;
        _this.feedType = feedType;
        _this.getFeedFilter = getFeedFilter;
        _this.revertDependency = revertDependency;
        _this.onCommentsLoadEnd = onCommentsLoadEnd;
        _this.messageElm.onclick = function (event) { return _this.collapseBox(); };
        _this.messageElm.title = 'Collapse section';
        return _this;
    }
    CommentsBox.prototype.refreshComments = function (onRefreshLoadEnd) {
        var _this = this;
        var commentIds = [];
        var likeCounts = [];
        var contents = [];
        this.content.forEach(function (content) {
            commentIds.push(content.comment.commentId);
            likeCounts.push(content.comment.likes.count);
            contents.push(content.comment.content);
        });
        Ajax.refreshComments(this.postId, commentIds, likeCounts, contents, this.take, this.getFeedFilter(), this.feedType, function (refreshSummary) {
            _this.clear();
            if (refreshSummary.comments != null) {
                _this.add(CommentCard.list(refreshSummary.comments, _this.revertDependency));
                _this.content.forEach(function (content) { return content.disputeHasSeen(); });
            }
            if (_this.onCommentsLoadEnd != null)
                onRefreshLoadEnd(refreshSummary);
        });
    };
    CommentsBox.prototype.collapseBox = function () {
        var _this = this;
        ViewUtil.hide(this.contentElm);
        this.messageElm.onclick = function (event) { return _this.expandBox(); };
        this.messageElm.title = 'Expand section';
    };
    CommentsBox.prototype.expandBox = function () {
        var _this = this;
        ViewUtil.show(this.contentElm, 'block');
        this.messageElm.onclick = function (event) { return _this.collapseBox(); };
        this.messageElm.title = 'Collapse section';
    };
    return CommentsBox;
}(ContentBox));
//# sourceMappingURL=CommentsBox.js.map