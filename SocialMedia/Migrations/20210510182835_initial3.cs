using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace SocialMedia.Migrations
{
    public partial class initial3 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DateAccpted",
                table: "Friends",
                newName: "DateAccepted");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateTime",
                table: "Profiles",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "ProfileBioPrivacyLevel",
                table: "Profiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ProfileColor",
                table: "Profiles",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProfileFriendsPrivacyLevel",
                table: "Profiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ProfileImagesPrivacyLevel",
                table: "Profiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ProfilePicturePrivacyLevel",
                table: "Profiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ProfilePostsPrivacyLevel",
                table: "Profiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PrivacyLevel",
                table: "Posts",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Height",
                table: "Images",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PrivacyLevel",
                table: "Images",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Width",
                table: "Images",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "BlockerProfileId",
                table: "Friends",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateTime",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "ProfileBioPrivacyLevel",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "ProfileColor",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "ProfileFriendsPrivacyLevel",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "ProfileImagesPrivacyLevel",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "ProfilePicturePrivacyLevel",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "ProfilePostsPrivacyLevel",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "PrivacyLevel",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "Height",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "PrivacyLevel",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "Width",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "BlockerProfileId",
                table: "Friends");

            migrationBuilder.RenameColumn(
                name: "DateAccepted",
                table: "Friends",
                newName: "DateAccpted");
        }
    }
}
