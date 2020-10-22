using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using SocialMedia.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    /*
        Manages current profile storage in session.
    */
    public class SessionProfile : CurrentProfile
    {
        /*
             Prevents endless recursion.
        */
        [JsonIgnore]
        public ISession Session { get; set; }

        /*
            Returns copy of itself if it has been instantiated or returns new blank instance.
        */
        public static CurrentProfile GetCurrentProfile(IServiceProvider services)
        {
            // Get handle on this server session.
            ISession serverSession = services.GetRequiredService<IHttpContextAccessor>()?
                .HttpContext.Session;

            // Look in JSON bank of current session for profile field.
            // If HttpContext.Session was null, create a blank SessionProfile.
            SessionProfile currentSessionProfile = serverSession?.GetJson<SessionProfile>("Profile") ??
                new SessionProfile();

            // Sets Session to this server session (default session if new instance).
            currentSessionProfile.Session = serverSession;

            // Caller only takes base obj (CurrentProfile).
            return currentSessionProfile;
        }

        /*
             Update this sessions CurrentProfile as well as it's JSON counterpart.
        */
        public override void SetProfile(Profile profile)
        {
            // Update this cs obj (more specifically, it's base).
            base.SetProfile(profile);

            // Update the JSON version of this cs obj in the sessions JSON bank.
            Session.SetJson("Profile", this); 
        }

        /*
             Clear this sessions CurrentProfile as well as it's JSON counterpart.
        */
        public override void ClearProfile()
        {
            // Clear profile from base obj.
            base.ClearProfile();
            
            // Set index with value of "Profile" in this sessions JSON bank back to defualt.
            Session.SetJson("Profile", this); 
        }
    }
}
