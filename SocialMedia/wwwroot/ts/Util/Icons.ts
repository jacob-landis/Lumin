class Icons {

    private static buildIcon(suffixes: string[]): HTMLElement {
        
        let iconRootElm: HTMLElement = ViewUtil.tag('div', { classList: 'icon' });

        suffixes.forEach((suffix: string) => iconRootElm.append(ViewUtil.tag('i', { classList: `fa fa-${suffix}` })));
        
        return iconRootElm;
    }

    public static acceptRequest(): HTMLElement  { return Icons.buildIcon(['check icon-sm', 'user']) }

    public static cancelRequest(): HTMLElement  { return Icons.buildIcon(['times icon-sm', 'user']) }

    public static removeFriend(): HTMLElement   { return Icons.buildIcon(['minus icon-sm', 'user']) }

    public static sendRequest(): HTMLElement    { return Icons.buildIcon(['plus icon-sm', 'user']) }

    public static deleteComment(): HTMLElement  { return Icons.buildIcon(['minus icon-sm', 'comment']) }

    public static attachToPost(): HTMLElement   { return Icons.buildIcon(['paperclip icon-sm', 'sticky-note']) }

    public static deleteImage(): HTMLElement    { return Icons.buildIcon(['minus icon-sm', 'image']) }

    public static createPost(): HTMLElement     { return Icons.buildIcon(['plus icon-sm', 'sticky-note']) }

    public static deletePost(): HTMLElement     { return Icons.buildIcon(['minus icon-sm', 'sticky-note']) }

    public static paperClip(): HTMLElement      { return Icons.buildIcon(['paperclip']) }

    public static confirm(): HTMLElement        { return Icons.buildIcon(['check']) }

    public static cancel(): HTMLElement         { return Icons.buildIcon(['times']) }

    public static edit(): HTMLElement           { return Icons.buildIcon(['edit']) }

    public static refresh(): HTMLElement        { return Icons.buildIcon(['refresh']) }
                                                
    public static filterByLikes(): HTMLElement  { return Icons.buildIcon(['filter', 'thumbs-up']) }

    public static history(): HTMLElement        { return Icons.buildIcon(['history']) }

    public static dropdownArrow(): HTMLElement  { return Icons.buildIcon(['sort-down']) }

    public static search(): HTMLElement         { return Icons.buildIcon(['search']) }
}