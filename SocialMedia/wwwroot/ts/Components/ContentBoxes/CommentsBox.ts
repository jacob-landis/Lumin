class CommentsBox extends ContentBox {
    
    public constructor(
        scrollElm: HTMLElement,
        private postId: number,
        private feedType: ('myComments' | 'likedComments' | 'mainComments'),
        private getFeedFilter: () => ('recent' | 'likes'),
        private onCommentsLoadEnd: (noChanges: boolean) => void
    ) {
        super(ViewUtil.tag('div', { classList: 'commentsBox' }), scrollElm, 400, 30, (skip: number, take: number) => {
            Ajax.getComments(this.postId, skip, take, this.getFeedFilter(), this.feedType, (commentCards: CommentCard[]) => {

                this.add(commentCards);

                if (this.onCommentsLoadEnd != null) this.onCommentsLoadEnd(commentCards == null);
            });
        });
        
        this.messageElm.onclick = (event: MouseEvent) => this.collapseBox();
        this.messageElm.title = 'Collapse section';
    }

    public refreshComments(onRefreshLoadEnd?: (refreshSummary: CommentRefreshSummaryRecord) => void) {

        let commentIds: number[] = [];
        let likeCounts: number[] = [];
        let contents: string[] = [];
        this.content.forEach((content: IAppendable) => {
            commentIds.push((<CommentCard>content).comment.commentId);
            likeCounts.push((<CommentCard>content).comment.likes.count);
            contents.push((<CommentCard>content).comment.content);
        });

        Ajax.refreshComments(this.postId, commentIds, likeCounts, contents, this.take, this.getFeedFilter(), this.feedType,
            (refreshSummary: CommentRefreshSummaryRecord) => {

                this.clear();

                if (refreshSummary.comments != null) {
                    this.add(CommentCard.list(refreshSummary.comments));
                    this.content.forEach((content: IAppendable) => (<CommentCard>content).disputeHasSeen());
                }

                if (this.onCommentsLoadEnd != null)
                    onRefreshLoadEnd(refreshSummary);
            }
        );
    }

    private collapseBox(): void {
        ViewUtil.hide(this.contentElm);
        this.messageElm.onclick = (event: MouseEvent) => this.expandBox();
        this.messageElm.title = 'Expand section';
    }

    private expandBox(): void {
        ViewUtil.show(this.contentElm, 'block');
        this.messageElm.onclick = (event: MouseEvent) => this.collapseBox();
        this.messageElm.title = 'Collapse section';
    }
}