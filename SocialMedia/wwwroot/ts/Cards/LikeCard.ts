class LikeCard extends Card {

    private static likeCards: LikeCard[] = [];
    
    private static changeAllContentInstances(referenceLikesRecord: LikesRecord) {
        this.likeCards.forEach((likeCard: LikeCard) => {
            if (
                likeCard.likesRecord.contentId == referenceLikesRecord.contentId
                && likeCard.likesRecord.contentType == referenceLikesRecord.contentType
            ) {
                likeCard.setLikeCount(likeCard.likesRecord.count + (likeCard.likesRecord.hasLiked ? -1 : 1));

                likeCard.btnLike.classList.toggle('hasLiked');

                likeCard.likesRecord.hasLiked = !likeCard.likesRecord.hasLiked;
            }
        });
    }

    private likesRecord: LikesRecord;
    private countDisplayElm: HTMLElement;
    private btnLike: HTMLElement;

    /*
        Example:
        <div class="likeCard">
            <i class="fa fa-thumbs-up likeIcon hasLiked"></i>
            <div class="likeCount">1</div>
            <div class="contentPostDate">Jan 21st, 2021 at 12:10 pm</div>
        </div>
    */
    constructor(likes: LikesRecord, dateTime: string) {
        
        super(ViewUtil.tag('div', { classList: 'likeCard' }));
        
        let dateTimeStamp = ViewUtil.tag('div', { classList: 'contentPostDate', innerText: Util.formatDateTime(dateTime) });

        this.likesRecord = likes;
        this.btnLike = ViewUtil.tag('i', { classList: 'fa fa-thumbs-up likeIcon ' + (this.likesRecord.hasLiked ? 'hasLiked' : '') });
        this.countDisplayElm = ViewUtil.tag('div', { classList: 'likeCount', innerText: this.likesRecord.count != 0 ? this.likesRecord.count : '0' });

        if (this.likesRecord.hasLiked) this.btnLike.title = `You liked this on ${Util.formatDateTime(this.likesRecord.dateTime)}.`;

        this.rootElm.append(this.btnLike, this.countDisplayElm, dateTimeStamp);

        this.btnLike.onclick = (e: MouseEvent) => {
            
            // Update the record on the host.
            if (this.likesRecord.hasLiked) Ajax.unlike(this.likesRecord.contentType, this.likesRecord.contentId);
            else Ajax.postLike(this.likesRecord.contentType, this.likesRecord.contentId);

            // Adjust like cards on all occurences of this content.
            LikeCard.changeAllContentInstances(this.likesRecord);
        }

        LikeCard.likeCards.push(this);
    }

    public setLikeCount(newCount: number): void {
        if (newCount > -1) {
            this.likesRecord.count = newCount;
            this.countDisplayElm.innerText = `${newCount}`;
        }
    }
}