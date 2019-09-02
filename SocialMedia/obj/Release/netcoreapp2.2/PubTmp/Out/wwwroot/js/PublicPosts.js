class PublicPosts {
    
    static initialize() {
        this.postWrapper = document.getElementById('publicPosts');
        this.postBox = new PostsBox(null, this.postWrapper);
        this.postBox.start();
        
        window.addEventListener('scroll', () => {
            let docHeight = Util.getDocumentHeight();
            let offset = window.pageYOffset + window.innerHeight + 2000;

            if (offset >= docHeight && !this.isLoading) this.postBox.contentBox.request(4);
        });
    }
}