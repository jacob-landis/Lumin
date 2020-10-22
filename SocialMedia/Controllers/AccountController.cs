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

namespace SocialMedia.Controllers
{
    // controls account creation and validation, and logging in and out
    [Authorize]
    public class AccountController : Controller
    {
        private UserManager<IdentityUser> userManager;
        private SignInManager<IdentityUser> signInManager;
        private IPasswordHasher<IdentityUser> passwordHasher; // XXX WHERE IS THIS USED?
        private IProfileRepository profileRepo;
        private CurrentProfile currentProfile;

        public AccountController(
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager,
            IPasswordHasher<IdentityUser> passwordHasher,
            IProfileRepository profileRepo, 
            CurrentProfile currentProfile)
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
            this.passwordHasher = passwordHasher;
            this.profileRepo = profileRepo;
            this.currentProfile = currentProfile;
        }

        [HttpPost]
        [AllowAnonymous]
        public JsonResult DoesEmailExist(string email) => // used in Models/ViewModels/CreateModel.cs
            Json(userManager.FindByEmailAsync(email).Result == null);

        [HttpPost]
        [AllowAnonymous]
        public JsonResult DoesPasswordExist(string password) => // XXX I think this logic is automated by DataAnnotations. Please confirm
            Json(profileRepo.ByPassword(password) == null);
        
        [HttpGet]
        [AllowAnonymous] // needs to be public since the user accessing this page won't have an account yet
        public IActionResult Create() => View("Create"); // returns create account page

        [HttpPost]
        [AllowAnonymous] // needs to be public since the user accessing this page won't have an account yet
        public async Task<IActionResult> Create(CreateModel model)
        {
            // Make controller base class do security check on itself, and validate account creation fields
            if (ModelState.IsValid && ValidateCreateModel(model))
            {
                IdentityUser user = new IdentityUser // satisfy both UserName and Email field of IdentityUser with the provided email
                {
                    UserName = model.Email,
                    Email = model.Email
                };

                // attempt to create account and get hold onto result
                IdentityResult result = await userManager.CreateAsync(user, model.Password);
                
                if (result.Succeeded) // account creation succesful
                {
                    // retrieve the user that was just created
                    IdentityUser id = await userManager.FindByEmailAsync(model.Email);

                    // create Profile instance with primary key ID of IdentityUser for password, provided name, and default values
                    // The user's Profile is retrieved using the Id of their IdentityUser
                    Profile profile = new Profile
                    {
                        Password = id.Id, // the user will not enter this number when logging in, this will get passed behind the scenes
                        FirstName = model.FirstName, // provideded
                        LastName = model.LastName,   // provideded
                        Bio = "",          // default
                        ProfilePicture = 0 // default
                    };

                    // add profile to the database
                    profileRepo.SaveProfile(profile);

                    // Sign them in with the profile that was just added to the database
                    currentProfile.SetProfile(profileRepo.ById(profile.ProfileId));

                    // return home page
                    return RedirectToAction("Index", "Home");
                }
                else // account creation failed
                {
                    // transfer errors from account creation results to controller model state so they can be displayed on error page
                    foreach (IdentityError error in result.Errors)
                    {
                        ModelState.AddModelError("", error.Description);
                    }
                }
            }

            // if controller model state or credentials were invalid, send back provided account details and or account creation result errors
            return View(model);
        }

        [AllowAnonymous] // must be anonymous since no one may be logged in
        public IActionResult Login() => View(new LoginModel()); // return login page provided with Data Annotation

        // attempt login
        /*
            SECURITY: this route is the only way in. A user cannot bypass this controller and get to any database. First, an IdentityUser is
            retrieved from the databse with the provided email. Second, the IdentityUser is checked in combination with the provided password.
            If successful, signinManager will have logged in the user and the correct Profile will be grabbed and set as the current profile 
            in this session. A user cannot interfere with this process.
        */
        [HttpPost]
        [AllowAnonymous] // must be anonymous since no one may be logged in
        [ValidateAntiForgeryToken] // security check
        public async Task<IActionResult> Login(LoginModel loginModel)
        {
            // Make controller base class do security check on itself
            if (ModelState.IsValid)
            {
                // get IdentityUser by UserName (email is used for that)
                IdentityUser user = await userManager.FindByNameAsync(loginModel.Email);
                if (user != null) // if there was a result
                {
                    await signInManager.SignOutAsync(); // sign out current user in this session

                    // attempt sign in with aquired IdentityUser and provided password
                    if ((await signInManager.PasswordSignInAsync(user, loginModel.Password, false, false)).Succeeded) // if signed in
                    {
                        Profile profile = profileRepo.ByPassword(user.Id); // get profile by password (Id of IdentityUser is used for that)
                        currentProfile.SetProfile(profile); // set current profile in this session
                        return RedirectToAction("Index","Home"); // return home page
                    }
                }
            }

            // if controller model state was invalid, return error message: "Invalid"
            ModelState.AddModelError("", "Invalid");
            return View(loginModel);
        }

        // log out profile and account, and redirect user to login page XXX where is this used?
        public async Task<RedirectResult> Logout()
        {
            currentProfile.ClearProfile(); // clear currentProfile
            await signInManager.SignOutAsync(); // sign out IdentityUser
            return Redirect("Login"); // return login page
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

        private string FirstLetterToUpper(string s) => char.ToUpper(s[0]) + s.Substring(1); // XXX WHERE IS THIS USED?

        // enforces credential rules
        private bool ValidateCreateModel(CreateModel model) => // XXX this may be handles in CreateModel.cs

            // First Name: 1-30 chars long, alphabetic characters only
            model.FirstName.Length > 0 &&
            model.FirstName.Length <= 30 &&
            Regex.IsMatch(model.FirstName, @"^[a-zA-Z]+$") &&

            // Last Name: 1-30 chars long, alphabetic characters only
            model.LastName.Length > 0 &&
            model.LastName.Length <= 30 &&
            Regex.IsMatch(model.LastName, @"^[a-zA-Z]+$") &&

            // Email: 1-50 chars long, valid by EmailIsValid method standard
            model.Email.Length > 0 &&
            model.Email.Length <= 50 &&
            EmailIsValid(model.Email) &&

            // Password: 1-100 chars long
            model.Password.Length > 0 &&
            model.Password.Length <= 100;
    }
}