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

namespace SocialMedia
{
    public class Startup
    {
        IConfigurationRoot Configuration;

        public Startup(IHostingEnvironment env)
        {
            Configuration = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json").Build();
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();

            services.AddDbContext<ApplicationDbContext>
                (options => options.UseSqlServer(
                    Configuration["Data:Profile:ConnectionString"]
                ));
            services.AddDbContext<AppIdentityDbContext>
                (options => options.UseSqlServer(
                    Configuration["Data:Identity:ConnectionString"]    
                ));

            services.AddIdentity<IdentityUser, IdentityRole>(
                opts =>
                {
                    opts.Password.RequiredLength = 4;
                    opts.Password.RequireDigit = false;
                    opts.Password.RequireUppercase = false;
                    opts.Password.RequireNonAlphanumeric = false;
                })
                .AddEntityFrameworkStores<AppIdentityDbContext>();

            services.AddTransient<IProfileRepository, EFProfileRepository>();
            services.AddTransient<IPostRepository, EFPostRepository>();
            services.AddTransient<IImageRepository, EFImageRepository>();
            services.AddTransient<IFriendRepository, EFFriendRepository>();
            services.AddTransient<ICommentRepository, EFCommentRepository>();
            services.AddTransient<ILikeRepository, EFLikeRepository>();

            services.AddScoped<CurrentProfile>(sp => SessionProfile.GetCurrentProfile(sp));
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            services.AddMemoryCache();
            services.AddSession();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            // DEVELOPMENT ENV ONLY
            app.UseStatusCodePages();
            app.UseDeveloperExceptionPage();
            // DEVELOPMENT ENV ONLY

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
