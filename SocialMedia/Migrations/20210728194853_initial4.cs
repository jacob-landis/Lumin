using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace SocialMedia.Migrations
{
    public partial class initial4 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateAccepted",
                table: "Friends");

            migrationBuilder.RenameColumn(
                name: "DateSent",
                table: "Friends",
                newName: "StatusChangeDate");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "StatusChangeDate",
                table: "Friends",
                newName: "DateSent");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateAccepted",
                table: "Friends",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }
    }
}
