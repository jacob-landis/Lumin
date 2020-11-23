enum ContentType { Post = 1, Comment = 2 }

class LikesRecord {

    contentId: number;
    contentType: ContentType;
    hasLiked: boolean;
    count: number;

    public constructor(likesRecordString: string) {

    }
}