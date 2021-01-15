var CommentRecord = (function () {
    function CommentRecord() {
    }
    CommentRecord.copy = function (commentRecord) {
        var recordCopy = new CommentRecord();
        recordCopy.commentId = commentRecord.commentId;
        recordCopy.content = commentRecord.content;
        recordCopy.profile = commentRecord.profile;
        recordCopy.dateTime = commentRecord.dateTime;
        recordCopy.likes = LikesRecord.copy(commentRecord.likes);
        recordCopy.postId = commentRecord.postId;
        return recordCopy;
    };
    return CommentRecord;
}());
//# sourceMappingURL=CommentRecord.js.map