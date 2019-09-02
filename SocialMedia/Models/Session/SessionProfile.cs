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
    public class SessionProfile : CurrentProfile
    {
        [JsonIgnore]
        public ISession Session { get; set; }

        public static CurrentProfile GetCurrentProfile(IServiceProvider services)
        {
            ISession session = services.GetRequiredService<IHttpContextAccessor>()?
                .HttpContext.Session;

            SessionProfile currentProfile = session?.GetJson<SessionProfile>("Profile") ??
                new SessionProfile();

            currentProfile.Session = session;
            return currentProfile;
        }

        public override void SetProfile(Profile profile)
        {
            base.SetProfile(profile);
            Session.SetJson("Profile", this);
        }

        public override void ClearProfile()
        {
            base.ClearProfile();
            Session.SetJson("Profile", this);
        }
    }
}
