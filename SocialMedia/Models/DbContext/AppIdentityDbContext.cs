using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    /*
        Bridges the EF Core and the application, and provides access to the data using model objs.
        AppIdentityDb tables are not accessed directly, but instead through AspNetCore.Identity classes (SigninManager and UserManager).
    */
    public class AppIdentityDbContext : IdentityDbContext<IdentityUser>
    {
        // Options are provided in Startup and then from here are passed to the DbContext base class.
        public AppIdentityDbContext(DbContextOptions<AppIdentityDbContext> options) : base(options) {}
    }
}
