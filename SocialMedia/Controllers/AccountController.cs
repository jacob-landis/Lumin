using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SocialMedia.Models;
using SocialMedia.Models.ViewModels;
using Microsoft.AspNetCore.Hosting;

namespace SocialMedia.Controllers
{
    // controls account creation and validation, and logging in and out
    [Authorize]
    public class AccountController : Controller
    {
        private UserManager<IdentityUser> userManager;
        private SignInManager<IdentityUser> signInManager;
        private IPasswordHasher<IdentityUser> passwordHasher;
        private IProfileRepository profileRepo;
        private IPostRepository postRepo;
        private IImageRepository imageRepo;
        private IFriendRepository friendRepo;
        private ILikeRepository likeRepo;
        private ICommentRepository commentRepo;
        private CurrentProfile currentProfile;
        private readonly IHostingEnvironment env; // Used to deal with server files.

        public AccountController(
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager,
            IPasswordHasher<IdentityUser> passwordHasher, 
            IProfileRepository profileRepo,
            IPostRepository postRepo,
            IImageRepository imageRepo,
            IFriendRepository friendRepo,
            ILikeRepository likeRepo,
            ICommentRepository commentRepo,
            CurrentProfile currentProfile,
            IHostingEnvironment env)
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
            this.passwordHasher = passwordHasher;
            this.profileRepo = profileRepo;
            this.postRepo = postRepo;
            this.imageRepo = imageRepo;
            this.friendRepo = friendRepo;
            this.likeRepo = likeRepo;
            this.commentRepo = commentRepo;
            this.currentProfile = currentProfile;
            this.env = env;
        }

        [HttpPost]
        [AllowAnonymous]
        public JsonResult DoesEmailExist(string email) => // Used in Models/ViewModels/CreateModel.cs.
            Json(userManager.FindByEmailAsync(email).Result == null);

        [HttpPost]
        [AllowAnonymous]
        public JsonResult DoesPasswordExist(string password) =>
            Json(profileRepo.ByPassword(password) == null);
        
        [HttpGet]
        [AllowAnonymous] // This needs to allow anonymous because the user accessing this page won't have an account yet.
        public IActionResult Create() => View("Create"); // Returns create account page.

        [HttpPost]
        [AllowAnonymous] // This needs to allow anonymous because the user accessing this page won't have an account yet.
        public async Task<IActionResult> Create(CreateModel model)
        {
            // Make controller base class do security check on itself, and validate account creation fields.
            if (ModelState.IsValid && ValidateCreateModel(model))
            {
                IdentityUser user = new IdentityUser // Satisfy both UserName and Email field of IdentityUser with the provided email.
                {
                    UserName = model.Email,
                    Email = model.Email
                };

                // Attempt to create account and get hold onto result.
                IdentityResult result = await userManager.CreateAsync(user, model.Password);
                
                if (result.Succeeded) // Account creation succesful.
                {
                    // Retrieve the user that was just created.
                    IdentityUser id = await userManager.FindByEmailAsync(model.Email);

                    // Create Profile instance with primary key ID of IdentityUser for password, provided name, and default values.
                    // The user's Profile is retrieved using the Id of their IdentityUser.
                    Profile profile = new Profile
                    {
                        Password = id.Id, // The user will not enter this number when logging in, this will get passed behind the scenes.
                        FirstName = FirstLetterToUpper(model.FirstName), // provideded
                        LastName = FirstLetterToUpper(model.LastName),   // provideded
                        Bio = "",                    // default
                        ProfilePicture = 0,          // default
                        DateTime = DateTime.UtcNow   // default
                    };

                    // Add profile to the database.
                    profileRepo.SaveProfile(profile);

                    // Sign them in with the profile that was just added to the database.
                    currentProfile.SetProfile(profileRepo.ById(profile.ProfileId));

                    // Return home page.
                    return RedirectToAction("Index", "Home");
                }
                else // Account creation failed.
                {
                    // Transfer errors from account creation results to controller model state so they can be displayed on error page.
                    foreach (IdentityError error in result.Errors)
                    {
                        ModelState.AddModelError("", error.Description);
                    }
                }
            }

            // If controller model state or credentials were invalid, send back provided account details and or account creation result errors.
            return View(model);
        }

        [AllowAnonymous] // Must be anonymous since no one may be logged in.
        public IActionResult Login() => View(new LoginModel()); // Return login page provided with Data Annotation.

        // Attempt login
        /*
            SECURITY: this route is the only way in. A user cannot bypass this controller and get to any database. First, an IdentityUser is
            retrieved from the databse with the provided email. Second, the IdentityUser is checked in combination with the provided password.
            If successful, signinManager will have logged in the user and the correct Profile will be grabbed and set as the current profile 
            in this session. A user cannot interfere with this process.
        */
        [HttpPost]
        [AllowAnonymous] // Must be anonymous since no one may be logged in.
        [ValidateAntiForgeryToken] // Security check
        public async Task<IActionResult> Login(LoginModel loginModel)
        {
            // Make controller base class do security check on itself.
            if (ModelState.IsValid)
            {
                // Get IdentityUser by UserName (email is used for that).
                IdentityUser user = await userManager.FindByNameAsync(loginModel.Email);
                if (user != null) // If there was a result.
                {
                    await signInManager.SignOutAsync(); // Sign out current user in this session.

                    // Attempt sign in with aquired IdentityUser and provided password.
                    if ((await signInManager.PasswordSignInAsync(user, loginModel.Password, false, false)).Succeeded) // If signed in.
                    {
                        Profile profile = profileRepo.ByPassword(user.Id); // Get profile by password (Id of IdentityUser is used for that).
                        currentProfile.SetProfile(profile); // Set current profile in this session.
                        return RedirectToAction("Index","Home"); // Return home page.
                    }
                }
            }

            // If controller model state was invalid, return error message "Invalid".
            ModelState.AddModelError("", "Invalid");
            return View(loginModel);
        }

        // Log out profile and account, and redirect user to login page.
        public async Task<RedirectResult> Logout()
        {
            currentProfile.ClearProfile(); // Clear currentProfile.
            await signInManager.SignOutAsync(); // Sign out IdentityUser.
            return Redirect("Login"); // Return login page.
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult Delete() => View("Delete");

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(DeleteModel model)
        {
            if (ModelState.IsValid)
            {
                // Get IdentityUser by UserName (email is used for that).
                IdentityUser user = await userManager.FindByNameAsync(model.Email);
                if (user != null) // If there was a result.
                {
                    await signInManager.SignOutAsync(); // Sign out current user in this session.

                    // Attempt sign in with aquired IdentityUser and provided password.
                    if ((await signInManager.PasswordSignInAsync(user, model.Password, false, false)).Succeeded) // If signed in.
                    {
                        // Recursively delete data.
                        DeletePosts(currentProfile.id);
                        DeleteComments(currentProfile.id);
                        DeleteLikes(currentProfile.id);
                        DeleteFriends(currentProfile.id);
                        DeleteImages(currentProfile.id);
                        profileRepo.DeleteProfile(currentProfile.profile);

                        currentProfile.ClearProfile(); // Clear currentProfile.
                        await signInManager.SignOutAsync(); // Sign out IdentityUser.
                        await userManager.DeleteAsync(user);
                        return RedirectToAction("Index", "Home"); // Return home page.
                    }
                }
            }

            return View(model);
        }

        // ______________ UTIL

        // Validate email by creating new System.Net.Mail.MailAddress
        //  Failing to create that MailAdress throws an error, 
        //  the argument to return true is then skipped, 
        //  and false is returned in the catch
        private bool EmailIsValid(string emailaddress)
        {
            try
            {
                MailAddress m = new MailAddress(emailaddress);
                return true;
            }
            catch (FormatException)
            {
                return false;
            }
        }

        private string FirstLetterToUpper(string s) => char.ToUpper(s[0]) + s.Substring(1);

        // Enforces credential rules.
        private bool ValidateCreateModel(CreateModel model) =>

            // First Name: 1-30 chars long, alphabetic characters only.
            model.FirstName.Length > 0 &&
            model.FirstName.Length <= 30 &&
            Regex.IsMatch(model.FirstName, @"^[a-zA-Z]+$") &&

            // Last Name: 1-30 chars long, alphabetic characters only.
            model.LastName.Length > 0 &&
            model.LastName.Length <= 30 &&
            Regex.IsMatch(model.LastName, @"^[a-zA-Z]+$") &&

            // Email: 1-50 chars long, valid by EmailIsValid method standard.
            model.Email.Length > 0 &&
            model.Email.Length <= 50 &&
            EmailIsValid(model.Email) &&

            // Password: 1-100 chars long.
            model.Password.Length > 0 &&
            model.Password.Length <= 100;

        public void DeletePosts(int profileId)
        {
            if (postRepo.Posts.Where(p => p.ProfileId == profileId).Count() == 0) return;

            List<Post> posts = new List<Post>();
            foreach(Post p in postRepo.ByProfileId(profileId))
            {
                // If current user owns post, delete it.
                if (p.ProfileId == currentProfile.id)
                {
                    // Burrow into the nested dependencies and delete them on the way out.
                    // Pattern: (1)prep list, (2)fill list, (3)loop list, (4)repeat pattern on dependencies, (5)delete record.

                    List<Comment> comments = new List<Comment>(); // (1)Prep list.
                    foreach (Comment c in commentRepo.ByPostId(p.PostId)) { comments.Add(c); } // (2)Fill list.
                    foreach (Comment c in comments) // (3)Loop list.
                    {
                        // (4)Repeat pattern on dependencies.
                        List<Like> commentLikes = new List<Like>();
                        foreach (Like l in likeRepo.ByTypeAndId(2, c.CommentId)) { commentLikes.Add(l); }
                        foreach (Like l in commentLikes)
                        {
                            likeRepo.DeleteLike(l);
                        }

                        commentRepo.DeleteComment(c);
                    }

                    List<Like> postLikes = new List<Like>();
                    foreach (Like l in likeRepo.ByTypeAndId(1, p.PostId)) { postLikes.Add(l); }
                    foreach (Like l in postLikes)
                    {
                        likeRepo.DeleteLike(l);
                    }

                    posts.Add(p);
                }
            }

            // (5)Delete record.
            foreach(Post p in posts) postRepo.DeletePost(p);
        }

        public void DeleteComments(int profileId)
        {
            if (commentRepo.Comments.Where(c => c.ProfileId == profileId).Count() == 0) return;

            List<Comment> comments = new List<Comment>();
            foreach(Comment c in commentRepo.Comments.Where(c => c.ProfileId == profileId)) comments.Add(c);

            foreach (Comment c in comments) commentRepo.DeleteComment(c);
        }

        public void DeleteLikes(int profileId)
        {
            if (likeRepo.Likes.Where(l => l.ProfileId == profileId).Count() == 0) return;

            List<Like> likes = new List<Like>();
            foreach (Like l in likeRepo.Likes.Where(l => l.ProfileId == profileId)) likes.Add(l);

            foreach (Like l in likes) likeRepo.DeleteLike(l);
        }

        public void DeleteImages(int profileId)
        {
            if (imageRepo.Images.Where(i => i.ProfileId == profileId).Count() == 0) return;

            List<Image> images = new List<Image>();
            foreach(Image i in imageRepo.ByProfileId(profileId))
            {
                // Remove fullsize and thumbnail images from file system.
                ApiImageController.DeleteFromFileSystem(i.Name, env.WebRootPath);

                images.Add(i);
            }

            foreach(Image i in images) imageRepo.DeleteImage(i);
        }

        public void DeleteFriends(int profileId)
        {
            List<Friend> friends = new List<Friend>();
            foreach (Friend f in friendRepo.ByFromId(profileId, false)) friends.Add(f);
            foreach (Friend f in friendRepo.ByFromId(profileId, true)) friends.Add(f);
            foreach (Friend f in friendRepo.ByToId(profileId, false)) friends.Add(f);
            foreach (Friend f in friendRepo.ByToId(profileId, true)) friends.Add(f);

            if (friends.Count() == 0) return;

            foreach (Friend f in friends) friendRepo.DeleteFriend(f);
        }
    }
}