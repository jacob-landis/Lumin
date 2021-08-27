using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SocialMedia.Infrastructure;
using SocialMedia.Models;
using SocialMedia.Models.Session;

namespace SocialMedia
{
    /*
        Starts and sets up the application.
        The methods in this class are called at runtime.
    */
    public class Startup
    {
        IConfigurationRoot Configuration;

        /*
            Configure path to app settings. 
        */
        public Startup(IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                Configuration = new ConfigurationBuilder()
                    .SetBasePath(env.ContentRootPath)
                    .AddJsonFile("appsettings.Development.json")
                    .Build();
            }
            else if (env.IsProduction())
            {
                Configuration = new ConfigurationBuilder()
                    .SetBasePath(env.ContentRootPath)
                    .AddJsonFile("appsettings.json")
                    .Build();
            }
        }

        /*
            Configure services. 
        */
        public void ConfigureServices(IServiceCollection services)
        {
            // Add MVC services.
            services.AddMvc();

            // Add Db context service for Application and provide connection string.
            services.AddDbContext<ApplicationDbContext>
                (options => options.UseSqlServer(Configuration["Data:Profile:ConnectionString"]));

            // Add Db context service for Identity and provide connection string.
            services.AddDbContext<AppIdentityDbContext>
                (options => options.UseSqlServer(Configuration["Data:Identity:ConnectionString"]));

            // Add Identity service, configure options, and add EF stores for user storage.
            // This is another layer of validation.
            services.AddIdentity<IdentityUser, IdentityRole>(
                opts =>
                {
                    opts.Password.RequiredLength = 4;
                    opts.Password.RequireDigit = false;
                    opts.Password.RequireUppercase = false;
                    opts.Password.RequireNonAlphanumeric = false;
                })
                .AddEntityFrameworkStores<AppIdentityDbContext>();

            // Dependency injection for repositories.
            services.AddTransient<IProfileRepository, EFProfileRepository>();
            services.AddTransient<IPostRepository, EFPostRepository>();
            services.AddTransient<IImageRepository, EFImageRepository>();
            services.AddTransient<IFriendRepository, EFFriendRepository>();
            services.AddTransient<ICommentRepository, EFCommentRepository>();
            services.AddTransient<ILikeRepository, EFLikeRepository>();

            // This service is used in most controllers to verify the user.
            services.AddScoped<CurrentProfile>(sp => SessionProfile.GetCurrentProfile(sp));
            services.AddScoped<SessionResults>(sp => SessionResults.GetSessionResults(sp));
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            services.AddMemoryCache();
            services.AddSession();
        }
        
        /*
            Configure environment and HTTP routing pipelines.
        */
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseStatusCodePages();
                app.UseDeveloperExceptionPage();
            }

            app.UseStaticFiles();
            app.UseSession();
            app.UseIdentity();

            app.UseMvc(
                routes =>
                {
                    routes.MapRoute(
                        name: null,
                        template: "Create",
                        defaults: new { Controller = "Account", action = "Create" }
                        );

                    routes.MapRoute(
                        name: "null",
                        template: "",
                        defaults: new { Controller = "Home", action = "Index"}
                        );

                    routes.MapRoute(
                        name: null,
                        template: "{controller}/{action}/{id?}"
                        );
                });
        }
    }
}
