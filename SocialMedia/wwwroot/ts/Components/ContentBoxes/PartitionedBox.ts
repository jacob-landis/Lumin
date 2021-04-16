class PartitionedBox extends ContentBox {
    
    private feedFilter: string;
    private btnSearch: HTMLElement;
    private txtSearch: HTMLInputElement;
    private stage: Stage;

    public constructor(
        rootElm: HTMLElement,
        buttons: HTMLElement[],
        public mainBox: ContentBox,
        public subBoxes: ContentBox[],
        private onSearch: (searchString: string, onResults: (cards: Card[]) => void) => void
    ) {
        super(rootElm);

        // Prep btnToggleSearchBar.
        let searchIcon = Icons.search();

        // Create btnToggleSearchBar and add it to buttons array.
        buttons.push(new ToggleButton('btnSearchComments', searchIcon, <HTMLElement>searchIcon.childNodes[0], [
            new ToggleState('fa-search', 'Search comments', () => this.showSearchBar()),
            new ToggleState('fa-times', 'Close search', () => this.hideSearchBar())
        ]).rootElm);
        
        this.txtSearch = <HTMLInputElement>ViewUtil.tag('input', { type: 'text', classList: 'txtSearch myTextBtnPair' });

        this.btnSearch = Icons.search();
        this.btnSearch.classList.add('btnSearch', 'myBtnTextPair');
        this.btnSearch.title = 'Search';
        this.btnSearch.onclick = (event: MouseEvent) => this.search();

        buttons.push(this.txtSearch, this.btnSearch);

        // Append each button to the root element.
        buttons.forEach((button: HTMLElement) => this.rootElm.append(button));

        this.add(subBoxes);
        this.add(mainBox);

        mainBox.request(10);
    }

    public setFeedFilter(feedFilter?: string): void {
        this.feedFilter = feedFilter;

        this.stage = new Stage([this.mainBox.staged], () => this.display());

        ViewUtil.hide(this.rootElm);

        this.mainBox.clear();
        this.mainBox.request(10);
        this.mainBox.messageElm.innerText = '';

        this.subBoxes.forEach((box: ContentBox) => {
            if (box.content.length > 0) {
                this.stage.flags.push(box.staged);
                box.clear();
                box.request(10);
            }
        });
    }

    public refresh(): void {
        this.stage = new Stage([this.mainBox.staged], () => this.display());
        ViewUtil.hide(this.rootElm);

        this.mainBox.refresh(() => {
            this.subBoxes.forEach((box: ContentBox) => {
                if (box.content.length > 0) this.mainBox.messageElm.innerText = 'All'
            });
            this.stage.updateStaging(this.mainBox.staged);
        });

        this.subBoxes.forEach((box: ContentBox) => {
            if (box.content.length > 0) {
                this.stage.flags.push(box.staged);
                box.refresh(() => this.stage.updateStaging(box.staged));
            }
        });
    }

    public display(): void {
        ViewUtil.show(this.rootElm, 'block');
    }

    public showSubBoxes(): void {
        this.stage = new Stage([], () => this.display());
        ViewUtil.hide(this.rootElm);
        
        this.subBoxes.forEach((box: ContentBox) => {
            this.stage.flags.push(box.staged)
            box.request(10);
        });

        this.mainBox.messageElm.innerText = 'All';
    }

    public hideSubBoxes(): void {
        this.subBoxes.forEach((box: ContentBox) => {
            box.clear();
            box.messageElm.innerText = '';
        });

        this.mainBox.messageElm.innerText = '';
    }

    private search(): void {
        this.onSearch(this.txtSearch.value, (cards: Card[]) => {
            this.mainBox.clear();

            if (cards != null) {
                this.hideSubBoxes();
                this.mainBox.add(cards);
                this.mainBox.messageElm.innerText = 'Search results';
            }
            else this.mainBox.messageElm.innerText = 'Search results - No comments found';
        });
    }

    public showSearchBar(): void {
        ViewUtil.show(this.txtSearch);
        ViewUtil.show(this.btnSearch);
        this.txtSearch.focus();
    }

    public hideSearchBar(): void {
        ViewUtil.hide(this.txtSearch);
        ViewUtil.hide(this.btnSearch);
        this.txtSearch.value = '';
        this.mainBox.clear();
        this.mainBox.request(10);
        this.mainBox.messageElm.innerText = '';
    }
}