class RelationCard extends Card {

    private static cases = {
        'friend': {
            label: 'Unfriend',
            icon: () => Icons.removeFriend(),
            nextCase: 'unrelated',
            action: (profileId: number) => {
                confirmPrompt.load('Are you sure you want to unfriend this user?',
                    (confirmation: boolean) => { if (confirmation) RelationCard.remove(profileId); });
            }
        },
        'userRequested': {
            label: 'Cancel',
            icon: () => Icons.cancelRequest(),
            nextCase: 'unrelated',
            action: (profileId: number) => RelationCard.remove(profileId)
        },
        'requestedUser': {
            label: 'Accept',
            icon: () => Icons.acceptRequest(),
            nextCase: 'friend',
            action: (profileId: number) => {
                Ajax.acceptFriendRequest(profileId);
                friendDropdown.updateFriendRequests(profileId);
            }
        },
        'unrelated': {
            label: 'Request',
            icon: () => Icons.sendRequest(),
            nextCase: 'userRequested',
            action: (profileId: number) =>  Ajax.sendFriendRequest(profileId)
        }
    }

    private static remove(profileId: number): void {
        PostCard.postCards.forEach((p: PostCard) => {
            if (p.post.profile.profileId == profileId) ViewUtil.remove(p.rootElm);
        });

        Ajax.deleteFriend(profileId);
    }

    public case: { label: string, icon: () => HTMLElement, nextCase: string, action: (profileId: number) => void };

    public constructor(public profile: ProfileRecord) {
        super(ViewUtil.tag("div", { classList: "relationCard" }));

        this.case = RelationCard.cases[this.profile.relationToUser];

        this.rootElm.append(this.case.icon());
        this.rootElm.onclick = (event: MouseEvent) => this.changeRelation();
        this.rootElm.title = this.case.label;
    }

    public changeRelation(): void {
        this.case.action(this.profile.profileId);
        this.case = RelationCard.cases[this.case.nextCase];
        this.rootElm.onclick = (event: MouseEvent) => this.case.action(this.profile.profileId);
        ViewUtil.empty(this.rootElm);
        this.rootElm.append(this.case.icon());
    }
}