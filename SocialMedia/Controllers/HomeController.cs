using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SocialMedia.Models;

namespace SocialMedia.Controllers
{
    /*
         Redirects user to home page.
    */
    public class HomeController : Controller
    {
        private IProfileRepository profileRepo;
        private CurrentProfile currentProfile;

        public HomeController(IProfileRepository profileRepo, CurrentProfile currentProfile)
        {
            this.profileRepo = profileRepo;
            this.currentProfile = currentProfile;
        }

        /*
            Returns home page to user.
        */
        public IActionResult Index()
        {
            // If someone is logged in, bring them home.
            if (currentProfile.profile == null) return RedirectToAction("Login", "Account");
            
            currentProfile.SetProfile(profileRepo.ById(currentProfile.profile.ProfileId)); // Refreshes current profile

            // Returns home page to user with their ProfileID attached.
            return View(currentProfile.id);
        }
    }
}