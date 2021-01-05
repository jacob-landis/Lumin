enum ContentType { Post = 1, Comment = 2 }

class LikesRecord {
    contentId: number;
    contentType: ContentType;
    count: number;
    hasLiked: boolean;
}