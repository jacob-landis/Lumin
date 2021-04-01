class CommentsBox extends ContentBox {

    public postId: number;
    public getFeedFilter: () => ('recent' | 'likes');
    public feedType: ('myComments' | 'likedComments' | 'mainComments');

    public onCommentsLoadEnd: (noChanges: boolean) => void;

    public constructor(
        postId: number,
        feedType: ('myComments' | 'likedComments' | 'mainComments'),
        getFeedFilter: () => ('recent' | 'likes'),
        onCommentsLoadEnd: (noChanges: boolean) => void
    ) {

        super(ViewUtil.tag('div', { classList: 'commentsBox' }), null, 400, 30, (skip: number, take: number) => {
            Ajax.getComments(postId, skip, take, getFeedFilter(), feedType, (commentCards: CommentCard[]) => {

                if (commentCards != null) this.add(commentCards);

                if (this.onCommentsLoadEnd != null) this.onCommentsLoadEnd(commentCards == null);
            });
        });

        this.postId = postId;
        this.feedType = feedType;
        this.getFeedFilter = getFeedFilter;
        this.onCommentsLoadEnd = onCommentsLoadEnd;
    }

    public refreshComments(onRefreshLoadEnd?: (noChange: boolean) => void) {

        let commentIds: number[] = [];
        let likeCounts: number[] = [];
        let contents: string[] = [];
        this.content.forEach((content: IAppendable) => {
            commentIds.push((<CommentCard>content).comment.commentId);
            likeCounts.push((<CommentCard>content).comment.likes.count);
            contents.push((<CommentCard>content).comment.content);
        });

        Ajax.refreshComments(this.postId, commentIds, likeCounts, contents, this.take, this.getFeedFilter(), this.feedType,
            (commentCards: CommentCard[]) => {
                
                if (commentCards != null) {
                    this.clear();
                    this.add(commentCards);
                }

                if (this.onCommentsLoadEnd != null) onRefreshLoadEnd(commentCards == null);
            }
        );
    }
}