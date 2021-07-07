using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.ViewModels
{
    public class DeleteModel
    {
        /*
            This field must contain at least 1 character. 
        */
        [Required(ErrorMessage = "Please enter an email address")]
        public string Email { get; set; }

        /*
            This field must contain at least 1 character. 
        */
        [Required(ErrorMessage = "Please enter a password")]
        [UIHint("password")]
        public string Password { get; set; }
    }
}
