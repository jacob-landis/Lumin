using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.ViewModels
{
    public class LoginModel
    {
        [Required(ErrorMessage = "Please enter an email address")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Please enter a password")]
        [UIHint("password")]
        public string Password { get; set; }
    }
}
