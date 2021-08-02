class CommentsBox extends ContentBox {
    
    public constructor(
        scrollElm: HTMLElement,
        public postId: number,
        public feedType: ('myComments' | 'likedComments' | 'mainComments'),
        public getFeedFilter: () => ('recent' | 'likes'),
        public onCommentsLoadEnd: (noChanges: boolean) => void
    ) {
        super(ViewUtil.tag('div', { classList: 'commentsBox' }), scrollElm, 400, 30, (skip: number, take: number) => {
            Ajax.getComments(this.postId, skip, take, this.getFeedFilter(), this.feedType, (commentCards: CommentCard[]) => {

                if (commentCards != null) this.add(commentCards);

                if (this.onCommentsLoadEnd != null) this.onCommentsLoadEnd(commentCards == null);
            });
        });
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