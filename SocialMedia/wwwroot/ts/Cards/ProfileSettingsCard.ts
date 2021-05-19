class ProfileSettingsCard extends Card {

    public btnToggleSettingsSection: ToggleButton;

    public get selectElements(): HTMLSelectElement[] {
        return [this.selectProfilePictureSetting, this.selectBioSetting, this.selectImagesSetting, this.selectFriendsSetting, this.selectPostsSetting]
    }

    constructor(
        rootElm: HTMLElement,
        btnToggleSettingsSection: HTMLElement,
        private selectProfilePictureSetting: HTMLSelectElement,
        private selectBioSetting: HTMLSelectElement,
        private selectImagesSetting: HTMLSelectElement,
        private selectFriendsSetting: HTMLSelectElement,
        private selectPostsSetting: HTMLSelectElement,
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

            let privacySettings: number[] = [];

            this.selectElements.forEach((elm: HTMLSelectElement) => {
                privacySettings.push(elm.selectedIndex);
            });

            Ajax.updatePrivacySettings(privacySettings);
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
        }

        this.txtProfileColor.onkeyup = (event: KeyboardEvent) => {

            this.btnSaveColor.style.backgroundColor = this.txtProfileColor.value;
            console.log(this.btnSaveColor.style.backgroundColor);
        }
    }
}