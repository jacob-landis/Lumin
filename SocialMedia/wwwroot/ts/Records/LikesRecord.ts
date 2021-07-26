enum ContentType { Post = 1, Comment = 2 }

class LikesRecord {
    contentId: number;
    contentType: ContentType;
    count: number;
    hasLiked: boolean;
    dateTime: string;

    public static copy(likesRecord: LikesRecord): LikesRecord {

        let recordCopy: LikesRecord = new LikesRecord();

        recordCopy.contentId    = likesRecord.contentId;
        recordCopy.contentType  = likesRecord.contentType;
        recordCopy.count        = likesRecord.count;
        recordCopy.hasLiked     = likesRecord.hasLiked;
        recordCopy.dateTime     = likesRecord.dateTime;
        
        return recordCopy;
    }
}