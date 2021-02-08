class PublicPosts {
    
    private postBox: PostsBox;

    public constructor(postWrapper: HTMLElement) {
        this.postBox = new PostsBox(null, postWrapper);
        this.postBox.start();
        
        window.addEventListener('scroll', (e: MouseEvent) => {
            let docHeight: number = Util.getDocumentHeight();
            let offset: number = window.pageYOffset + window.innerHeight + 2000;

            if (offset >= docHeight && !this.postBox.loading) this.postBox.request(4);

            // this.postBox.visibleContent = [];

            this.postBox.content.forEach((postCard: PostCard) => {
                if (postCard) return;
                /*
                
                if (postCard is in viewport){
                    
                    this.postBox.visibleContent.push(postCard);

                }

                */
            });
        });
    }
}