using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.ViewModels
{
    public class CreateModel
    {
        [Required(ErrorMessage = "Please enter a first name")]
        [StringLength(30, ErrorMessage = "Your first name must be 30 characters or less in length")]
        [RegularExpression(@"^[a-zA-Z]+$", ErrorMessage = "Please only use letters for names")]
        public string FirstName { get; set; }
        
        [Required(ErrorMessage = "Please enter a last name")]
        [StringLength(30, ErrorMessage = "Your last name must be 30 characters or less in length")]
        [RegularExpression(@"^[a-zA-Z]+$", ErrorMessage = "Please only use letters for names")]
        public string LastName { get; set; }

        [Required(ErrorMessage = "Please enter an email address")]
        [StringLength(50, ErrorMessage = "Your email address must be 50 characters or less in length")]
        [EmailAddress(ErrorMessage = "You must enter a valid email address")]
        [Remote("DoesEmailExist", "Account", HttpMethod = "POST", ErrorMessage = "This email address already exists. Please choose a differnt email address")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Please enter a password")]
        [StringLength(100, ErrorMessage = "Your password must be XXX characters or less in length")]
        [UIHint("password")]
        public string Password { get; set; }
    }
}
