var ContentType;
(function (ContentType) {
    ContentType[ContentType["Post"] = 1] = "Post";
    ContentType[ContentType["Comment"] = 2] = "Comment";
})(ContentType || (ContentType = {}));
var LikesRecord = (function () {
    function LikesRecord() {
    }
    LikesRecord.copy = function (likesRecord) {
        var recordCopy = new LikesRecord();
        recordCopy.contentId = likesRecord.contentId;
        recordCopy.contentType = likesRecord.contentType;
        recordCopy.count = likesRecord.count;
        recordCopy.hasLiked = likesRecord.hasLiked;
        return recordCopy;
    };
    return LikesRecord;
}());
//# sourceMappingURL=LikesRecord.js.map