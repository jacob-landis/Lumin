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
    [Authorize]
    public class AccountController : Controller
    {
        private UserManager<IdentityUser> userManager;
        private SignInManager<IdentityUser> signInManager;
        private IPasswordHasher<IdentityUser> passwordHasher;
        private IProfileRepository profileRepo;
        private CurrentProfile currentProfile;

        public AccountController(
            UserManager<IdentityUser> UM,
            SignInManager<IdentityUser> SIM,
            IPasswordHasher<IdentityUser> PH,
            IProfileRepository PR, CurrentProfile CP)
        {
            userManager = UM;
            signInManager = SIM;
            passwordHasher = PH;
            profileRepo = PR;
            currentProfile = CP;
        }

        [HttpPost]
        [AllowAnonymous]
        public JsonResult DoesEmailExist(string email) =>
            Json(userManager.FindByEmailAsync(email).Result == null);

        [HttpPost]
        [AllowAnonymous]
        public JsonResult DoesPasswordExist(string password) =>
            Json(profileRepo.ByPassword(password) == null);

        [HttpGet]
        [AllowAnonymous]
        public IActionResult Create() => View("Create");

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create(CreateModel model)
        {
            if (ModelState.IsValid && ValidateCreateModel(model))
            {
                IdentityUser user = new IdentityUser
                {
                    UserName = model.Email,
                    Email = model.Email
                };

                IdentityResult result = await userManager.CreateAsync(user, model.Password);
                
                if (result.Succeeded)
                {
                    IdentityUser id = await userManager.FindByEmailAsync(model.Email);
                    Profile profile = new Profile
                    {
                        Password = id.Id,
                        FirstName = model.FirstName,
                        LastName = model.LastName,
                        Bio = "",
                        ProfilePicture = 0
                    };
                    profileRepo.SaveProfile(profile);

                    // Sign them in
                    currentProfile.SetProfile(profileRepo.ById(profile.ProfileId));
                    return RedirectToAction("Index", "Home");
                }
                else
                {
                    foreach (IdentityError error in result.Errors)
                    {
                        ModelState.AddModelError("", error.Description);
                    }
                }
            }
            return View(model);
        }

        [AllowAnonymous]
        public IActionResult Login()
        {
            return View(new LoginModel());
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginModel loginModel)
        {
            if (ModelState.IsValid)
            {
                IdentityUser user = await userManager.FindByNameAsync(loginModel.Email);
                if (user != null)
                {
                    await signInManager.SignOutAsync();
                    if ((await signInManager.PasswordSignInAsync(user, loginModel.Password, false, false)).Succeeded)
                    {
                        Profile profile = profileRepo.ByPassword(user.Id);
                        currentProfile.SetProfile(profile);
                        return RedirectToAction("Index","Home");
                    }
                }
            }
            ModelState.AddModelError("", "Invalid");
            return View(loginModel);
        }

        public async Task<RedirectResult> Logout()
        {
            currentProfile.ClearProfile();
            await signInManager.SignOutAsync();
            return Redirect("Login");
        }

        // ______________ UTIL

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

        private bool ValidateCreateModel(CreateModel model) =>
            // First Name
            model.FirstName.Length > 0 &&
            model.FirstName.Length <= 30 &&
            Regex.IsMatch(model.FirstName, @"^[a-zA-Z]+$") &&

            // Last Name
            model.LastName.Length > 0 &&
            model.LastName.Length <= 30 &&
            Regex.IsMatch(model.LastName, @"^[a-zA-Z]+$") &&

            // Email
            model.Email.Length > 0 &&
            model.Email.Length <= 50 &&
            EmailIsValid(model.Email) &&

            // Password
            model.Password.Length > 0 &&
            model.Password.Length <= 100;
    }
}