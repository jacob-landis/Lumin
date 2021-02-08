class CommentRecord {
    commentId: number;
    content: string;
    hasSeen: boolean;
    profile: ProfileRecord;
    dateTime: string;
    likes: LikesRecord;
    postId: number;

    public static copy(commentRecord: CommentRecord): CommentRecord {

        let recordCopy: CommentRecord = new CommentRecord();

        recordCopy.commentId    = commentRecord.commentId;
        recordCopy.content      = commentRecord.content;
        recordCopy.hasSeen      = commentRecord.hasSeen;
        recordCopy.profile      = commentRecord.profile;
        recordCopy.dateTime     = commentRecord.dateTime;
        recordCopy.likes        = LikesRecord.copy(commentRecord.likes);
        recordCopy.postId       = commentRecord.postId;
        
        return recordCopy;
    }
}