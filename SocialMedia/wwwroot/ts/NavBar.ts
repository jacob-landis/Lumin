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

    public static updatePostsSection(): void {

        // Update padding-top.
        this.postsSectionElm.style.paddingTop = `${this.navBarElm.clientHeight}`;
    }

    public static show(): void {

        // Restore height of navBar.
        this.navBarElm.style.height = '50px';

        this.updatePostsSection();
    }

    public static reduceHeight(scrollIntensity: number): void {

        let reductionRate: number = 0.1;

        let newHeight: string = `${this.navBarElm.clientHeight - (scrollIntensity * reductionRate)}`;

        // Reduce height by the scroll intensity times a rate.
        this.navBarElm.style.height = +newHeight > 35 ? newHeight : '0px';
        
        this.updatePostsSection();
    }

}