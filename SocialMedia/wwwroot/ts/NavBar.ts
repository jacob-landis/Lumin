class NavBar {

    public navBarElm: HTMLElement;
    public postsSectionElm: HTMLElement;

    public btnOpenUserProfileModalImageBox: ImageBox;
    
    public constructor(navBarElm: HTMLElement, postsSectionElm: HTMLElement, btnOpenUserProfileModal: HTMLElement) {
        this.navBarElm = navBarElm;
        this.postsSectionElm = postsSectionElm;

        this.btnOpenUserProfileModalImageBox = new ImageBox(btnOpenUserProfileModal, '', null, true);
        this.btnOpenUserProfileModalImageBox.load(User.profilePictureId);

        // OPEN HELP MODAL
        document.getElementById('btnOpenHelpModal').onclick = (e: MouseEvent) => helpModal.open();

        // OPEN USER PROFILE MODAL
        document.getElementById('btnOpenUserProfileModal').onclick = (e: MouseEvent) => profileModal.launch(User.profileId);

        // CREATE POST
        document.getElementById('btnCreatePost').onclick = (e: MouseEvent) => createPostModal.load();

        // SHOW FRIENDS
        document.getElementById('btnShowFriends').onclick = (e: MouseEvent) => friendDropdown.toggle();

        // SHOW IMAGES
        document.getElementById('btnShowImages').onclick = (e: MouseEvent) => imageDropdown.toggle();

        this.postsSectionElm.addEventListener('wheel', (event: MouseWheelEvent) => {
            
            if (event.deltaY > 0) this.reduceHeight(event.deltaY);
            else this.show();
        });
        
        window.onmousemove = (event: MouseEvent) => { if (event.pageY < 50) this.show(); }

        this.show();
    }

    public updatePostsSection(): void {

        // Update padding-top.
        this.postsSectionElm.style.paddingTop = `${this.navBarElm.clientHeight}`;
    }

    public show(): void {

        // Restore height of navBar.
        this.navBarElm.style.height = '50px';

        this.updatePostsSection();
    }

    public reduceHeight(scrollIntensity: number): void {

        let reductionRate: number = 0.1;

        let newHeight: string = `${this.navBarElm.clientHeight - (scrollIntensity * reductionRate)}`;

        // Reduce height by the scroll intensity times a rate or hide it completely once it has been reduced enough (reduced to 35px).
        if (+newHeight > 35) this.navBarElm.style.height = newHeight;
        else this.hide();
        
        this.updatePostsSection();

        Dropdown.closeAny();
    }

    public hide(): void {
        this.navBarElm.style.height = '0';
    }

}