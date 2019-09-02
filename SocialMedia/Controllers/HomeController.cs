using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SocialMedia.Models;

namespace SocialMedia.Controllers
{
    public class HomeController : Controller
    {
        private CurrentProfile currentProfile;
        private IProfileRepository profileRepo;

        public HomeController(CurrentProfile currentProfile, IProfileRepository profileRepo)
        {
            this.currentProfile = currentProfile;
            this.profileRepo = profileRepo;
        }

        public IActionResult Index()
        {
            if (currentProfile.profile == null) return RedirectToAction("Login", "Account");
            currentProfile.SetProfile(profileRepo.ById(currentProfile.profile.ProfileId)); // Refreshes current profile
            return View(currentProfile.id);
        }
    }
}