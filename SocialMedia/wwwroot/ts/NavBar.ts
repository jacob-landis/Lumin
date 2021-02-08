class NavBar {

    public static navBarElm: HTMLElement;
    public static postsSectionElm: HTMLElement;

    public static initialize(navBarElm: HTMLElement, postsSectionElm: HTMLElement): void {

        this.navBarElm = navBarElm;
        this.postsSectionElm = postsSectionElm;

        this.postsSectionElm.addEventListener('wheel', (event: MouseWheelEvent) => {
            
            if (event.deltaY > 0) this.reduceHeight(event.deltaY);
            else this.show();
        });

        this.show();
    }

    public static updatePostsSection(navBarHeightChange: number): void {

        // Update padding-top, and scroll position (to counteract the postion change).

        // padding-top = navBar.height
        this.postsSectionElm.style.paddingTop = `${this.navBarElm.clientHeight}`;

        // scrollPosition += navBarHeightChange
        this.postsSectionElm.scrollTop += navBarHeightChange;
    }

    public static show(): void {

        let heightBenchMarker = this.navBarElm.clientHeight;

        // Restore height of navBar.

        this.updatePostsSection(heightBenchMarker - this.navBarElm.clientHeight);
    }

    public static reduceHeight(scrollIntensity: number): void {

        let heightBenchMarker = this.navBarElm.clientHeight;

        // Reduce height by the scroll intensity times a rate,
        // then check if it has surpassed a threshold,
        // in which case close it completely.

        this.updatePostsSection(heightBenchMarker - this.navBarElm.clientHeight);
    }

}