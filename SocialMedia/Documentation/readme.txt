This document serves as a guide to the features of this project.

Lumin is a mostly single page web application built using the ASP.Net Core MVC framework.
Outside of the main page, there is only pages for login, account creation, and account deletion.
Front end consists of TypeScript, CSS, and HTML.


CONTENT

- User
	- A user is the record in the Identity User plugin database.
	- It is used to get a profile.

- Profile
	- Holds public information like name, bio, profile picture, and privacy settings.
	- Profile name is two fields: FirstName, and LastName, but is sent to client as one combined name. Each can be 1-30 characters long.
	- The profile password is not really a password at all, but instead a unique link that ties the profile to a user.
	- A profiles bio can be 0-250 characters long.
	- Privacy
		- Privacy settings for a profile include profile picture, bio, friends, images, and posts privacy.
		- The last two, image and post privacy settings, only effect the default setting for images and posts that the user uploads and posts.
		- Privacy level can be set on images and posts on creation but can also be changed later.
		- Privacy levels: 
			- 0: All
			- 1: Mutual friends
			- 2: Friends
			- 3: Me (Only visible to the owner of the content)

- Friends
	- A friend record acts as a request and an accepted friend.
	- A relationship is a ProfileID pair (to and from).
	- A bool type field tracks whether the invitation has been accepted.
	- Friend status is attached to the profile view model and full profile view model when sent to the client.
		- Status: me
			Description: This profile is the current user's profile.
			Response: Do nothing.
		- Status: userRequested
			Description: The current user requested them.
			Response: Attach a button labeled "Cancel" that sends delete request to server to remove friend.
		- Status: friend
			Description: Either sent to or from the current user but either case was accepted.
			Response: Attach a button labeled "Remove" that sends delete request to server to remove friend.
		- Status: requestedUser
			Description: They requested the current user.
			Response: Attach a button labeled "Accept" that sends an update request to server to accept.
		- Status: unrelated
			Description: No request has been made between them and the current user.
			Response: Attach a button labeled "Add" that sends a post request to server to make request.
	- Blocking a user makes them unable to see you in search results and unable to send a request or open your profile
	  if they see it in a comment on a post from a mutual friend.

- Images
	- An image can be used as a profile picture and it can be attached to posts.
	- Image files are stored in the server file system, seperate from their corresponding records in the database.
	- Four different versions of an image are stored and used.
		- Full: The original image. Used in the image gallery modal.
		- Medium: 600px wide and proportionately tall. Used in post cards.
		- Small: 100px square. Used in images box.
		- Thumbnail: 30px square. Used in profile cards.

- Posts
	- Posts can have an image and or a caption.
	- A post caption can be 0-1000 characters long.

- Comment
	- A comment can be 1-125 characters long.
	- Comments that the owner of a post has not seen is highlighted.

- Likes
	- The total number of likes for a piece of content are displayed in the client view on the content.
	- Users can only like things and remove their likes. They cannot dislike things.
	- The like table stores likes of multiple types.
	- Content type: 0 = Post, 1 = Comment


PATTERNS

- Lazy Loading
	- For most tables, there is a shortcut method in the repository class for selecting a range.

- Feed controls
	- Feed controls are availble for comment sections, aw well as the post feed in profile modal.
	- Search: returns posts or comments based on the search terms.
	- Refresh: list of current content is sent to host and compared to current query results. If there are changes, the results are returned.
	- Feed filter
	- My activity

- Session result storage
	- This backend functionality optimizes lazy loading.
	- When a feed is started, a list of id's is generated from a query and stored so that the query doesn't have to run every time the client
	  requests a segment of those results. The segment of ids is used to fetch the actual content.

- Fade effects
	- Staging is usually used in conjunction with fade effects.
	- Fade effects are driven by the show function in the ViewUtil class.
		- A callback can be provided to the show function. In cases where it is, the callback changes the opacity to 1.
		- This is done through a callback because changing the opacity directly after changing the display type causes the CSS fade effect to fail.

- Cards (IAppendable, IUnloadable)
	- Most if not all records are wrapped in a card when they return from the host in a response.

- Modals (IAppendable)
	- Float in the center of the screen.
	- Layer on top of eachother.
		- Must close from the top, one at a time.
	- Modal base class holds shared functionality.
	- When any modal except the context menu is open, page scrolling is locked.
		

- Dropdowns
	- Occupy left side of screen.
	- Only one can be open at a time.


COMPONENTS

- Navbar
	- Hidden by scrolling down, revealed by scrolling up or hovering over area with the mouse cursor.

- Confirm prompt
	- Asks the user for confimation and their yes/no answer is sent into a callback.

- Context menu
	- Used to gives right-click options to content.

- Content box
	- Used in any place where there is a list of content to display.
	- Content box handles all lazy loading.
		- A callback is provided that controls which route the content is pulled from and allows for specialized arguments to be injected.
		- Skip and take values are provided by content box to the callback.
		- Content box tracks when the feed runs out and stops lazy loading.
		- IUnloadable content is unloaded and reloaded by content box.
	- Each content box has a header to title the content. The header is also used to indicate refresh results.
	- Sub-classes
		- Posts box
		- Comments box
		- Images box

- Editor (IAppendable)
	- Used to edit name, bio, post and comment captions.
	- Parameters
		- Start button: editor assigns onclick to this button.
		- Max length: editor ensures that the text not exceed this length, displaying an error message if it does.
		- Can be empty (boolean): editor enforces this rule, displaying an error message if it does.
		- Revert dependency: used to identify an editor that belongs to something that may close. Used in profile modal
		  so that when an edit in name, bio, or a post or comment is active, the user is prompted to confirm revert if
		  they try to close the modal.
		- Callback: used to decide what happens to the changed text after an edit is confirmed.
	- Cancel and confirm buttons are provided by the editor.

- Stage
	- Used to wait for several different content items to be done loading so they can be displayed smoothly all at once.
	- Holds an array of stage flags.
	- Each time a stage flag is raised, the stage checks if all flags are raised.
	- When all stage flags are raised, the stage activates the callback that it was provided.

- Toggle Button (IAppendable)
	- Used for buttons that change their icon and or onclick when they are clicked.
	- Any number of toggle states can be used.
	- Ex. Profile Posts Card uses a toggle button that has three states: 
		- Set feed filter to 'recent'.
		- Set feed filter to 'likes'.
		- Set feed filter to 'comments'.

- Image Box (IAppendable, IUnloadable)
	- Holds an image card.
	- Image cards can be swapped out for other ones.
	- An image card can be unloaded, and then easily reloaded (this functionality is used for lazy loading).


INTERFACES

- IAppendable
	- Any content with a root element property.

- IUnloadable
	- Any content that contains image boxes.
	- Unloadable content is unloaded and reloaded when in a content box.