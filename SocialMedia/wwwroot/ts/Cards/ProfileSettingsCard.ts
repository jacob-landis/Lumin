class ProfileSettingsCard extends Card {

    public btnToggleSettingsSection: ToggleButton;
    private profile: ProfileRecord;

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

            confirmPrompt.load("Are you sure you want to use these privacy settings?", (answer: boolean) => {
                if (answer == true) {

                    let privacySettings: number[] = [];

                    this.selectElements.forEach((elm: HTMLSelectElement) => {
                        privacySettings.push(elm.selectedIndex);
                    });

                    Ajax.updatePrivacySettings(privacySettings);

                    // Update held profile. This prevents a revert prompt from triggering after the user has saved changes.
                    this.profile.profilePicturePrivacyLevel = this.selectProfilePictureSetting.selectedIndex;
                    this.profile.profileBioPrivacyLevel = this.selectBioSetting.selectedIndex;
                    this.profile.profileImagesPrivacyLevel = this.selectImagesSetting.selectedIndex;
                    this.profile.profileFriendsPrivacyLevel = this.selectFriendsSetting.selectedIndex;
                    this.profile.profilePostsPrivacyLevel = this.selectPostsSetting.selectedIndex;
                }
            });
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
            profileModal.summaryWrapper.style.backgroundColor = this.txtProfileColor.value;
        }

        this.txtProfileColor.onkeyup = (event: KeyboardEvent) => {

            this.btnSaveColor.style.backgroundColor = this.txtProfileColor.value;
        }
    }

    public setPrivacySelectValues(profile: ProfileRecord): void {
        this.profile = profile;
        this.selectProfilePictureSetting.value = `${profile.profilePicturePrivacyLevel}`;
        this.selectBioSetting.value =            `${profile.profileBioPrivacyLevel}`;
        this.selectImagesSetting.value =         `${profile.profileImagesPrivacyLevel}`;
        this.selectFriendsSetting.value =        `${profile.profileFriendsPrivacyLevel}`;
        this.selectPostsSetting.value =          `${profile.profilePostsPrivacyLevel}`;
    }

    public isChanged(): boolean {
        return (
            this.selectProfilePictureSetting.value != `${this.profile.profilePicturePrivacyLevel}` ||
            this.selectBioSetting.value !=            `${this.profile.profileBioPrivacyLevel}` ||
            this.selectImagesSetting.value !=         `${this.profile.profileImagesPrivacyLevel}` ||
            this.selectFriendsSetting.value !=        `${this.profile.profileFriendsPrivacyLevel}` ||
            this.selectPostsSetting.value !=          `${this.profile.profilePostsPrivacyLevel}`
        )
    }
}