class ProfileSettingsCard extends Card {

    public btnToggleSettingsSection: ToggleButton;

    constructor(
        rootElm: HTMLElement,
        btnToggleSettingsSection: HTMLElement,
        private selectProfilePictureSetting: HTMLElement,
        private selectBioSetting: HTMLElement,
        private selectImagesSetting: HTMLElement,
        private selectFriendsSetting: HTMLElement,
        private selectPostsSetting: HTMLElement,
        private colorPalette: HTMLElement,
        private txtProfileColor: HTMLInputElement,
        private btnSaveColor: HTMLElement,
        private btnSaveSettings: HTMLElement
    ) {
        super(rootElm);

        this.btnToggleSettingsSection = new ToggleButton(null, btnToggleSettingsSection, null, [
            new ToggleState('fa-cog', 'Open profile settings', () => ViewUtil.show(this.rootElm, 'grid')),
            new ToggleState('fa-times', 'Close profile settings', () => ViewUtil.hide(this.rootElm))
        ]);

        this.btnSaveSettings.onclick = (event: MouseEvent) => {
            Ajax.updatePrivacySettings([1,2,3,4,2]);
        }

        this.colorPalette.childNodes.forEach((childNode: ChildNode) => {
            let elm: HTMLElement = <HTMLElement>childNode;

            elm.onclick = (event: MouseEvent) => {
                this.txtProfileColor.value = elm.style.backgroundColor;
                this.btnSaveColor.style.backgroundColor = elm.style.backgroundColor;
            }
        });

        this.btnSaveColor.onclick = (event: MouseEvent) => {
            Ajax.updateProfileColor(this.txtProfileColor.value);
            // profileModal.summary.backgroundColor = this.txtProfileColor.value;
            console.log(this.txtProfileColor.value);
        }

        this.txtProfileColor.onkeyup = (event: KeyboardEvent) => {

            this.btnSaveColor.style.backgroundColor = this.txtProfileColor.value;
            console.log(this.btnSaveColor.style.backgroundColor);
        }
    }
}