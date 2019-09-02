using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace SocialMedia.Migrations
{
    public partial class inital2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Comments_Posts_PostId",
                table: "Comments");

            migrationBuilder.DropForeignKey(
                name: "FK_Comments_Profiles_ProfileId",
                table: "Comments");

            migrationBuilder.DropForeignKey(
                name: "FK_Friends_Profiles_FromId",
                table: "Friends");

            migrationBuilder.DropForeignKey(
                name: "FK_Images_Profiles_ProfileId",
                table: "Images");

            migrationBuilder.DropForeignKey(
                name: "FK_Posts_Images_ImageId",
                table: "Posts");

            migrationBuilder.DropForeignKey(
                name: "FK_Posts_Profiles_ProfileId",
                table: "Posts");

            migrationBuilder.DropTable(
                name: "CommentLikes");

            migrationBuilder.DropTable(
                name: "PostLikes");

            migrationBuilder.DropIndex(
                name: "IX_Posts_ImageId",
                table: "Posts");

            migrationBuilder.DropIndex(
                name: "IX_Posts_ProfileId",
                table: "Posts");

            migrationBuilder.DropIndex(
                name: "IX_Images_ProfileId",
                table: "Images");

            migrationBuilder.DropIndex(
                name: "IX_Friends_FromId",
                table: "Friends");

            migrationBuilder.DropIndex(
                name: "IX_Comments_PostId",
                table: "Comments");

            migrationBuilder.DropIndex(
                name: "IX_Comments_ProfileId",
                table: "Comments");

            migrationBuilder.AlterColumn<int>(
                name: "ToId",
                table: "Friends",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddColumn<bool>(
                name: "HasSeen",
                table: "Comments",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "Likes",
                columns: table => new
                {
                    LikeId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    DateTime = table.Column<DateTime>(nullable: false),
                    ProfileId = table.Column<int>(nullable: true),
                    ContentType = table.Column<int>(nullable: false),
                    ContentId = table.Column<int>(nullable: true),
                    HasSeen = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Likes", x => x.LikeId);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Likes");

            migrationBuilder.DropColumn(
                name: "HasSeen",
                table: "Comments");

            migrationBuilder.AlterColumn<int>(
                name: "ToId",
                table: "Friends",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "CommentLikes",
                columns: table => new
                {
                    CommentLikeId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CommentId = table.Column<int>(nullable: true),
                    DateTime = table.Column<DateTime>(nullable: false),
                    ProfileId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommentLikes", x => x.CommentLikeId);
                    table.ForeignKey(
                        name: "FK_CommentLikes_Comments_CommentId",
                        column: x => x.CommentId,
                        principalTable: "Comments",
                        principalColumn: "CommentId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CommentLikes_Profiles_ProfileId",
                        column: x => x.ProfileId,
                        principalTable: "Profiles",
                        principalColumn: "ProfileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PostLikes",
                columns: table => new
                {
                    PostLikeId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    DateTime = table.Column<DateTime>(nullable: false),
                    PostId = table.Column<int>(nullable: true),
                    ProfileId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostLikes", x => x.PostLikeId);
                    table.ForeignKey(
                        name: "FK_PostLikes_Posts_PostId",
                        column: x => x.PostId,
                        principalTable: "Posts",
                        principalColumn: "PostId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PostLikes_Profiles_ProfileId",
                        column: x => x.ProfileId,
                        principalTable: "Profiles",
                        principalColumn: "ProfileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Posts_ImageId",
                table: "Posts",
                column: "ImageId");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_ProfileId",
                table: "Posts",
                column: "ProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Images_ProfileId",
                table: "Images",
                column: "ProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Friends_FromId",
                table: "Friends",
                column: "FromId");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_PostId",
                table: "Comments",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_ProfileId",
                table: "Comments",
                column: "ProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_CommentLikes_CommentId",
                table: "CommentLikes",
                column: "CommentId");

            migrationBuilder.CreateIndex(
                name: "IX_CommentLikes_ProfileId",
                table: "CommentLikes",
                column: "ProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_PostLikes_PostId",
                table: "PostLikes",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_PostLikes_ProfileId",
                table: "PostLikes",
                column: "ProfileId");

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_Posts_PostId",
                table: "Comments",
                column: "PostId",
                principalTable: "Posts",
                principalColumn: "PostId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_Profiles_ProfileId",
                table: "Comments",
                column: "ProfileId",
                principalTable: "Profiles",
                principalColumn: "ProfileId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Friends_Profiles_FromId",
                table: "Friends",
                column: "FromId",
                principalTable: "Profiles",
                principalColumn: "ProfileId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Images_Profiles_ProfileId",
                table: "Images",
                column: "ProfileId",
                principalTable: "Profiles",
                principalColumn: "ProfileId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Posts_Images_ImageId",
                table: "Posts",
                column: "ImageId",
                principalTable: "Images",
                principalColumn: "ImageId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Posts_Profiles_ProfileId",
                table: "Posts",
                column: "ProfileId",
                principalTable: "Profiles",
                principalColumn: "ProfileId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
