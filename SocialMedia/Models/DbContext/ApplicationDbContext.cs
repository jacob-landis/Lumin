using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    /*
        Bridges the EF Core and the application, and provides access to the data using model objs.
    */
    public class ApplicationDbContext : DbContext
    {
        // Options are provided in Startup and then from here are passed to the DbContext base class.
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) {}

        // Each of these provide access to specific tables.
        public DbSet<Profile> Profiles { get; set; }
        public DbSet<Friend> Friends { get; set; }
        public DbSet<Image> Images { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Like> Likes { get; set; }
    }
}
