This document serves as a guide to the features of this project.

FEATURES

- Content: Images, Posts, Comments, Likes.

- User
	- A user is merely the record in the Identity User plugin database.
	- It is used to get a profile.

- Profile
	- Holds public information like name, bio, profile picture.
	- Profile name is two fields: FirstName, and LastName, but is sent to client as one combined name.
	- The profile password is not really a password at all, but instead a unique link that ties the profile to a user.

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
			Response: Attach a label that says "Pending".

		- Status: friend
			Description: Either sent to or from the current user but either case was accepted.
			Response: Attach a button labeled "Remove" that sends delete request to server to remove friend.

		- Status: requestedUser
			Description: They requested the current user.
			Response: Attach a button labeled "Accept" that sends an update request to server to accept.

		- Status: unrelated
			Description: No request has been made between them and the current user.
			Response: Attach a button labeled "Add" that sends a post request to server to add make request.

- Images
	- Image files are stored in the server file system, seperate from their corresponding records in the database.
		- This is supposedly faster than storing the files in the database.
	- An image can have one profile as it's owner.
	- It can be used as a profile picture and it can be attached to posts.
	Image Card
		- These appear in the image dropdown, profile card, post card, and profile modal.
		- In most cases, left-clicking an image will open it in the fullsize image modal.
			- In other cases, it will either make it a profile picture, or attach it to a post.

- Posts
	- One image and/or a caption
	- Datetime of post
	- Caption is editable

PATTERNS

- rootElm property
	- rootElm property is found in cards, modals, dropdowns, and component base classes
	- it is the element that contains all html elements in those classes

- Lazy Loading
	- For most tables, there is a shortcut method in the repository class for selecting a range.

- Cards
	- Most if not all records are wrapped in a card when they return from the host in a response.

- Modals
	- Float in the center of the screen.
	- Layer on top of eachother.
		- Must close from the top, one at a time.
	- Modal base class holds shared functionality.
	- When any modal except the context menu is open, page scrolling is locked.
		

- Dropdowns (FriendDropdown, ImageDropdown)
	- Occupy left side of screen.
	- Only one can be open at a time.
	- Good for searching.
		- Wether searching by scrolling or typing, the results are compact.